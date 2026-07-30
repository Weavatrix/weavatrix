import {spawn} from 'node:child_process'
import {createInterface} from 'node:readline'
import {
    processExists,
    startMemoryMonitor,
    terminateProcessTree,
} from './memory.mjs'
import {round, tail, waitForPromise, waitForSpawn} from './utils.mjs'

export class InstalledMcpClient {
    constructor({entry, repository, timeoutMs, memoryIntervalMs, runtimeEnvironment}) {
        this.entry = entry
        this.repository = repository
        this.timeoutMs = timeoutMs
        this.memoryIntervalMs = memoryIntervalMs
        this.runtimeEnvironment = runtimeEnvironment
        this.nextId = 1
        this.pending = new Map()
        this.stderr = ''
        this.child = null
        this.exit = null
        this.exitPromise = null
        this.monitor = null
    }

    async start() {
        const runtimeEnvironment = {
            ...process.env,
            ...this.runtimeEnvironment,
            npm_config_offline: 'true',
            WEAVATRIX_OFFLINE: '1',
            HTTP_PROXY: 'http://127.0.0.1:9',
            HTTPS_PROXY: 'http://127.0.0.1:9',
            ALL_PROXY: 'http://127.0.0.1:9',
            NO_PROXY: 'localhost,127.0.0.1,::1',
        }
        const started = performance.now()
        this.child = spawn(process.execPath, [this.entry, this.repository], {
            cwd: this.repository,
            env: runtimeEnvironment,
            stdio: ['pipe', 'pipe', 'pipe'],
            windowsHide: true,
            detached: process.platform !== 'win32',
        })
        this.exitPromise = new Promise((resolvePromise) => {
            this.child.once('exit', (code, signal) => {
                this.exit = {code, signal}
                this.rejectAll(new Error(`MCP launcher exited code=${code} signal=${signal}`))
                resolvePromise(this.exit)
            })
        })
        this.child.stderr.setEncoding('utf8')
        this.child.stderr.on('data', (chunk) => {
            this.stderr = `${this.stderr}${chunk}`.slice(-65_536)
        })
        this.child.stdin.on('error', (error) => this.rejectAll(error))
        this.child.once('error', (error) => this.rejectAll(error))
        const lines = createInterface({input: this.child.stdout})
        lines.on('line', (line) => this.handleLine(line))
        await waitForSpawn(this.child, this.timeoutMs)
        this.monitor = startMemoryMonitor(this.child.pid, this.memoryIntervalMs)
        return round(performance.now() - started)
    }

    request(method, params) {
        if (!this.child || this.exit) return Promise.reject(new Error('MCP launcher is not running'))
        const id = this.nextId++
        const payload = `${JSON.stringify({jsonrpc: '2.0', id, method, params})}\n`
        return new Promise((resolvePromise, rejectPromise) => {
            const timer = setTimeout(() => {
                this.pending.delete(String(id))
                rejectPromise(new Error(
                    `${method} timed out after ${this.timeoutMs} ms; stderr: ${tail(this.stderr)}`,
                ))
            }, this.timeoutMs)
            this.pending.set(String(id), {resolve: resolvePromise, reject: rejectPromise, timer})
            this.child.stdin.write(payload, (error) => {
                if (error) this.rejectOne(id, error)
            })
        })
    }

    notify(method, params) {
        if (!this.child || this.exit || this.child.stdin.destroyed) return false
        this.child.stdin.write(`${JSON.stringify({jsonrpc: '2.0', method, params})}\n`)
        return true
    }

    handleLine(line) {
        let message
        try {
            message = JSON.parse(line.replace(/^\uFEFF/, ''))
        } catch {
            return
        }
        const slot = this.pending.get(String(message.id))
        if (!slot) return
        this.pending.delete(String(message.id))
        clearTimeout(slot.timer)
        slot.resolve(message)
    }

    async close() {
        const started = performance.now()
        let gracefulExit = Boolean(this.exit)
        let forced = false
        let cleanupError = null
        this.rejectAll(new Error('MCP session is closing'))
        if (this.child && !this.exit) {
            const outcome = await this.stopChild()
            gracefulExit = outcome.gracefulExit
            forced = outcome.forced
            cleanupError = outcome.cleanupError
        }
        const memory = await this.memoryResult()
        const identityAware = Array.isArray(memory.liveSampledProcessIdentities)
        const liveIdentities = identityAware ? memory.liveSampledProcessIdentities : []
        const knownPids = new Set(memory.sampledPids || [])
        const livePids = identityAware
            ? liveIdentities
                .map((identity) => Number(String(identity).split('|', 1)[0]))
                .filter(Number.isInteger)
            : [...knownPids].filter(processExists)
        const rootGone = Boolean(this.exit)
        return {
            stdinClosed: Boolean(this.child?.stdin.destroyed || this.child?.stdin.writableEnded),
            gracefulExit: Boolean(gracefulExit && !forced),
            forced,
            exitCode: this.exit?.code ?? null,
            signal: this.exit?.signal ?? null,
            processTreeGone: rootGone && liveIdentities.length === 0 && livePids.length === 0,
            liveSampledPids: livePids,
            liveSampledProcessIdentities: liveIdentities,
            wallMs: round(performance.now() - started),
            error: cleanupError,
        }
    }

    async memoryResult() {
        if (!this.monitor) {
            return {
                availability: 'UNAVAILABLE',
                reason: 'memory monitor did not start',
            }
        }
        if (!this.memory) this.memory = await this.monitor.result()
        return this.memory
    }

    rejectOne(id, error) {
        const slot = this.pending.get(String(id))
        if (!slot) return
        this.pending.delete(String(id))
        clearTimeout(slot.timer)
        slot.reject(error)
    }

    rejectAll(error) {
        for (const slot of this.pending.values()) {
            clearTimeout(slot.timer)
            slot.reject(error)
        }
        this.pending.clear()
    }

    async stopChild() {
        let cleanupError = null
        try {
            this.child.stdin.end()
        } catch (error) {
            cleanupError = error.message
        }
        let gracefulExit = await waitForPromise(this.exitPromise, 2_000)
        let forced = false
        if (!gracefulExit) {
            forced = true
            cleanupError ||= terminateSafely(this.child.pid, false)
            if (!await waitForPromise(this.exitPromise, 1_000)) {
                cleanupError ||= terminateSafely(this.child.pid, true)
                await waitForPromise(this.exitPromise, 1_000)
            }
        }
        gracefulExit = Boolean(this.exit)
        return {gracefulExit, forced, cleanupError}
    }
}

function terminateSafely(pid, force) {
    try {
        terminateProcessTree(pid, force)
        return null
    } catch (error) {
        return error.message
    }
}
