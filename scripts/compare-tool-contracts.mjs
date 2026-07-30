#!/usr/bin/env node
// Differential harness for the tools shared by Weavatrix JS and Rust.
// It compares verdicts, completeness, and invariants rather than generic JSON.
import {existsSync} from 'node:fs'
import {basename, join, resolve} from 'node:path'
import {
    PROJECT_ROOT,
    absoluteExecutable,
    assertRepository,
    executableExists,
    loadCorpus,
    parseCli,
    relativeManifestIdentity,
    RUST_INCOMPLETE_CAPABILITY_TOKENS,
    selectedRepositories,
} from './tool-harness-lib.mjs'
import {COMMON_TOOLS, CONTRACTS, PILOT_TOOLS} from './contract-comparison/catalog.mjs'
import {compareRepository} from './contract-comparison/repository.mjs'
import {
    failedRepository,
    summarizeReport,
    writeReportAtomic,
} from './contract-comparison/report.mjs'

async function main() {
    const options = parseCli(process.argv.slice(2))
    if (options.help) {
        console.log('usage: node scripts/compare-tool-contracts.mjs --out FILE [--manifest FILE] [--repos a,b] [--tools a,b] [--pilot] [--include-output] [--timeout-ms N] [--timing-samples N]')
        return
    }
    validateOptions(options)
    const context = buildContext(options)
    const report = createReport(context)
    const reportPath = resolve(options.out)
    const save = (progress) => {
        report.progress = progress
        report.summary = summarizeReport(report.repositories)
        writeReportAtomic(reportPath, report)
    }
    const upsert = (repository) => {
        const index = report.repositories.findIndex((item) =>
            item.repository.id === repository.repository.id)
        if (index === -1) report.repositories.push(repository)
        else report.repositories[index] = repository
    }

    save({repository: null, callIndex: null, tool: null, state: 'starting'})
    for (const entry of context.repositories) {
        process.stderr.write(`${entry.id}: preparing JS and Rust engines... `)
        let result
        try {
            assertRepository(entry)
            result = await compareRepository(entry, context, (partial, progress) => {
                upsert(partial)
                save(progress)
            })
        } catch (error) {
            result = failedRepository(entry, error)
            upsert(result)
            save({repository: entry.id, callIndex: null, tool: null, state: 'failed'})
        }
        const compared = result.tools.filter((item) => item.comparison.successParity).length
        process.stderr.write(`${compared}/${result.tools.length} success-parity calls (${result.status})\n`)
    }

    report.summary = summarizeReport(report.repositories)
    delete report.progress
    writeReportAtomic(reportPath, report)
    console.log(`wrote ${reportPath}`)
    if (reportFailed(report.summary)) process.exitCode = 1
}

function validateOptions(options) {
    if (!options.out) throw new Error('--out is required')
    if (!Number.isInteger(options.timingSamples) || options.timingSamples < 1) {
        throw new Error('--timing-samples must be a positive integer')
    }
}

function buildContext(options) {
    const corpus = loadCorpus(options.manifest)
    const repositories = selectedRepositories(corpus, options)
    if (repositories.length === 0) throw new Error('no corpus repositories selected')
    const requested = options.tools ? new Set(options.tools) : null
    const tools = COMMON_TOOLS.filter((name) => (!requested || requested.has(name))
        && (!options.pilot || PILOT_TOOLS.has(name)))
    const unknown = options.tools?.filter((name) => !COMMON_TOOLS.includes(name)) || []
    if (unknown.length) throw new Error(`not a shared tool: ${unknown.join(', ')}`)
    const jsRoot = resolve(process.env.WEAVATRIX_JS || join(PROJECT_ROOT, '..', 'weavatrix-js'))
    const rustBin = absoluteExecutable(process.env.WEAVATRIX_BIN
        || join('target', 'release', process.platform === 'win32' ? 'weavatrix.exe' : 'weavatrix'))
    if (!executableExists(rustBin)) throw new Error(`Rust binary not found: ${rustBin}`)
    if (!existsSync(jsRoot)) throw new Error(`JavaScript checkout not found: ${jsRoot}`)
    return {options, corpus, repositories, tools, jsRoot, rustBin, contracts: CONTRACTS}
}

function createReport(context) {
    const {options, corpus, repositories, tools, jsRoot, rustBin} = context
    return {
        schema: 'weavatrix.cross-engine-tools.v2',
        generatedAt: new Date().toISOString(),
        corpus: {
            schema: corpus.schema,
            manifest: 'scripts/corpus.manifest.json',
            repositories: repositories.map(relativeManifestIdentity),
        },
        engines: {
            rust: {binary: basename(rustBin), invocation: 'native-binary-direct'},
            javascript: {
                checkout: basename(jsRoot),
                node: process.version,
                invocation: 'source-checkout-mcp-server',
            },
        },
        comparisonPolicy: {
            genericEquality: false,
            dimensions: ['success parity', 'verdict vocabulary', 'completeness', 'boundedness', 'tool-specific invariants'],
            timing: `median of ${options.timingSamples} paired warm MCP calls with alternating engine order; graph construction is reported separately`,
            measurementBoundary: 'source/native comparison only; this does not measure an installed npm launcher',
            rustIncompleteCapabilityGate: {
                engine: 'rust-only',
                exactForbiddenValues: RUST_INCOMPLETE_CAPABILITY_TOKENS,
                fields: 'status, state, verdict, completeness, availability, support, capability, precision, coverage and freshness values',
                absentEvidence: 'a structured object with present:false is excluded because missing evidence is not a capability token',
            },
        },
        expectedSharedToolCount: COMMON_TOOLS.length,
        selectedTools: tools,
        repositories: [],
    }
}

function reportFailed(summary) {
    return summary.supportDivergences > 0
        || summary.invariantDivergences > 0
        || summary.bothErrors > 0
        || summary.repositoryFailures > 0
        || summary.rustIncompleteCapabilityCalls > 0
}

await main()
