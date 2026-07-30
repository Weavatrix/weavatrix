import {InstalledMcpClient} from './client.mjs'
import {
    invariant,
    isSuccessfulResult,
    responseFailure,
    summarizeInitialize,
    summarizeToolCall,
    timedRequest,
    toolCallInvariants,
} from './protocol.mjs'
import {summarizeNumbers} from './report.mjs'
import {prepareRuntimeIsolation} from './runtime.mjs'
import {round, serializeError, sha256, tail} from './utils.mjs'

export async function benchmarkSession(configuration) {
    const isolation = prepareRuntimeIsolation(configuration.isolationRoot)
    const client = new InstalledMcpClient({
        entry: configuration.launcher.entry,
        repository: configuration.repository,
        timeoutMs: configuration.timeoutMs,
        memoryIntervalMs: configuration.memoryIntervalMs,
        runtimeEnvironment: isolation.environment,
    })
    const session = createSession(configuration, isolation.report)
    const coldBoundaryStarted = performance.now()
    try {
        await executeProtocol(client, session, configuration, coldBoundaryStarted)
    } catch (error) {
        session.error = serializeError(error)
        session.invariants.push(invariant(
            'session completed without protocol error',
            false,
            error.message,
        ))
    } finally {
        await finishSession(client, session)
    }
    session.status = session.invariants.every((item) => item.pass) ? 'PASS' : 'FAIL'
    session.engine = configuration.engine
    return session
}

async function executeProtocol(client, session, configuration, coldBoundaryStarted) {
    session.timings.startMs = await client.start()
    await initialize(client, session, configuration.launcher)
    await listTools(client, session, configuration.tool)
    await callTools(client, session, configuration, coldBoundaryStarted)
}

async function initialize(client, session, launcher) {
    const initialized = await timedRequest(client, 'initialize', {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: {name: 'weavatrix-npm-mcp-boundary', version: '1'},
    })
    session.timings.initializeMs = initialized.wallMs
    session.protocol.initialize = summarizeInitialize(initialized.message)
    const initializedVersion = session.protocol.initialize.serverInfo?.version ?? null
    const expectedRuntimeVersion = launcher.version
    Object.assign(session.protocol.initialize, {
        installedPackageVersion: launcher.version,
        expectedRuntimeVersion,
        packageVersionMatch: initializedVersion === expectedRuntimeVersion,
    })
    session.invariants.push(invariant(
        'initialize returns a JSON-RPC result',
        isSuccessfulResult(initialized.message),
        responseFailure(initialized.message),
    ))
    session.invariants.push(invariant(
        'initialize server version matches the package engine version',
        initializedVersion === expectedRuntimeVersion,
        `package=${launcher.version}; engine=${expectedRuntimeVersion}; initialize=${initializedVersion ?? '(missing)'}`,
    ))
    client.notify('notifications/initialized', {})
}

async function listTools(client, session, requestedTool) {
    const listed = await timedRequest(client, 'tools/list', {})
    session.timings.listMs = listed.wallMs
    const toolNames = listed.message?.result?.tools
        ?.map((item) => item?.name)
        .filter(Boolean)
        || []
    session.protocol.tools = {
        count: toolNames.length,
        requestedAdvertised: toolNames.includes(requestedTool),
        catalogSha256: sha256(JSON.stringify([...toolNames].sort())),
    }
    session.invariants.push(invariant(
        'tools/list returns a non-empty catalog',
        isSuccessfulResult(listed.message) && toolNames.length > 0,
        responseFailure(listed.message),
    ))
    session.invariants.push(invariant(
        `tools/list advertises ${requestedTool}`,
        toolNames.includes(requestedTool),
        toolNames.includes(requestedTool) ? null : `available tool count: ${toolNames.length}`,
    ))
}

async function callTools(client, session, configuration, coldBoundaryStarted) {
    const params = {name: configuration.tool, arguments: configuration.toolArguments}
    const cold = await timedRequest(client, 'tools/call', params)
    session.timings.coldCallMs = cold.wallMs
    session.timings.coldBoundaryMs = round(performance.now() - coldBoundaryStarted)
    session.coldCall = summarizeToolCall(cold.message)
    session.invariants.push(...toolCallInvariants(
        configuration.tool,
        cold.message,
        'cold',
    ))
    for (let sample = 0; sample < configuration.warmSamples; sample += 1) {
        const warm = await timedRequest(client, 'tools/call', params)
        session.timings.warmCallMs.push(warm.wallMs)
        session.warmCalls.push(summarizeToolCall(warm.message))
        session.invariants.push(...toolCallInvariants(
            configuration.tool,
            warm.message,
            `warm[${sample}]`,
        ))
    }
    session.timings.warmCallSummaryMs = summarizeNumbers(session.timings.warmCallMs)
}

async function finishSession(client, session) {
    session.cleanup = await client.close()
    session.memory = await client.memoryResult()
    session.stderrTail = tail(client.stderr, 8_192)
    session.invariants.push(invariant(
        'MCP launcher process tree cleaned up',
        session.cleanup.processTreeGone === true,
        session.cleanup.processTreeGone === true
            ? null
            : session.cleanup.error || 'one or more sampled PIDs remain alive',
    ))
    if (session.memory.availability === 'AVAILABLE') {
        session.invariants.push(invariant(
            'process-tree memory sample is non-zero',
            session.memory.peakProcessTreeRssBytes > 0,
            null,
        ))
    }
}

function createSession(configuration, isolation) {
    return {
        tool: configuration.tool,
        toolArguments: configuration.toolArguments,
        pairId: configuration.pairId,
        coldSample: configuration.coldSample,
        orderPosition: configuration.orderPosition,
        isolation,
        timings: {warmCallMs: []},
        protocol: {},
        coldCall: null,
        warmCalls: [],
        invariants: [],
        memory: null,
        cleanup: null,
    }
}
