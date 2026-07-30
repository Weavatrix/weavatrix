import {spawnSync} from 'node:child_process'
import {mkdtempSync, rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {
    McpClient,
    PROJECT_ROOT,
    compareEvidence,
    findRustIncompleteCapabilities,
    git,
    relativeManifestIdentity,
    round,
    RUST_INCOMPLETE_CAPABILITY_TOKENS,
    stableHash,
} from '../tool-harness-lib.mjs'
import {crossRepositoryFixture, evidenceScope, fixtureFor} from './fixtures.mjs'
export async function compareRepository(entry, context, onProgress) {
    const scratch = mkdtempSync(join(tmpdir(), `weavatrix-parity-${entry.id}-`))
    let rust
    let javascript
    const result = emptyRepositoryResult(entry)
    onProgress(result, progress(entry.id, null, null, result.status))
    try {
        const prepared = await prepareEngines(entry, scratch, context)
        rust = prepared.rust
        javascript = prepared.javascript
        Object.assign(result, prepared.report)
        result.status = 'running'
        onProgress(result, progress(entry.id, null, 'graph_stats', 'warmup-complete'))
        await compareTools(entry, result, {rust, javascript}, context, onProgress)
        result.status = 'complete'
        onProgress(result, progress(entry.id, null, null, result.status))
        return result
    } finally {
        await Promise.allSettled([rust?.close(), javascript?.close()].filter(Boolean))
        rmSync(scratch, {recursive: true, force: true})
    }
}
async function prepareEngines(entry, scratch, context) {
    const jsGraphPath = join(scratch, 'graph.json')
    const jsBuildStarted = performance.now()
    const build = spawnSync(process.execPath, [
        join(PROJECT_ROOT, 'scripts', 'build-javascript-graph.mjs'),
        context.jsRoot,
        entry.absolutePath,
        jsGraphPath,
    ], {
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
        timeout: context.options.timeoutMs,
        windowsHide: true,
    })
    if (build.error || build.status !== 0) {
        throw new Error([
            'isolated JavaScript graph build failed',
            build.error?.message,
            build.stderr,
            build.stdout,
        ].filter(Boolean).join(': '))
    }
    const jsBuildMs = round(performance.now() - jsBuildStarted)
    const javascript = new McpClient(process.execPath, [
        join(context.jsRoot, 'src', 'mcp-server.mjs'),
        jsGraphPath,
        entry.absolutePath,
        'offline',
    ], {cwd: context.jsRoot, timeoutMs: context.options.timeoutMs})
    const rust = new McpClient(context.rustBin, ['mcp', entry.absolutePath, '--profile=all'], {
        cwd: PROJECT_ROOT,
        timeoutMs: context.options.timeoutMs,
    })
    const initializeStarted = performance.now()
    const [javascriptInitialize, rustInitialize] = await Promise.all([
        initializeSafely(javascript),
        initializeSafely(rust),
    ])
    const [rustWarm, javascriptWarm] = await Promise.all([
        callSafely(rust, 'graph_stats', {output_format: 'json'}),
        callSafely(javascript, 'graph_stats', {output_format: 'json'}),
    ])
    return {
        rust,
        javascript,
        report: {
            initialization: {
                rust: initializationSummary(rustInitialize),
                javascript: initializationSummary(javascriptInitialize),
            },
            setupMs: {
                rustColdGraphAndFirstTool: rustWarm.wallMs,
                javascriptColdGraph: jsBuildMs,
                javascriptWarmupAfterPrebuild: javascriptWarm.wallMs,
                initializeBoth: round(performance.now() - initializeStarted),
            },
            graphInventory: {
                rust: rustWarm.response.ok ? rustWarm.response.value : {error: rustWarm.response.error},
                javascript: javascriptWarm.response.ok
                    ? summarizeForInventory(javascriptWarm.response.value)
                    : {error: javascriptWarm.response.error},
            },
        },
    }
}

async function compareTools(entry, result, clients, context, onProgress) {
    const crossFixture = crossRepositoryFixture(entry, context.corpus)
    for (const [callIndex, tool] of context.tools.entries()) {
        process.stderr.write(`\n${entry.id} [${callIndex + 1}/${context.tools.length}] ${tool}... `)
        const compared = await compareOneTool(
            entry,
            tool,
            callIndex,
            fixtureFor(tool, entry, crossFixture),
            clients,
            context,
        )
        result.tools.push(compared)
        process.stderr.write(`${compared.comparison.classification}\n`)
        onProgress(result, progress(entry.id, callIndex, tool, 'call-complete'))
    }
}

async function compareOneTool(entry, tool, callIndex, args, clients, context) {
    const timingPairs = []
    let rustResult
    let javascriptResult
    for (let sample = 0; sample < context.options.timingSamples; sample += 1) {
        const rustFirst = (callIndex + sample) % 2 === 0
        if (rustFirst) {
            rustResult = await callSafely(clients.rust, tool, args)
            javascriptResult = await callSafely(clients.javascript, tool, args)
        } else {
            javascriptResult = await callSafely(clients.javascript, tool, args)
            rustResult = await callSafely(clients.rust, tool, args)
        }
        timingPairs.push({
            sample: sample + 1,
            order: rustFirst ? ['rust', 'javascript'] : ['javascript', 'rust'],
            rustMs: rustResult.wallMs,
            javascriptMs: javascriptResult.wallMs,
            rustOk: rustResult.response.ok,
            javascriptOk: javascriptResult.response.ok,
        })
    }
    const rustMedian = median(timingPairs.map((pair) => pair.rustMs))
    const javascriptMedian = median(timingPairs.map((pair) => pair.javascriptMs))
    const comparison = compareEvidence(
        tool,
        context.contracts[tool],
        rustResult.response,
        javascriptResult.response,
    )
    const findings = rustResult.response.ok
        ? findRustIncompleteCapabilities(rustResult.response.value)
        : []
    comparison.invariants = [...(comparison.invariants || []), {
        name: `all ${context.options.timingSamples} paired timing calls succeeded`,
        pass: timingPairs.every((pair) => pair.rustOk && pair.javascriptOk),
    }]
    return toolResult({
        entry, tool, callIndex, args, timingPairs, rustMedian, javascriptMedian,
        comparison, findings, rustResult, javascriptResult, clients, context,
    })
}

function toolResult(details) {
    const {entry, tool, callIndex, args, timingPairs, rustMedian, javascriptMedian,
        comparison, findings, rustResult, javascriptResult, clients, context} = details
    return {
        tool,
        callIndex,
        scope: evidenceScope(entry, tool, args),
        fixtureHash: stableHash(args),
        fixture: args,
        timingMs: {
            statistic: 'median',
            pairedSamples: context.options.timingSamples,
            rust: rustMedian,
            javascript: javascriptMedian,
            javascriptOverRust: rustMedian > 0 ? round(javascriptMedian / rustMedian) : null,
            samples: timingPairs,
        },
        comparison,
        rustIncompleteCapabilityGate: {
            engine: 'rust',
            checked: rustResult.response.ok,
            pass: findings.length === 0,
            forbiddenExactValues: RUST_INCOMPLETE_CAPABILITY_TOKENS,
            findings,
        },
        errors: {
            rust: engineError(rustResult, clients.rust),
            javascript: engineError(javascriptResult, clients.javascript),
        },
        ...(context.options.includeOutput ? {
            output: {
                rust: outputForReport(rustResult.response),
                javascript: outputForReport(javascriptResult.response),
            },
        } : {}),
    }
}

async function callSafely(client, tool, args) {
    const started = performance.now()
    try {
        return await client.call(tool, args)
    } catch (error) {
        return failedCall(error, client, round(performance.now() - started))
    }
}

async function initializeSafely(client) {
    try {
        return await client.initialize()
    } catch (error) {
        return {
            error: {
                message: String(error?.message || error),
                stderr: String(error?.stderr || client.stderr || ''),
            },
        }
    }
}

function failedCall(error, client, wallMs = null) {
    const failure = {
        error: String(error?.message || error),
        stderr: String(error?.stderr || client?.stderr || ''),
    }
    return {
        wallMs,
        failure,
        response: {
            ok: false,
            error: failure.error,
            responseSchema: {kind: 'harness-exception'},
        },
    }
}

function engineError(result, client) {
    if (result.failure) return result.failure
    if (result.response.ok) return null
    return {error: result.response.error, stderr: String(client?.stderr || '')}
}

function outputForReport(response) {
    return response.ok ? response.value : {error: response.error}
}

function summarizeForInventory(value) {
    if (!value || typeof value !== 'object') return value
    return Object.fromEntries(Object.entries(value).filter(([key]) =>
        /(node|edge|communit|relation|kind|build|fresh|precision|version)/i.test(key)))
}

function initializationSummary(message) {
    if (message?.error) {
        return {ok: false, error: message.error.message || String(message.error)}
    }
    return {
        ok: true,
        protocolVersion: message?.result?.protocolVersion || null,
        serverInfo: message?.result?.serverInfo || null,
    }
}

function median(values) {
    const sorted = values.filter(Number.isFinite).sort((left, right) => left - right)
    if (sorted.length === 0) return null
    const middle = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 1
        ? round(sorted[middle])
        : round((sorted[middle - 1] + sorted[middle]) / 2)
}

function safeRevision(repository) {
    try {
        return git(repository, ['rev-parse', 'HEAD'])
    } catch {
        return null
    }
}

function emptyRepositoryResult(entry) {
    return {
        repository: relativeManifestIdentity(entry),
        revision: safeRevision(entry.absolutePath),
        initialization: null,
        setupMs: null,
        graphInventory: null,
        tools: [],
        status: 'preparing',
    }
}

function progress(repository, callIndex, tool, state) {
    return {repository, callIndex, tool, state}
}
