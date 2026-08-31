#!/usr/bin/env node
import {mkdtempSync, rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join, resolve} from 'node:path'
import {installEngine} from './npm-mcp-benchmark/install.mjs'
import {prepareEnginePackages} from './npm-mcp-benchmark/package-input.mjs'
import {summarizeNumbers} from './npm-mcp-benchmark/report.mjs'
import {benchmarkSession} from './npm-mcp-benchmark/session.mjs'
import {round, serializeError, writeReport} from './npm-mcp-benchmark/utils.mjs'

const packageInput = resolve(process.argv[2] || 'npm/dist/weavatrix')
const repository = resolve(process.argv[3] || '.')
const output = resolve(process.argv[4] || 'target/npm-native-basic.json')
const calls = Number(process.argv[5] || 1000)
if (!Number.isInteger(calls) || calls < 1 || calls > 5000) {
    throw new Error('call count must be an integer from 1 to 5000')
}

const temporaryRoot = mkdtempSync(join(tmpdir(), 'weavatrix-native-basic-'))
const report = {
    schema: 'weavatrix.installed-native-basic.v1',
    generatedAt: new Date().toISOString(),
    status: 'RUNNING',
    configuration: {packageInput, repository, calls},
}

try {
    const prepared = await prepareEnginePackages({
        engine: 'rust',
        mainPath: packageInput,
        platformPath: null,
        packageRoot: join(temporaryRoot, 'packages'),
    })
    const installed = await installEngine({
        engine: 'rust',
        prepared,
        installRoot: join(temporaryRoot, 'install'),
        binOverride: 'weavatrix-mcp',
        options: {timeoutMs: 300_000, offlineInstall: false},
    })
    const session = await benchmarkSession({
        engine: 'rust',
        launcher: installed.launcher,
        repository,
        tool: 'graph_stats',
        toolArguments: {output_format: 'json'},
        warmSamples: calls,
        timeoutMs: 300_000,
        memoryIntervalMs: 50,
        pairId: 'native-basic',
        coldSample: 1,
        orderPosition: 1,
        isolationRoot: join(temporaryRoot, 'runtime'),
    })
    const samples = session.timings.warmCallMs
    const summary = summarizeNumbers(samples)
    const failures = session.warmCalls.filter((call) => !call.ok).length
    const totalMs = samples.reduce((total, value) => total + value, 0)
    const identityPass = installed.result.identity.invariants.every((item) => item.pass)
    const pass = identityPass
        && session.status === 'PASS'
        && session.protocol.tools.count === 44
        && samples.length === calls
        && failures === 0
        && session.cleanup.processTreeGone === true
    Object.assign(report, {
        status: pass ? 'PASS' : 'FAIL',
        installed: installed.result,
        basic: {
            initializeMs: session.timings.initializeMs,
            toolsListMs: session.timings.listMs,
            firstGraphStatsMs: session.timings.coldCallMs,
            coldBoundaryMs: session.timings.coldBoundaryMs,
            toolCount: session.protocol.tools.count,
        },
        shortLoad: {
            operation: 'graph_stats',
            sequentialCalls: calls,
            failures,
            totalMs: round(totalMs),
            callsPerSecond: round(calls * 1000 / totalMs),
            meanMs: round(totalMs / calls),
            p50Ms: summary.median,
            p95Ms: summary.p95,
            p99Ms: round(percentile(samples, 0.99)),
            maxMs: summary.max,
        },
        cleanup: session.cleanup,
        invariants: session.invariants,
    })
} catch (error) {
    report.status = 'ERROR'
    report.error = serializeError(error)
} finally {
    try {
        rmSync(temporaryRoot, {recursive: true, force: true, maxRetries: 3})
        report.temporaryRootRemoved = true
    } catch (error) {
        report.status = 'ERROR'
        report.temporaryRootRemoved = false
        report.cleanupError = serializeError(error)
    }
    report.completedAt = new Date().toISOString()
    writeReport(output, report)
}

console.log(`${report.status}: ${output}`)
if (report.status !== 'PASS') process.exitCode = 1

function percentile(values, quantile) {
    const sorted = values.filter(Number.isFinite).sort((left, right) => left - right)
    if (sorted.length === 0) return Number.NaN
    if (sorted.length === 1) return sorted[0]
    const position = (sorted.length - 1) * quantile
    const lower = Math.floor(position)
    const fraction = position - lower
    return sorted[lower]
        + (sorted[Math.min(lower + 1, sorted.length - 1)] - sorted[lower]) * fraction
}
