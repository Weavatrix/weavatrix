import {renameSync, rmSync, writeFileSync} from 'node:fs'
import {
    git,
    relativeManifestIdentity,
    summarizeRustIncompleteCapabilityCalls,
} from '../tool-harness-lib.mjs'

export function writeReportAtomic(path, value) {
    const temporary = `${path}.tmp-${process.pid}`
    try {
        writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`)
        renameSync(temporary, path)
    } finally {
        rmSync(temporary, {force: true})
    }
}

export function failedRepository(entry, error) {
    return {
        repository: relativeManifestIdentity(entry),
        revision: safeRevision(entry.absolutePath),
        initialization: null,
        setupMs: null,
        graphInventory: null,
        tools: [],
        status: 'failed',
        error: {
            message: String(error?.message || error),
            stderr: String(error?.stderr || ''),
        },
    }
}

export function summarizeReport(repositories) {
    const calls = repositories.flatMap((entry) => entry.tools)
    const timed = calls.filter((entry) =>
        entry.comparison.performanceComparable !== false
        && Number.isFinite(entry.timingMs.javascriptOverRust))
    const rustCapabilitySummary = summarizeRustIncompleteCapabilityCalls(calls)
    return {
        repositories: repositories.length,
        repositoryFailures: repositories.filter((entry) => entry.status === 'failed').length,
        calls: calls.length,
        successParity: calls.filter((entry) => entry.comparison.successParity).length,
        supportDivergences: calls.filter((entry) => entry.comparison.classification === 'SUPPORT_DIVERGENCE').length,
        rustCapabilityAdvantages: calls.filter((entry) =>
            entry.comparison.classification === 'RUST_CAPABILITY_ADVANTAGE').length,
        javascriptCapabilityAdvantages: calls.filter((entry) =>
            entry.comparison.classification === 'JAVASCRIPT_CAPABILITY_ADVANTAGE').length,
        invariantDivergences: calls.filter((entry) => entry.comparison.classification === 'INVARIANT_DIVERGENCE').length,
        bothErrors: calls.filter((entry) => entry.comparison.classification === 'BOTH_ERROR').length,
        rustIncompleteVocabularyCalls: calls.filter((entry) =>
            entry.comparison.unknownOrUnsupported?.rust?.length).length,
        javascriptIncompleteVocabularyCalls: calls.filter((entry) =>
            entry.comparison.unknownOrUnsupported?.javascript?.length).length,
        unknownOrUnsupportedCalls: calls.filter((entry) =>
            entry.comparison.unknownOrUnsupported?.rust?.length
            || entry.comparison.unknownOrUnsupported?.javascript?.length).length,
        ...rustCapabilitySummary,
        performanceComparableCalls: timed.length,
        rustFasterCalls: timed.filter((entry) => entry.timingMs.javascriptOverRust > 1).length,
        timingCaveat: 'Per-tool timing is warm MCP wall time. Compare setupMs separately; do not add setup to every tool.',
    }
}

function safeRevision(repository) {
    try {
        return git(repository, ['rev-parse', 'HEAD'])
    } catch {
        return null
    }
}
