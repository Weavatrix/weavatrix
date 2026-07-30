#!/usr/bin/env node
// Ground-truth checks for Rust-only tools that have no legacy JS equivalent.
import {spawnSync} from 'node:child_process'
import {existsSync, writeFileSync} from 'node:fs'
import {basename, join, resolve} from 'node:path'
import {
    McpClient,
    PROJECT_ROOT,
    absoluteExecutable,
    assertRepository,
    loadCorpus,
    parseCli,
    round,
} from './tool-harness-lib.mjs'
import {runGroundTruthChecks} from './ground-truth/checks.mjs'

async function main() {
    const options = parseCli(process.argv.slice(2))
    if (options.help) {
        console.log('usage: node scripts/check-rust-only-ground-truth.mjs --out FILE [--manifest FILE] [--timeout-ms N] [--include-output]')
        return
    }
    if (!options.out) throw new Error('--out is required')
    const corpus = loadCorpus(options.manifest)
    const rustBin = absoluteExecutable(process.env.WEAVATRIX_BIN
        || join('target', 'release', process.platform === 'win32' ? 'weavatrix.exe' : 'weavatrix'))
    if (!existsSync(rustBin)) throw new Error(`Rust binary not found: ${rustBin}`)
    const fixture = loadFixture(corpus)
    const snapshotStarted = performance.now()
    const snapshot = JSON.parse(runRust(rustBin, options, [
        'analyze', fixture.semanticRepo.absolutePath, '--format=snapshot',
    ]))
    const nodeIds = snapshot.nodes
        .filter((node) => node.kind === 'file')
        .map((node) => node.id)
        .slice(0, 3)
    if (nodeIds.length < 3) throw new Error('semantic fixture repository did not yield three file nodes')
    const client = new McpClient(
        rustBin,
        ['mcp', fixture.semanticRepo.absolutePath, '--profile=all'],
        {cwd: PROJECT_ROOT, timeoutMs: options.timeoutMs},
    )
    let checks
    try {
        await client.initialize()
        await client.call('graph_stats', {output_format: 'json'})
        checks = await runGroundTruthChecks({
            client,
            historyRepos: fixture.historyRepos,
            nodeIds,
            includeOutput: options.includeOutput,
        })
    } finally {
        await client.close()
    }
    const report = createReport({
        rustBin,
        semanticRepo: fixture.semanticRepo,
        snapshotMs: round(performance.now() - snapshotStarted),
        checks,
    })
    writeFileSync(resolve(options.out), `${JSON.stringify(report, null, 2)}\n`)
    console.log(`wrote ${resolve(options.out)} (${report.summary.passed}/${report.summary.total} passed)`)
    if (report.summary.failed) process.exitCode = 1
}

function loadFixture(corpus) {
    const fixtureConfig = corpus.rustOnlyFixtures || {}
    const semanticRepo = corpus.byId.get(fixtureConfig.semanticRepository || 'weavatrix-parse')
    if (!semanticRepo) throw new Error('semantic ground-truth repository is absent from the manifest')
    assertRepository(semanticRepo)
    const historyRepos = (fixtureConfig.historyRepositories || [])
        .map((id) => corpus.byId.get(id))
        .filter(Boolean)
    historyRepos.forEach(assertRepository)
    if (historyRepos.length < 2) {
        throw new Error('ground truth requires at least two history repositories')
    }
    return {semanticRepo, historyRepos}
}

function runRust(rustBin, options, args) {
    const child = spawnSync(rustBin, args, {
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
        maxBuffer: 512 * 1024 * 1024,
        timeout: options.timeoutMs,
        windowsHide: true,
    })
    if (child.error) throw child.error
    if (child.status !== 0) throw new Error(child.stderr || `weavatrix exited ${child.status}`)
    return child.stdout.replace(/^\uFEFF/, '')
}

function createReport({rustBin, semanticRepo, snapshotMs, checks}) {
    return {
        schema: 'weavatrix.rust-only-ground-truth.v1',
        generatedAt: new Date().toISOString(),
        rust: {binary: basename(rustBin)},
        corpus: {manifest: 'scripts/corpus.manifest.json', semanticRepository: semanticRepo.id},
        setupMs: {snapshot: snapshotMs},
        policy: {
            comparedToJavascript: false,
            reason: 'The old JavaScript engine has no cross_repo_git, semantic_link, vector_search, seo_link_suggestions, or memory_context tools.',
            oracle: 'Git CLI or deterministic synthetic fixtures with explicit invariants.',
        },
        checks,
        summary: {
            passed: checks.filter((check) => check.pass).length,
            failed: checks.filter((check) => !check.pass).length,
            total: checks.length,
        },
    }
}

await main()
