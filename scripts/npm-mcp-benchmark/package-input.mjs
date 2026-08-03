import {spawnSync} from 'node:child_process'
import {existsSync, mkdirSync, statSync} from 'node:fs'
import {join, resolve} from 'node:path'
import {
    PROJECT_ROOT,
    npmInvocation,
    sha256File,
    tail,
} from './utils.mjs'
import {packRecord} from '../npm-pack-json.mjs'

const NPM = npmInvocation()

export async function prepareEnginePackages({engine, mainPath, platformPath, packageRoot}) {
    const engineRoot = join(packageRoot, engine)
    mkdirSync(engineRoot, {recursive: true})
    return {
        main: preparePackage(mainPath, join(engineRoot, 'main')),
        platform: platformPath
            ? preparePackage(platformPath, join(engineRoot, 'platform'))
            : null,
    }
}

function preparePackage(inputPath, destination) {
    const absolute = resolve(inputPath)
    if (!existsSync(absolute)) throw new Error(`package input does not exist: ${absolute}`)
    if (statSync(absolute).isFile()) {
        if (!/\.(?:tgz|tar\.gz)$/i.test(absolute)) {
            throw new Error(`package file must be an npm tarball: ${absolute}`)
        }
        return packageArtifact(absolute, absolute, 'supplied-tarball')
    }
    mkdirSync(destination, {recursive: true})
    const packed = spawnSync(NPM.command, [...NPM.prefixArgs,
        'pack',
        absolute,
        '--json',
        '--ignore-scripts',
        '--pack-destination',
        destination,
    ], {
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
        maxBuffer: 32 * 1024 * 1024,
        timeout: 120_000,
        windowsHide: true,
    })
    if (packed.error) throw packed.error
    if (packed.status !== 0) {
        throw new Error(`npm pack failed for ${absolute}: ${tail(packed.stderr || packed.stdout)}`)
    }
    let metadata
    try {
        metadata = JSON.parse(packed.stdout.replace(/^\uFEFF/, ''))
    } catch (error) {
        throw new Error(`npm pack returned invalid JSON for ${absolute}: ${error.message}`)
    }
    const filename = packRecord(metadata).filename
    if (!filename) throw new Error(`npm pack did not report a tarball for ${absolute}`)
    const tarball = resolve(destination, filename)
    return packageArtifact(absolute, tarball, 'npm-pack-local-directory')
}

function packageArtifact(input, spec, preparedBy) {
    return {
        input,
        spec,
        preparedBy,
        sha256: sha256File(spec),
        bytes: statSync(spec).size,
    }
}
