import {existsSync, readFileSync, statSync} from 'node:fs'
import {resolve} from 'node:path'

const DEFAULT_TOOL_ARGUMENTS = Object.freeze({
    graph_stats: {output_format: 'json'},
})

export function parseArguments(argv) {
    const parsed = {
        rustMain: null,
        rustPlatform: null,
        javascript: null,
        rustBin: null,
        javascriptBin: null,
        repo: null,
        tools: ['graph_stats'],
        coldSamples: 3,
        samples: 5,
        timeoutMs: 120_000,
        memoryIntervalMs: 50,
        minColdSpeedup: 24,
        minWarmSpeedup: 30,
        toolArguments: {...DEFAULT_TOOL_ARGUMENTS},
        out: null,
        offlineInstall: false,
        keepTemp: false,
        help: false,
    }
    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index]
        if (argument === '--rust-main') parsed.rustMain = argv[++index]
        else if (argument === '--rust-platform') parsed.rustPlatform = argv[++index]
        else if (argument === '--javascript') parsed.javascript = argv[++index]
        else if (argument === '--rust-bin') parsed.rustBin = argv[++index]
        else if (argument === '--javascript-bin') parsed.javascriptBin = argv[++index]
        else if (argument === '--repo') parsed.repo = argv[++index]
        else if (argument === '--tools') parsed.tools = splitList(argv[++index])
        else if (argument === '--cold-samples') parsed.coldSamples = Number(argv[++index])
        else if (argument === '--samples') parsed.samples = Number(argv[++index])
        else if (argument === '--timeout-ms') parsed.timeoutMs = Number(argv[++index])
        else if (argument === '--memory-interval-ms') parsed.memoryIntervalMs = Number(argv[++index])
        else if (argument === '--min-cold-speedup') parsed.minColdSpeedup = Number(argv[++index])
        else if (argument === '--min-warm-speedup') parsed.minWarmSpeedup = Number(argv[++index])
        else if (argument === '--tool-args') {
            parsed.toolArguments = {
                ...parsed.toolArguments,
                ...JSON.parse(readFileSync(resolve(argv[++index]), 'utf8').replace(/^\uFEFF/, '')),
            }
        } else if (argument === '--out') parsed.out = argv[++index]
        else if (argument === '--offline-install') parsed.offlineInstall = true
        else if (argument === '--keep-temp') parsed.keepTemp = true
        else if (argument === '--help' || argument === '-h') parsed.help = true
        else throw new Error(`unknown option: ${argument}`)
    }
    return parsed
}

export function validateOptions(parsed) {
    for (const [name, value] of [
        ['--rust-main', parsed.rustMain],
        ['--javascript', parsed.javascript],
        ['--repo', parsed.repo],
        ['--out', parsed.out],
    ]) {
        if (!value) throw new Error(`${name} is required`)
    }
    if (!existsSync(resolve(parsed.repo)) || !statSync(resolve(parsed.repo)).isDirectory()) {
        throw new Error(`--repo must be a directory: ${parsed.repo}`)
    }
    if (parsed.tools.length === 0) throw new Error('--tools must name at least one tool')
    if (!Number.isInteger(parsed.coldSamples)
        || parsed.coldSamples < 1
        || parsed.coldSamples > 20) {
        throw new Error('--cold-samples must be an integer from 1 to 20')
    }
    if (!Number.isInteger(parsed.samples) || parsed.samples < 1 || parsed.samples > 100) {
        throw new Error('--samples must be an integer from 1 to 100')
    }
    if (!Number.isFinite(parsed.timeoutMs) || parsed.timeoutMs < 1_000) {
        throw new Error('--timeout-ms must be at least 1000')
    }
    if (!Number.isFinite(parsed.memoryIntervalMs)
        || parsed.memoryIntervalMs < 10
        || parsed.memoryIntervalMs > 5_000) {
        throw new Error('--memory-interval-ms must be between 10 and 5000')
    }
    if (!Number.isFinite(parsed.minColdSpeedup) || parsed.minColdSpeedup <= 0) {
        throw new Error('--min-cold-speedup must be a positive number')
    }
    if (!Number.isFinite(parsed.minWarmSpeedup) || parsed.minWarmSpeedup <= 0) {
        throw new Error('--min-warm-speedup must be a positive number')
    }
    for (const tool of parsed.tools) {
        const args = parsed.toolArguments[tool]
        if (args !== undefined && (!args || typeof args !== 'object' || Array.isArray(args))) {
            throw new Error(`tool arguments for ${tool} must be a JSON object`)
        }
    }
}

export function printHelp() {
    console.log(`usage: node scripts/benchmark-npm-mcp.mjs [options]

Required:
  --rust-main PATH       local Rust main package directory or .tgz
  --javascript PATH      local JavaScript package directory or .tgz
  --repo PATH            repository analyzed by both installed MCP packages
  --out FILE             atomic JSON report output

Optional:
  --rust-platform PATH   current platform package directory or .tgz
  --rust-bin NAME        installed Rust manifest bin key override
  --javascript-bin NAME  installed JavaScript manifest bin key override
  --tools a,b            MCP tools to benchmark (default: graph_stats)
  --tool-args FILE       JSON object mapping tool names to argument objects
  --cold-samples N       paired fresh-process samples per tool (default: 3)
  --samples N            warm calls per tool after one cold call (default: 5)
  --timeout-ms N         per MCP request timeout (default: 120000)
  --memory-interval-ms N process-tree RSS sample interval (default: 50)
  --min-cold-speedup N   required end-to-end cold boundary ratio (default: 24)
  --min-warm-speedup N   required warm tools/call ratio (default: 30)
  --offline-install      require npm's cache-only install mode
  --keep-temp            preserve isolated install roots for debugging
  -h, --help`)
}

function splitList(value) {
    return String(value || '').split(',').map((item) => item.trim()).filter(Boolean)
}
