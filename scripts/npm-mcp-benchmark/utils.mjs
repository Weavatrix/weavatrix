import {createHash} from 'node:crypto'
import {
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    renameSync,
    rmSync,
    writeFileSync,
} from 'node:fs'
import {dirname, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

export const SCRIPT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const PROJECT_ROOT = resolve(SCRIPT_ROOT, '..')

export function npmInvocation() {
    if (process.platform !== 'win32') return {command: 'npm', prefixArgs: []}
    const cli = join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js')
    if (!existsSync(cli)) {
        throw new Error(`npm CLI was not found beside Node: ${cli}`)
    }
    return {command: process.execPath, prefixArgs: [cli]}
}

export function tryParseJson(text) {
    if (!text) return null
    try {
        return JSON.parse(text.replace(/^\uFEFF/, ''))
    } catch {
        return null
    }
}

export function safeReadDirectory(path) {
    try {
        return readdirSync(path, {withFileTypes: true})
    } catch {
        return []
    }
}

export function waitForSpawn(child, timeoutMs) {
    return new Promise((resolvePromise, rejectPromise) => {
        const timer = setTimeout(() =>
            rejectPromise(new Error(`launcher spawn timed out after ${timeoutMs} ms`)), timeoutMs)
        child.once('spawn', () => {
            clearTimeout(timer)
            resolvePromise()
        })
        child.once('error', (error) => {
            clearTimeout(timer)
            rejectPromise(error)
        })
    })
}

export function waitForPromise(promise, timeoutMs) {
    if (!promise) return Promise.resolve(false)
    return Promise.race([
        promise.then(() => true),
        new Promise((resolvePromise) => setTimeout(() => resolvePromise(false), timeoutMs)),
    ])
}

export function waitForValue(promise, timeoutMs) {
    return Promise.race([
        promise,
        new Promise((resolvePromise) => setTimeout(() => resolvePromise(null), timeoutMs)),
    ])
}

export function sha256(value) {
    return createHash('sha256').update(value).digest('hex')
}

export function sha256File(path) {
    return sha256(readFileSync(path))
}

export function safeSegment(value) {
    const readable = String(value).replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 48) || 'tool'
    return `${readable}-${sha256(String(value)).slice(0, 8)}`
}

export function round(value) {
    return Math.round(value * 100) / 100
}

export function tail(value, limit = 4_096) {
    return String(value || '').slice(-limit)
}

export function relativeTo(root, path) {
    const absoluteRoot = resolve(root)
    const absolutePath = resolve(path)
    return absolutePath.startsWith(`${absoluteRoot}\\`) || absolutePath.startsWith(`${absoluteRoot}/`)
        ? absolutePath.slice(absoluteRoot.length + 1).replaceAll('\\', '/')
        : absolutePath
}

export function serializeError(error) {
    return {
        name: error?.name || 'Error',
        message: error?.message || String(error),
        stack: error?.stack || null,
    }
}

export function withContext(error, context) {
    error.message = `${context}: ${error.message}`
    return error
}

export function writeReport(path, value) {
    mkdirSync(dirname(path), {recursive: true})
    const temporary = `${path}.tmp-${process.pid}`
    writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`)
    try {
        renameSync(temporary, path)
    } catch {
        rmSync(path, {force: true})
        renameSync(temporary, path)
    }
}
