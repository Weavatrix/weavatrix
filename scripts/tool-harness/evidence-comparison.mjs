import {summarizeEvidence} from './evidence-summary.mjs'
import {isRecord, isUnknownOrUnsupported, unique, visit} from './values.mjs'

export function compareEvidence(tool, contract, rust, javascript) {
    if (!rust.ok || !javascript.ok) {
        return {
            classification: rust.ok === javascript.ok ? 'BOTH_ERROR' : 'SUPPORT_DIVERGENCE',
            successParity: rust.ok === javascript.ok,
            rustError: rust.error || null,
            javascriptError: javascript.error || null,
            responseSchema: {
                rust: rust.responseSchema || null,
                javascript: javascript.responseSchema || null,
            },
            groundTruth: {
                state: 'NOT_ESTABLISHED',
                oracle: 'neither engine',
                reason: 'At least one engine did not return evidence for the shared fixture.',
            },
            contract,
        }
    }
    const rustEvidence = summarizeEvidence(rust.value)
    const javascriptEvidence = summarizeEvidence(javascript.value)
    const invariants = invariantsFor(tool, rust.value, javascript.value)
    const statuses = {
        rust: unique(Object.values({...rustEvidence.verdicts, ...rustEvidence.completeness})),
        javascript: unique(Object.values({...javascriptEvidence.verdicts, ...javascriptEvidence.completeness})),
    }
    const rustRejectedRepository = statuses.rust.includes('INVALID_REPOSITORY')
    const javascriptRejectedRepository = statuses.javascript.includes('INVALID_REPOSITORY')
    const capabilityAdvantage = rustRejectedRepository !== javascriptRejectedRepository
    return {
        classification: capabilityAdvantage
            ? (javascriptRejectedRepository
                ? 'RUST_CAPABILITY_ADVANTAGE'
                : 'JAVASCRIPT_CAPABILITY_ADVANTAGE')
            : (invariants.every((item) => item.pass !== false)
                ? 'COMPARABLE_EVIDENCE'
                : 'INVARIANT_DIVERGENCE'),
        successParity: !capabilityAdvantage,
        performanceComparable: !capabilityAdvantage,
        contract,
        statuses,
        unknownOrUnsupported: {
            rust: statuses.rust.filter(isUnknownOrUnsupported),
            javascript: statuses.javascript.filter(isUnknownOrUnsupported),
        },
        counts: {rust: rustEvidence.counts, javascript: javascriptEvidence.counts},
        invariants,
        responseSchema: {
            rust: rust.responseSchema || null,
            javascript: javascript.responseSchema || null,
        },
        groundTruth: capabilityAdvantage
            ? {
                state: javascriptRejectedRepository
                    ? 'RUST_EXECUTED_JAVASCRIPT_REJECTED'
                    : 'JAVASCRIPT_EXECUTED_RUST_REJECTED',
                oracle: 'exact execution status',
                reason: 'INVALID_REPOSITORY is a refusal, so its response time is not work-equivalent performance evidence.',
            }
            : {
                state: invariants.every((item) => item.pass !== false)
                    ? 'INVARIANTS_PASS'
                    : 'INVARIANTS_FAIL',
                oracle: 'tool-specific invariant',
                reason: 'The JavaScript result is comparison evidence, not the ground-truth oracle.',
            },
        note: 'Counts are evidence inventory, not generic output equality; verdict and completeness vocabularies remain engine-owned.',
    }
}

function invariantsFor(tool, rust, javascript) {
    const bothObjects = isRecord(rust) && isRecord(javascript)
    const base = [{name: 'structured-or-object-result', pass: bothObjects}]
    if (tool === 'graph_stats') {
        base.push({
            name: 'non-empty-graph',
            pass: positiveGraph(rust) && positiveGraph(javascript),
        })
    } else if (tool === 'search_code') {
        base.push({name: 'bounded-search-result', pass: bounded(rust, 40) && bounded(javascript, 40)})
    } else if (tool === 'find_dead_code') {
        base.push({
            name: 'review-not-delete-contract',
            pass: !containsAutoDeleteVerdict(rust) && !containsAutoDeleteVerdict(javascript),
        })
    } else if (tool === 'verified_change') {
        base.push({
            name: 'verdict-present',
            pass: hasKeyDeep(rust, 'verdict') && hasKeyDeep(javascript, 'verdict'),
        })
    } else if (tool === 'trace_api_contract') {
        base.push({
            name: 'completeness-is-explicit',
            pass: hasCompleteness(rust) && hasCompleteness(javascript),
        })
    } else if (tool === 'run_audit' || tool === 'coverage_map') {
        base.push({
            name: 'capability-or-coverage-state-explicit',
            pass: hasCompleteness(rust) && hasCompleteness(javascript),
        })
        if (tool === 'run_audit') {
            base.push({
                name: 'no-offline-security-surface',
                pass: !hasSecuritySurface(rust) && !hasSecuritySurface(javascript),
            })
        }
    }
    return base
}

function positiveGraph(value) {
    const summary = summarizeEvidence(value).counts
    return Object.entries(summary).some(([key, count]) => /(?:nodes|node_count)$/i.test(key) && count > 0)
        && Object.entries(summary).some(([key, count]) => /(?:edges|edge_count)$/i.test(key) && count >= 0)
}

function bounded(value, limit) {
    let pass = true
    const inspect = (item, key = '') => {
        if (Array.isArray(item)) {
            if (/^(?:results|matches|hits|findings)$/i.test(key) && item.length > limit) {
                pass = false
            }
            item.forEach((child) => inspect(child))
        } else if (isRecord(item)) {
            Object.entries(item).forEach(([childKey, child]) => inspect(child, childKey))
        }
    }
    inspect(value)
    return pass
}

function containsAutoDeleteVerdict(value) {
    return JSON.stringify(value).toLowerCase().includes('"auto_delete":true')
}

function hasCompleteness(value) {
    const evidence = summarizeEvidence(value)
    return Object.keys(evidence.verdicts).length + Object.keys(evidence.completeness).length > 0
}

function hasKeyDeep(value, expected) {
    let found = false
    visit(value, [], (_path, key) => {
        if (key.toLowerCase() === expected.toLowerCase()) found = true
    })
    return found
}

function hasSecuritySurface(value) {
    let found = false
    visit(value, [], (_path, key) => {
        if (/(?:malware|vulnerab|advisory|security_scan|osv)/i.test(key)) found = true
    })
    return found
}
