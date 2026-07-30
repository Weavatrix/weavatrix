import {mkdirSync, mkdtempSync, rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join, resolve} from 'node:path'
import {installEngine} from './install.mjs'
import {prepareEnginePackages} from './package-input.mjs'
import {
    allInvariantsPass,
    buildPerformanceGate,
    summarizeEngine,
    summarizeReport,
} from './report.mjs'
import {benchmarkSession} from './session.mjs'
import {
    round,
    safeSegment,
    serializeError,
    writeReport,
} from './utils.mjs'

export async function runBenchmark(options) {
    const outputPath = resolve(options.out)
    const temporaryRoot = mkdtempSync(join(tmpdir(), 'weavatrix-npm-mcp-'))
    const report = createReport(options)
    let finished = false
    try {
        await executeBenchmark(options, temporaryRoot, report, outputPath)
        finished = true
    } catch (error) {
        report.status = 'ERROR'
        report.errors.push(serializeError(error))
        process.exitCode = 1
    } finally {
        if (!finished && report.status === 'RUNNING') report.status = 'ERROR'
        report.completedAt = new Date().toISOString()
        cleanupTemporaryRoot(options, temporaryRoot, report)
        writeReport(outputPath, report)
    }
    if (report.status !== 'PASS') process.exitCode = 1
    console.log(`${report.status}: ${outputPath}`)
    return report
}

async function executeBenchmark(options, temporaryRoot, report, outputPath) {
    const installed = await prepareAndInstall(options, temporaryRoot, report, outputPath)
    await runSessionPairs(options, temporaryRoot, installed, report, outputPath)
    report.engines.rust.summary = summarizeEngine(report.engines.rust)
    report.engines.javascript.summary = summarizeEngine(report.engines.javascript)
    report.summary = summarizeReport(report)
    report.performanceGate = buildPerformanceGate(
        report.summary,
        options.minColdSpeedup,
        options.minWarmSpeedup,
    )
    report.status = allInvariantsPass(report) && report.performanceGate.pass ? 'PASS' : 'FAIL'
    report.summary.status = report.status
}

async function prepareAndInstall(options, temporaryRoot, report, outputPath) {
    const packageRoot = join(temporaryRoot, 'packages')
    mkdirSync(packageRoot, {recursive: true})
    const rustInputs = await prepareEnginePackages({
        engine: 'rust',
        mainPath: options.rustMain,
        platformPath: options.rustPlatform,
        packageRoot,
    })
    const javascriptInputs = await prepareEnginePackages({
        engine: 'javascript',
        mainPath: options.javascript,
        platformPath: null,
        packageRoot,
    })
    const installed = {}
    installed.rust = await installEngine({
        engine: 'rust',
        prepared: rustInputs,
        installRoot: join(temporaryRoot, 'install-rust'),
        binOverride: options.rustBin,
        options,
    })
    report.engines.rust = installed.rust.result
    writeReport(outputPath, report)
    installed.javascript = await installEngine({
        engine: 'javascript',
        prepared: javascriptInputs,
        installRoot: join(temporaryRoot, 'install-javascript'),
        binOverride: options.javascriptBin,
        options,
    })
    report.engines.javascript = installed.javascript.result
    return installed
}

async function runSessionPairs(options, temporaryRoot, installed, report, outputPath) {
    let pairOrdinal = 0
    for (const tool of options.tools) {
        for (let sample = 0; sample < options.coldSamples; sample += 1) {
            const pair = createPair(tool, sample, pairOrdinal)
            report.execution.pairs.push(pair)
            for (const [orderIndex, engine] of pair.order.entries()) {
                const session = await benchmarkSession({
                    engine,
                    launcher: installed[engine].launcher,
                    repository: resolve(options.repo),
                    tool,
                    toolArguments: options.toolArguments[tool] || {},
                    warmSamples: options.samples,
                    timeoutMs: options.timeoutMs,
                    memoryIntervalMs: options.memoryIntervalMs,
                    pairId: pair.id,
                    coldSample: sample + 1,
                    orderPosition: orderIndex + 1,
                    isolationRoot: join(
                        temporaryRoot,
                        'runtime-state',
                        safeSegment(tool),
                        `cold-${sample + 1}`,
                        engine,
                    ),
                })
                report.engines[engine].sessions.push(session)
                pair.sessions[engine] = {
                    status: session.status,
                    coldBoundaryMs: session.timings.coldBoundaryMs ?? null,
                }
                writeReport(outputPath, report)
            }
            pairOrdinal += 1
        }
    }
}

function createPair(tool, sample, pairOrdinal) {
    return {
        id: `${tool}#${sample + 1}`,
        tool,
        coldSample: sample + 1,
        order: pairOrdinal % 2 === 0
            ? ['rust', 'javascript']
            : ['javascript', 'rust'],
        sessions: {},
    }
}

function cleanupTemporaryRoot(options, temporaryRoot, report) {
    if (options.keepTemp) {
        report.temporaryRoot = temporaryRoot
        return
    }
    const cleanupStarted = performance.now()
    try {
        rmSync(temporaryRoot, {recursive: true, force: true, maxRetries: 3})
        report.temporaryRootCleanup = {
            removed: true,
            wallMs: round(performance.now() - cleanupStarted),
        }
    } catch (error) {
        report.temporaryRootCleanup = {
            removed: false,
            wallMs: round(performance.now() - cleanupStarted),
            error: error.message,
        }
        report.status = 'ERROR'
        report.errors.push({
            name: error.name,
            message: `temporary-root cleanup failed: ${error.message}`,
        })
        process.exitCode = 1
    }
}

function createReport(options) {
    return {
        schema: 'weavatrix.npm-mcp-boundary.v3',
        generatedAt: new Date().toISOString(),
        status: 'RUNNING',
        measurementBoundary: {
            packagePreparation: 'EXCLUDED: local directories are packed before install timing; supplied tarballs are reused',
            install: 'npm install into a new empty root with --ignore-scripts --no-audit --no-fund --package-lock=false',
            invocation: 'installed package manifest bin -> Node launcher -> MCP stdio; Rust wrapper may spawn a native child',
            startup: 'spawn() call until the operating system child spawn event; excludes npm install and package preparation',
            initialize: 'MCP initialize request write after spawn event until matching response',
            list: 'MCP tools/list request/response after notifications/initialized',
            coldCall: 'first tools/call for that tool in a fresh installed-package MCP process',
            coldBoundary: 'wall time from spawning a fresh installed-package MCP process through its first successful tools/call response',
            warmCall: `${options.samples} subsequent tools/call request/response samples in the same process`,
            coldSampling: `${options.coldSamples} paired fresh-process samples per tool with alternating Rust/JavaScript order`,
            runtimeState: 'each engine session receives a distinct empty HOME, USERPROFILE, APPDATA, LOCALAPPDATA, XDG directories, and WEAVATRIX_GRAPH_HOME',
            memory: 'peak sampled resident working set summed over the launcher process tree; sampler is outside that tree',
            runtimeNetwork: {
                requested: false,
                enforcement: 'best-effort environment policy, not an operating-system network namespace',
                details: 'offline flags and non-routable proxy variables are set; the harness itself performs no runtime network requests',
            },
            excluded: [
                'local package packing',
                'temporary-root cleanup',
                'report serialization',
                'cross-engine output equality (this benchmark checks boundary success and invariants)',
            ],
        },
        configuration: {
            repository: resolve(options.repo),
            tools: options.tools,
            coldSamplesPerTool: options.coldSamples,
            warmSamplesPerTool: options.samples,
            timeoutMs: options.timeoutMs,
            memorySampleIntervalMs: options.memoryIntervalMs,
            minimumColdBoundarySpeedup: options.minColdSpeedup,
            minimumWarmCallSpeedup: options.minWarmSpeedup,
            installOffline: options.offlineInstall,
            keepTemporaryRoot: options.keepTemp,
        },
        execution: {
            ordering: 'paired by tool and cold sample; first engine alternates globally between Rust and JavaScript',
            runtimeIsolation: {
                policy: 'fresh-empty-per-session',
                inheritedHomeExcluded: true,
                inheritedWeavatrixGraphHomeExcluded: true,
                environment: [
                    'HOME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA',
                    'XDG_CACHE_HOME', 'XDG_CONFIG_HOME', 'XDG_DATA_HOME',
                    'XDG_STATE_HOME', 'XDG_RUNTIME_DIR', 'WEAVATRIX_GRAPH_HOME',
                ],
            },
            pairs: [],
        },
        engines: {},
        errors: [],
    }
}
