import {spawn} from 'node:child_process'
import {createInterface} from 'node:readline'
import {round} from './values.mjs'

export class McpClient {
    constructor(command, args, {cwd, timeoutMs = 120_000, env = process.env} = {}) {
        this.timeoutMs = timeoutMs
        this.nextId = 1
        this.pending = new Map()
        this.stderr = ''
        this.closedError = null
        this.child = spawn(command, args, {
            cwd,
            env,
            stdio: ['pipe', 'pipe', 'pipe'],
            windowsHide: true,
        })
        this.child.stderr.setEncoding('utf8')
        this.child.stderr.on('data', (chunk) => {
            this.stderr = `${this.stderr}${chunk}`.slice(-32_768)
        })
        this.child.stdin.on('error', (error) => this.#markClosed(error))
        this.child.once('error', (error) => this.#markClosed(error))
        this.child.once('exit', (code, signal) => {
            this.#markClosed(new Error(`MCP process exited code=${code} signal=${signal}; ${this.stderr}`))
        })
        const lines = createInterface({input: this.child.stdout})
        lines.on('line', (line) => this.#handleLine(line))
    }

    async initialize() {
        const response = await this.request('initialize', {
            protocolVersion: '2025-06-18',
            capabilities: {},
            clientInfo: {name: 'weavatrix-tool-harness', version: '1'},
        })
        this.notify('notifications/initialized', {})
        return response
    }

    request(method, params = {}) {
        if (this.closedError) return Promise.reject(this.closedError)
        const id = this.nextId++
        const request = {jsonrpc: '2.0', id, method, params}
        return new Promise((resolvePromise, rejectPromise) => {
            const timer = setTimeout(() => {
                this.pending.delete(String(id))
                const error = new Error(`${method} timed out after ${this.timeoutMs} ms`)
                error.stderr = this.stderr
                rejectPromise(error)
            }, this.timeoutMs)
            this.pending.set(String(id), {resolve: resolvePromise, reject: rejectPromise, timer})
            try {
                this.child.stdin.write(`${JSON.stringify(request)}\n`, (error) => {
                    if (error) this.#rejectOne(id, error)
                })
            } catch (error) {
                this.#rejectOne(id, error)
            }
        })
    }

    notify(method, params = {}) {
        if (this.closedError || this.child.stdin.destroyed) return false
        try {
            this.child.stdin.write(`${JSON.stringify({jsonrpc: '2.0', method, params})}\n`)
            return true
        } catch {
            return false
        }
    }

    async call(name, args) {
        const started = performance.now()
        const message = await this.request('tools/call', {name, arguments: args})
        return {
            wallMs: round(performance.now() - started),
            response: normalizeMcpResponse(message),
        }
    }

    async close() {
        if (this.child.exitCode !== null || this.child.signalCode !== null) return
        this.#rejectAll(new Error('MCP client closed by harness'))
        if (!this.child.stdin.destroyed) this.child.stdin.end()
        await new Promise((resolvePromise) => {
            let settled = false
            const finish = () => {
                if (settled) return
                settled = true
                clearTimeout(forceTimer)
                resolvePromise()
            }
            const forceTimer = setTimeout(() => {
                try {
                    this.child.kill('SIGKILL')
                } catch {
                    // The process may have exited between the timeout and kill.
                }
                finish()
            }, 2_000)
            forceTimer.unref()
            this.child.once('exit', finish)
            try {
                this.child.kill()
            } catch {
                finish()
            }
        })
    }

    #handleLine(line) {
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

    #rejectOne(id, error) {
        const slot = this.pending.get(String(id))
        if (!slot) return
        this.pending.delete(String(id))
        clearTimeout(slot.timer)
        error.stderr ||= this.stderr
        slot.reject(error)
    }

    #markClosed(error) {
        error.stderr ||= this.stderr
        this.closedError = error
        this.#rejectAll(error)
    }

    #rejectAll(error) {
        for (const slot of this.pending.values()) {
            clearTimeout(slot.timer)
            slot.reject(error)
        }
        this.pending.clear()
    }
}

export function normalizeMcpResponse(message) {
    if (message.error) {
        return {
            ok: false,
            error: message.error.message || JSON.stringify(message.error),
            responseSchema: {jsonrpc: message.jsonrpc || null, kind: 'json-rpc-error'},
            raw: message,
        }
    }
    const result = message.result || {}
    const text = result.content?.find((item) => item.type === 'text')?.text || ''
    let value = result.structuredContent
    if (value === undefined && text) {
        try {
            value = JSON.parse(text.replace(/^\uFEFF/, ''))
        } catch {
            value = null
        }
    }
    const errorText = result.isError ? text || 'tool returned isError=true' : null
    return {
        ok: !result.isError,
        value,
        text: text.slice(0, 16_384),
        error: errorText,
        metrics: result._meta?.['weavatrix/metrics'] || null,
        responseSchema: {
            jsonrpc: message.jsonrpc || null,
            kind: result.isError ? 'mcp-tool-error' : 'mcp-tool-result',
            structuredContent: result.structuredContent !== undefined,
            schemaVersion: value?.schemaVersion || null,
        },
    }
}
