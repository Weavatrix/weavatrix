import {spawnSync} from 'node:child_process'
import {existsSync, readFileSync, statSync} from 'node:fs'
import {join, resolve} from 'node:path'
import {invariant} from './protocol.mjs'
import {relativeTo, safeReadDirectory, sha256File} from './utils.mjs'

export function findInstalledLauncher(installRoot, {preferredBin, engine}) {
    const packages = installedPackages(join(installRoot, 'node_modules'))
    const candidates = []
    for (const item of packages) {
        const manifestPath = join(item, 'package.json')
        let manifest
        try {
            manifest = JSON.parse(readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, ''))
        } catch {
            continue
        }
        const bins = typeof manifest.bin === 'string'
            ? {[manifest.name]: manifest.bin}
            : manifest.bin || {}
        for (const [binName, target] of Object.entries(bins)) {
            const entry = resolve(item, target)
            if (existsSync(entry)) {
                candidates.push({
                    packageName: manifest.name,
                    version: manifest.version,
                    engineVersion: manifest.weavatrixEngineVersion ?? manifest.version,
                    binName,
                    entry,
                    manifestPath,
                    packageRoot: item,
                })
            }
        }
    }
    if (preferredBin) {
        const exact = candidates.find((item) => item.binName === preferredBin)
        if (!exact) throw new Error(`${engine}: installed bin ${preferredBin} not found`)
        return exact
    }
    const preferredNames = engine === 'rust'
        ? ['weavatrix-mcp', 'weavatrix']
        : ['weavatrix-js', 'weavatrix-mcp', 'weavatrix']
    for (const binName of preferredNames) {
        const match = candidates.find((item) => item.binName === binName
            && /weavatrix/i.test(item.packageName || ''))
        if (match) return match
    }
    const unique = candidates.filter((item) => /weavatrix/i.test(item.packageName || ''))
    if (unique.length === 1) return unique[0]
    throw new Error(`${engine}: could not select installed MCP launcher; pass --${engine === 'rust' ? 'rust-bin' : 'javascript-bin'}`)
}

export function inspectInstalledIdentity(engine, launcher, installRoot) {
    const invariants = baseInvariants(launcher)
    const packageIdentity = packageMetadata(launcher, installRoot)
    const launcherIdentity = launcherMetadata(launcher, installRoot)
    if (engine !== 'rust') {
        return {
            package: packageIdentity,
            launcher: launcherIdentity,
            nativeBinary: {
                availability: 'NOT_APPLICABLE',
                reason: 'the JavaScript engine has no native executable',
            },
            invariants,
        }
    }
    const nativePath = findInstalledNativeBinary(launcher, installRoot)
    invariants.push(invariant(
        'installed Rust package contains the current-platform native executable',
        nativePath !== null,
        nativePath === null ? `platform=${process.platform}; arch=${process.arch}` : null,
    ))
    if (!nativePath) {
        return {
            package: packageIdentity,
            launcher: launcherIdentity,
            nativeBinary: {
                availability: 'MISSING',
                platform: process.platform,
                arch: process.arch,
            },
            invariants,
        }
    }
    return nativeIdentity(nativePath, launcher, installRoot, invariants)
}

function nativeIdentity(nativePath, launcher, installRoot, invariants) {
    const version = spawnSync(nativePath, ['--version'], {
        encoding: 'utf8',
        timeout: 30_000,
        windowsHide: true,
    })
    const actual = String(version.stdout || '').replace(/^\uFEFF/, '').trim()
    const expected = `weavatrix ${launcher.version} (engine ${launcher.engineVersion})`
    const versionMatches = !version.error && version.status === 0 && actual === expected
    invariants.push(invariant(
        'native executable reports the package and engine versions',
        versionMatches,
        version.error?.message
            || `expected=${JSON.stringify(expected)}; actual=${JSON.stringify(actual)}; exit=${version.status}`,
    ))
    return {
        package: packageMetadata(launcher, installRoot),
        launcher: launcherMetadata(launcher, installRoot),
        nativeBinary: {
            availability: 'AVAILABLE',
            path: relativeTo(installRoot, nativePath),
            sha256: sha256File(nativePath),
            bytes: statSync(nativePath).size,
            expectedVersionOutput: expected,
            actualVersionOutput: actual,
            exitCode: version.status,
            identityMatchesPackage: versionMatches,
        },
        invariants,
    }
}

function baseInvariants(launcher) {
    return [
        invariant(
            'installed package has a non-empty version',
            typeof launcher.version === 'string' && launcher.version.length > 0,
            null,
        ),
        invariant(
            'installed launcher is a regular file',
            existsSync(launcher.entry) && statSync(launcher.entry).isFile(),
            launcher.entry,
        ),
    ]
}

function packageMetadata(launcher, installRoot) {
    return {
        name: launcher.packageName,
        version: launcher.version,
        engineVersion: launcher.engineVersion,
        manifest: relativeTo(installRoot, launcher.manifestPath),
        manifestSha256: sha256File(launcher.manifestPath),
    }
}

function launcherMetadata(launcher, installRoot) {
    return {
        path: relativeTo(installRoot, launcher.entry),
        sha256: sha256File(launcher.entry),
        bytes: statSync(launcher.entry).size,
    }
}

function findInstalledNativeBinary(launcher, installRoot) {
    const platform = npmPlatformKey()
    if (!platform) return null
    const binary = process.platform === 'win32' ? 'weavatrix.exe' : 'weavatrix'
    const bundled = join(launcher.packageRoot, 'bin', 'native', platform, binary)
    if (existsSync(bundled) && statSync(bundled).isFile()) return bundled
    const optional = join(
        installRoot,
        'node_modules',
        '@weavatrix',
        `cli-${platform}`,
        binary,
    )
    return existsSync(optional) && statSync(optional).isFile() ? optional : null
}

function npmPlatformKey() {
    const os = {win32: 'win32', darwin: 'darwin', linux: 'linux'}[process.platform]
    const arch = {x64: 'x64', arm64: 'arm64'}[process.arch]
    return os && arch ? `${os}-${arch}` : null
}

function installedPackages(nodeModules) {
    const result = []
    for (const entry of safeReadDirectory(nodeModules)) {
        if (entry.name === '.bin' || !entry.isDirectory()) continue
        const path = join(nodeModules, entry.name)
        if (entry.name.startsWith('@')) {
            for (const scoped of safeReadDirectory(path)) {
                if (scoped.isDirectory()) result.push(join(path, scoped.name))
            }
        } else {
            result.push(path)
        }
    }
    return result
}
