import {round, sha256, tryParseJson} from './utils.mjs'

export async function timedRequest(client, method, params) {
    const started = performance.now()
    const message = await client.request(method, params)
    return {wallMs: round(performance.now() - started), message}
}

export function summarizeInitialize(message) {
    return {
        ok: isSuccessfulResult(message),
        protocolVersion: message?.result?.protocolVersion || null,
        serverInfo: message?.result?.serverInfo || null,
        capabilities: message?.result?.capabilities || null,
        error: message?.error || null,
    }
}

export function summarizeToolCall(message) {
    const result = message?.result
    const text = result?.content?.find((item) => item?.type === 'text')?.text || ''
    const structured = result?.structuredContent
    const encoded = JSON.stringify(message)
    return {
        ok: isSuccessfulResult(message) && result?.isError !== true,
        isError: result?.isError === true,
        jsonRpcError: message?.error || null,
        responseBytes: Buffer.byteLength(encoded),
        responseSha256: sha256(encoded),
        contentTypes: result?.content?.map((item) => item?.type).filter(Boolean) || [],
        structuredContent: structured !== undefined,
        parseableTextJson: Boolean(text && tryParseJson(text) !== null),
    }
}

export function toolCallInvariants(tool, message, label) {
    const result = message?.result
    const resultValue = result?.structuredContent
        ?? tryParseJson(result?.content?.find((item) => item?.type === 'text')?.text || '')
    const checks = [
        invariant(`${label} ${tool} returns a JSON-RPC result`, isSuccessfulResult(message), responseFailure(message)),
        invariant(`${label} ${tool} does not return isError`, result?.isError !== true, result?.isError ? 'isError=true' : null),
        invariant(
            `${label} ${tool} returns content or structuredContent`,
            Boolean(result && (Array.isArray(result.content) || result.structuredContent !== undefined)),
            null,
        ),
    ]
    if (tool === 'graph_stats' && resultValue && typeof resultValue === 'object') {
        const counts = findGraphCounts(resultValue)
        checks.push(invariant(
            `${label} graph_stats exposes non-negative graph counts`,
            counts !== null,
            counts ? null : 'node/edge counts were not found as non-negative numbers',
        ))
    }
    return checks
}

export function isSuccessfulResult(message) {
    return message?.jsonrpc === '2.0'
        && message.error === undefined
        && message.result !== undefined
}

export function responseFailure(message) {
    if (!message) return 'no response'
    if (message.error) return message.error.message || JSON.stringify(message.error)
    if (message.jsonrpc !== '2.0') return `unexpected jsonrpc=${message.jsonrpc}`
    if (message.result === undefined) return 'response has no result'
    return null
}

export function invariant(name, pass, detail) {
    return {name, pass: Boolean(pass), ...(detail ? {detail} : {})}
}

function findGraphCounts(value) {
    const candidates = [
        [value.nodes, value.edges],
        [value.nodeCount, value.edgeCount],
        [value.stats?.nodes, value.stats?.edges],
        [value.graph?.nodes, value.graph?.edges],
    ]
    const structured = candidates.find(([nodes, edges]) => Number.isFinite(nodes)
        && nodes >= 0
        && Number.isFinite(edges)
        && edges >= 0)
    if (structured) return structured
    for (const text of [value.text, value.result?.text]) {
        if (typeof text !== 'string') continue
        const nodes = text.match(/\bNodes:\s*(\d+)/i)
        const edges = text.match(/\bEdges:\s*(\d+)/i)
        if (nodes && edges) return [Number(nodes[1]), Number(edges[1])]
    }
    return null
}
