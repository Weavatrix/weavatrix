import {spawn, spawnSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import {safeReadDirectory, tail, waitForValue} from './utils.mjs'
import {WINDOWS_MEMORY_MONITOR_SCRIPT} from './windows-monitor-script.mjs'

export function startMemoryMonitor(rootPid, intervalMs) {
    if (process.platform === 'linux') return linuxMemoryMonitor(rootPid, intervalMs)
    if (process.platform === 'win32') return windowsMemoryMonitor(rootPid, intervalMs)
    return {
        result: async () => ({
            availability: 'UNAVAILABLE',
            reason: `process-tree RSS sampler is not implemented reliably for ${process.platform}`,
            peakProcessTreeRssBytes: null,
            sampledPids: [],
        }),
    }
}

export function terminateProcessTree(pid, force) {
    if (!pid || !processExists(pid)) return
    if (process.platform === 'win32') {
        const result = spawnSync('taskkill.exe', [
            '/PID',
            String(pid),
            '/T',
            ...(force ? ['/F'] : []),
        ], {encoding: 'utf8', windowsHide: true, timeout: 5_000})
        if (result.error) throw result.error
        if (result.status !== 0 && processExists(pid)) {
            throw new Error(`taskkill failed (${result.status}): ${tail(result.stderr || result.stdout)}`)
        }
        return
    }
    process.kill(-pid, force ? 'SIGKILL' : 'SIGTERM')
}

export function processExists(pid) {
    if (!pid) return false
    try {
        process.kill(pid, 0)
        return true
    } catch (error) {
        return error?.code === 'EPERM'
    }
}

function linuxMemoryMonitor(rootPid, intervalMs) {
    let peak = 0
    let samples = 0
    const seen = new Set()
    const sample = () => {
        const rows = linuxProcessRows()
        const ids = descendants(rows, rootPid)
        let total = 0
        for (const row of rows) {
            if (!ids.has(row.pid)) continue
            seen.add(row.identity)
            try {
                const status = readFileSync(`/proc/${row.pid}/status`, 'utf8')
                const rss = status.match(/^VmRSS:\s+(\d+)\s+kB$/m)
                if (rss) total += Number(rss[1]) * 1024
            } catch {
                // The process may exit between the tree and RSS reads.
            }
        }
        if (total > peak) peak = total
        samples += 1
    }
    sample()
    const timer = setInterval(sample, intervalMs)
    timer.unref()
    return {
        result: async () => {
            clearInterval(timer)
            sample()
            const liveIdentities = [...seen].filter(linuxIdentityExists)
            return {
                availability: samples > 0 ? 'AVAILABLE' : 'UNAVAILABLE',
                method: 'linux-/proc-process-tree-sampling',
                sampleIntervalMs: intervalMs,
                samples,
                peakProcessTreeRssBytes: peak || null,
                sampledPids: [...seen].map((identity) => Number(identity.split('|', 1)[0])),
                sampledProcessIdentities: [...seen],
                liveSampledProcessIdentities: liveIdentities,
            }
        },
    }
}

function windowsMemoryMonitor(rootPid, intervalMs) {
    const encoded = Buffer.from(WINDOWS_MEMORY_MONITOR_SCRIPT, 'utf16le').toString('base64')
    const monitor = spawn('powershell.exe', [
        '-NoLogo', '-NoProfile', '-NonInteractive', '-EncodedCommand', encoded,
    ], {
        env: {
            ...process.env,
            WEAVATRIX_BENCHMARK_ROOT_PID: String(rootPid),
            WEAVATRIX_BENCHMARK_MEMORY_INTERVAL_MS: String(intervalMs),
        },
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
    })
    let stdout = ''
    let stderr = ''
    monitor.stdout.setEncoding('utf8')
    monitor.stderr.setEncoding('utf8')
    monitor.stdout.on('data', (chunk) => { stdout += chunk })
    monitor.stderr.on('data', (chunk) => { stderr += chunk })
    const completed = new Promise((resolvePromise) => {
        monitor.once('exit', (code) => resolvePromise({code, stdout, stderr}))
        monitor.once('error', (error) => resolvePromise({code: null, error, stdout, stderr}))
    })
    return {result: async () => windowsMemoryResult(monitor, completed)}
}

async function windowsMemoryResult(monitor, completed) {
    const outcome = await waitForValue(completed, 7_000)
    if (!outcome) {
        try {
            monitor.kill()
        } catch {
            // Monitor availability is reported below.
        }
        return unavailable('Windows process-tree memory monitor did not finish')
    }
    if (outcome.error || outcome.code !== 0) {
        return unavailable(
            outcome.error?.message || tail(outcome.stderr) || `monitor exit ${outcome.code}`,
        )
    }
    try {
        return JSON.parse(outcome.stdout.replace(/^\uFEFF/, '').trim())
    } catch (error) {
        return unavailable(`invalid Windows memory monitor output: ${error.message}`)
    }
}

function unavailable(reason) {
    return {
        availability: 'UNAVAILABLE',
        reason,
        peakProcessTreeRssBytes: null,
        sampledPids: [],
        liveSampledProcessIdentities: [],
    }
}

function linuxProcessRows() {
    const rows = []
    for (const entry of safeReadDirectory('/proc')) {
        if (!/^\d+$/.test(entry.name)) continue
        try {
            const stat = readFileSync(`/proc/${entry.name}/stat`, 'utf8')
            const close = stat.lastIndexOf(')')
            const fields = stat.slice(close + 2).split(' ')
            rows.push({
                pid: Number(entry.name),
                ppid: Number(fields[1]),
                identity: `${entry.name}|${fields[19]}`,
            })
        } catch {
            // The process may exit while /proc is being read.
        }
    }
    return rows
}

function linuxIdentityExists(identity) {
    const [pid, expectedStart] = identity.split('|')
    try {
        const stat = readFileSync(`/proc/${pid}/stat`, 'utf8')
        const close = stat.lastIndexOf(')')
        const fields = stat.slice(close + 2).split(' ')
        return fields[19] === expectedStart
    } catch {
        return false
    }
}

function descendants(rows, rootPid) {
    const ids = new Set([rootPid])
    let changed = true
    while (changed) {
        changed = false
        for (const row of rows) {
            if (ids.has(row.ppid) && !ids.has(row.pid)) {
                ids.add(row.pid)
                changed = true
            }
        }
    }
    return ids
}
