import {isRecord, visit} from './values.mjs'

export const RUST_INCOMPLETE_CAPABILITY_TOKENS = Object.freeze([
    'UNKNOWN',
    'UNSUPPORTED',
    'NOT_SUPPORTED',
    'PARTIAL',
    'NOT_AVAILABLE',
])

const RUST_INCOMPLETE_CAPABILITY_TOKEN_SET = new Set(RUST_INCOMPLETE_CAPABILITY_TOKENS)
const CAPABILITY_VALUE_FIELDS = new Set([
    'actual_coverage',
    'availability',
    'capabilities',
    'capability',
    'capability_state',
    'capability_status',
    'completeness',
    'coverage',
    'freshness',
    'precision',
    'semantic_precision',
    'state',
    'status',
    'support',
    'verdict',
])

export function summarizeEvidence(value) {
    const verdicts = {}
    const counts = {}
    const completeness = {}
    visit(value, [], (path, key, leaf) => {
        if (typeof leaf === 'string' && /^(verdict|status|state|freshness|precision|actualcoverage|semantic_precision)$/i.test(key)) {
            verdicts[path] = leaf
        }
        if (typeof leaf === 'string' && /(complete|partial|unknown|unsupported|available|unavailable|not_|pass|blocked|review)/i.test(leaf)
            && /(status|state|coverage|precision|support|capab|complete)/i.test(path)) {
            completeness[path] = leaf
        }
        if (typeof leaf === 'number' && Number.isFinite(leaf)
            && /(count|total|nodes|edges|files|symbols|findings|matches|families|pairs|endpoints|communities|hits)$/i.test(key)
            && Object.keys(counts).length < 80) {
            counts[path] = leaf
        }
        const historicalCommitSummary = key === 'summary' && /\.commits\.\d+\.summary$/.test(path)
        if (typeof leaf === 'string' && !historicalCommitSummary) {
            for (const token of leaf.match(/\b(?:PASS|BLOCKED|UNKNOWN|REVIEW|COMPLETE|PARTIAL|UNSUPPORTED|UNAVAILABLE|AVAILABLE|NOT_[A-Z_]+)\b/g) || []) {
                completeness[`${path}#${token}`] = token
            }
            for (const match of leaf.matchAll(/\b(nodes|edges|files|symbols|findings|matches|families|pairs|endpoints|communities|hits)\s*:\s*(\d+)/gi)) {
                counts[`${path}#${match[1].toLowerCase()}`] = Number(match[2])
            }
        }
    })
    return {verdicts, completeness, counts}
}

/**
 * Finds exact incomplete-capability tokens in one Rust structured tool result.
 *
 * A structured evidence descriptor with `present: false` means that evidence
 * was not supplied; it is not itself a claim that the Rust capability is
 * incomplete. The entire descriptor is therefore excluded from this gate.
 */
export function findRustIncompleteCapabilities(value) {
    const findings = []
    const inspect = (item, path) => {
        if (Array.isArray(item)) {
            item.forEach((child, index) => inspect(child, [...path, String(index)]))
            return
        }
        if (isRecord(item)) {
            if (item.present === false) return
            Object.entries(item).forEach(([key, child]) => inspect(child, [...path, key]))
            return
        }
        if (typeof item !== 'string'
            || !RUST_INCOMPLETE_CAPABILITY_TOKEN_SET.has(item)
            || !isCapabilityValuePath(path)) {
            return
        }
        findings.push({
            path: jsonPointer(path),
            value: item,
        })
    }
    inspect(value, [])
    return findings
}

export function summarizeRustIncompleteCapabilityCalls(calls) {
    const incompleteCalls = calls.filter((entry) =>
        entry.rustIncompleteCapabilityGate?.findings?.length > 0)
    return {
        rustIncompleteCapabilityCalls: incompleteCalls.length,
        rustIncompleteCapabilityFindings: incompleteCalls.flatMap((entry) =>
            entry.rustIncompleteCapabilityGate.findings.map((finding) => ({
                repository: entry.scope?.repository ?? null,
                tool: entry.tool,
                path: finding.path,
                value: finding.value,
            }))),
    }
}

function isCapabilityValuePath(path) {
    const fields = path
        .filter((segment) => !/^\d+$/.test(segment))
        .map(normalizeFieldName)
    const leaf = fields.at(-1) || ''
    if (CAPABILITY_VALUE_FIELDS.has(leaf)) return true
    return fields.slice(0, -1).some((field) =>
        field === 'capabilities'
        || field === 'capability'
        || field === 'capability_matrix'
        || field.endsWith('_capabilities'))
}

function normalizeFieldName(value) {
    return String(value)
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .replace(/[^A-Za-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase()
}

function jsonPointer(path) {
    if (path.length === 0) return '/'
    return `/${path.map((segment) => String(segment)
        .replaceAll('~', '~0')
        .replaceAll('/', '~1')).join('/')}`
}
