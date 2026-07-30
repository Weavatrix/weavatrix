import {spawnSync} from 'node:child_process'
import {mkdirSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {findInstalledLauncher, inspectInstalledIdentity} from './identity.mjs'
import {
    npmInvocation,
    relativeTo,
    round,
    sha256File,
    tail,
    withContext,
} from './utils.mjs'

const NPM = npmInvocation()

export async function installEngine({
    engine,
    prepared,
    installRoot,
    binOverride,
    options: runOptions,
}) {
    mkdirSync(installRoot, {recursive: true})
    writeFileSync(join(installRoot, 'package.json'), `${JSON.stringify({
        name: `weavatrix-boundary-${engine}`,
        version: '0.0.0',
        private: true,
    }, null, 2)}\n`)
    const installArgs = [
        'install',
        '--ignore-scripts',
        '--no-audit',
        '--no-fund',
        '--package-lock=false',
        '--prefer-offline',
    ]
    if (runOptions.offlineInstall) installArgs.push('--offline')
    if (prepared.platform) installArgs.push('--omit=optional')
    installArgs.push(prepared.main.spec)
    if (prepared.platform) installArgs.push(prepared.platform.spec)
    const installStarted = performance.now()
    const install = spawnSync(NPM.command, [...NPM.prefixArgs, ...installArgs], {
        cwd: installRoot,
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
        timeout: Math.max(runOptions.timeoutMs * 4, 120_000),
        windowsHide: true,
    })
    const installWallMs = round(performance.now() - installStarted)
    if (install.error) throw withContext(install.error, `${engine} npm install`)
    if (install.status !== 0) {
        throw new Error(`${engine} npm install failed (${install.status}): ${tail(install.stderr || install.stdout)}`)
    }
    const launcher = findInstalledLauncher(installRoot, {
        preferredBin: binOverride,
        engine,
    })
    const result = {
        package: packageResult(prepared, launcher, installRoot),
        identity: inspectInstalledIdentity(engine, launcher, installRoot),
        install: {
            wallMs: installWallMs,
            flags: installArgs.filter((argument) => argument.startsWith('--')),
            exitCode: install.status,
            stdoutTail: tail(install.stdout, 2_048),
            stderrTail: tail(install.stderr, 2_048),
        },
        sessions: [],
    }
    return {launcher, result}
}

function packageResult(prepared, launcher, installRoot) {
    return {
        name: launcher.packageName,
        version: launcher.version,
        mainInput: prepared.main.input,
        preparedMain: {
            method: prepared.main.preparedBy,
            sha256: prepared.main.sha256,
            bytes: prepared.main.bytes,
        },
        platformInput: prepared.platform?.input || null,
        preparedPlatform: prepared.platform ? {
            method: prepared.platform.preparedBy,
            sha256: prepared.platform.sha256,
            bytes: prepared.platform.bytes,
        } : null,
        installedBinName: launcher.binName,
        installedBinEntry: relativeTo(installRoot, launcher.entry),
        installedManifestSha256: sha256File(launcher.manifestPath),
        installedLauncherSha256: sha256File(launcher.entry),
    }
}
