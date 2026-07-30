export function stableHash(value) {
    const text = stableStringify(value)
    let hash = 0xcbf29ce484222325n
    for (const byte of Buffer.from(text)) {
        hash ^= BigInt(byte)
        hash = BigInt.asUintN(64, hash * 0x100000001b3n)
    }
    return hash.toString(16).padStart(16, '0')
}

export function round(value) {
    return Math.round(value * 100) / 100
}

export function relativeManifestIdentity(entry) {
    return {id: entry.id, root: entry.root, path: entry.path, languages: entry.languages}
}

export function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function unique(values) {
    return [...new Set(values)].sort()
}

export function isUnknownOrUnsupported(value) {
    return /(unknown|unsupported|unavailable|not_available|not_supported|partial)/i.test(value)
}

export function visit(value, path, onLeaf) {
    if (Array.isArray(value)) {
        value.slice(0, 200).forEach((item, index) => visit(item, [...path, String(index)], onLeaf))
        return
    }
    if (isRecord(value)) {
        Object.entries(value).forEach(([key, item]) => visit(item, [...path, key], onLeaf))
        return
    }
    const key = path.at(-1) || ''
    onLeaf(path.join('.'), key, value)
}

function stableStringify(value) {
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
    if (isRecord(value)) {
        return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`
    }
    return JSON.stringify(value)
}
