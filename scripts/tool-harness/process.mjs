import {spawnSync} from 'node:child_process'
import {existsSync, readFileSync} from 'node:fs'
import {dirname, isAbsolute, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

export const PROJECT_ROOT = fileURLToPath(new URL('../..', import.meta.url))

export function loadCorpus(manifestPath) {
    const absolute = resolve(manifestPath)
    const manifest = JSON.parse(readFileSync(absolute, 'utf8').replace(/^\uFEFF/, ''))
    if (manifest.schema !== 'weavatrix.corpus.v1') {
        throw new Error(`unsupported corpus schema in ${absolute}: ${manifest.schema}`)
    }
    const roots = Object.fromEntries(Object.entries(manifest.roots || {}).map(([name, value]) => [
        name,
        resolve(PROJECT_ROOT, value),
    ]))
    const repositories = (manifest.repositories || []).map((entry) => {
        const root = roots[entry.root]
        if (!root) throw new Error(`repository ${entry.id} names unknown root ${entry.root}`)
        return {...entry, absolutePath: resolve(root, entry.path)}
    })
    const byId = new Map(repositories.map((entry) => [entry.id, entry]))
    return {...manifest, manifestPath: absolute, roots, repositories, byId}
}

export function parseCli(argv) {
    const options = {
        manifest: join(PROJECT_ROOT, 'scripts', 'corpus.manifest.json'),
        out: null,
        repositories: null,
        tools: null,
        pilot: false,
        includeOutput: false,
        timeoutMs: 120_000,
        timingSamples: 1,
    }
    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index]
        if (argument === '--pilot') options.pilot = true
        else if (argument === '--include-output') options.includeOutput = true
        else if (argument === '--manifest') options.manifest = argv[++index]
        else if (argument === '--out') options.out = argv[++index]
        else if (argument === '--repos') options.repositories = splitList(argv[++index])
        else if (argument === '--tools') options.tools = splitList(argv[++index])
        else if (argument === '--timeout-ms') options.timeoutMs = Number(argv[++index])
        else if (argument === '--timing-samples') options.timingSamples = Number(argv[++index])
        else if (argument === '--help' || argument === '-h') options.help = true
        else throw new Error(`unknown option: ${argument}`)
    }
    return options
}

export function selectedRepositories(corpus, options) {
    const requested = options.repositories && new Set(options.repositories)
    return corpus.repositories.filter((entry) => {
        if (requested && !requested.has(entry.id)) return false
        return !options.pilot || entry.pilot === true
    })
}

export function assertRepository(entry) {
    if (!existsSync(entry.absolutePath)) {
        throw new Error(`${entry.id}: repository is missing at the manifest-resolved path`)
    }
}

export function firstAnchor(entry) {
    return (entry.anchors || []).find((path) => existsSync(join(entry.absolutePath, path)))
        || entry.anchors?.[0]
        || 'README.md'
}

export function secondAnchor(entry) {
    const first = firstAnchor(entry)
    const candidates = (entry.anchors || [])
        .filter((path) => path !== first && existsSync(join(entry.absolutePath, path)))
    return candidates.find((path) => !/\.(?:json|toml|ya?ml|xml)$/i.test(path))
        || candidates[0]
        || first
}

export function run(command, args, options = {}) {
    const child = spawnSync(command, args, {
        cwd: options.cwd,
        env: options.env || process.env,
        encoding: 'utf8',
        maxBuffer: options.maxBuffer || 512 * 1024 * 1024,
        timeout: options.timeoutMs || 10 * 60_000,
        windowsHide: true,
    })
    if (child.error) throw child.error
    if (child.status !== 0) {
        throw new Error(`${command} ${args.join(' ')} failed (${child.status}): ${child.stderr || child.stdout}`)
    }
    return child.stdout.replace(/^\uFEFF/, '')
}

export function git(repository, args) {
    return run('git', ['-c', `safe.directory=${repository}`, '-C', repository, ...args], {
        timeoutMs: 30_000,
    }).trim()
}

export function absoluteExecutable(value) {
    return isAbsolute(value) ? value : resolve(PROJECT_ROOT, value)
}

export function executableExists(value) {
    return existsSync(value) || existsSync(`${value}.exe`)
}

export function parentDirectory(path) {
    return dirname(path)
}

function splitList(value) {
    return String(value).split(',').map((item) => item.trim()).filter(Boolean)
}
