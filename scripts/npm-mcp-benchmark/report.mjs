import {round} from './utils.mjs'

export function summarizeEngine(engine) {
    const sessions = engine.sessions
    const toolNames = [...new Set(sessions.map((session) => session.tool))]
    const identityPass = engine.identity?.invariants?.every((item) => item.pass) === true
    return {
        status: identityPass && sessions.every((session) => session.status === 'PASS')
            ? 'PASS'
            : 'FAIL',
        identityPass,
        tools: toolNames.length,
        passingTools: toolNames.filter((tool) => sessions
            .filter((session) => session.tool === tool)
            .every((session) => session.status === 'PASS')).length,
        coldSessions: sessions.length,
        passingColdSessions: sessions.filter((session) => session.status === 'PASS').length,
        startMs: summarizeNumbers(sessions
            .map((session) => session.timings.startMs).filter(Number.isFinite)),
        initializeMs: summarizeNumbers(sessions
            .map((session) => session.timings.initializeMs).filter(Number.isFinite)),
        listMs: summarizeNumbers(sessions
            .map((session) => session.timings.listMs).filter(Number.isFinite)),
        coldCallMs: summarizeNumbers(sessions
            .map((session) => session.timings.coldCallMs).filter(Number.isFinite)),
        coldBoundaryMs: summarizeNumbers(sessions
            .map((session) => session.timings.coldBoundaryMs).filter(Number.isFinite)),
        warmCallMs: summarizeNumbers(sessions.flatMap((session) => session.timings.warmCallMs)),
        peakProcessTreeRssBytes: summarizeNumbers(sessions
            .map((session) => session.memory?.peakProcessTreeRssBytes)
            .filter(Number.isFinite)),
    }
}

export function summarizeReport(fullReport) {
    const rust = fullReport.engines.rust?.summary
    const javascript = fullReport.engines.javascript?.summary
    const pairedColdBoundary = summarizePairedColdBoundaries(fullReport)
    return {
        status: fullReport.status,
        rust: rust || null,
        javascript: javascript || null,
        pairedColdBoundary,
        ratios: rust && javascript ? {
            installJavascriptOverRust: ratio(
                fullReport.engines.javascript.install.wallMs,
                fullReport.engines.rust.install.wallMs,
            ),
            coldCallJavascriptOverRust: ratio(
                javascript.coldCallMs.median,
                rust.coldCallMs.median,
            ),
            coldBoundaryJavascriptOverRust: ratio(
                javascript.coldBoundaryMs.median,
                rust.coldBoundaryMs.median,
            ),
            warmCallJavascriptOverRust: ratio(
                javascript.warmCallMs.median,
                rust.warmCallMs.median,
            ),
            peakRssJavascriptOverRust: ratio(
                javascript.peakProcessTreeRssBytes.max,
                rust.peakProcessTreeRssBytes.max,
            ),
        } : null,
    }
}

export function buildPerformanceGate(summary, minimumSpeedup, minimumWarmSpeedup) {
    const measuredSpeedup = summary.pairedColdBoundary?.speedup?.median ?? null
    const measuredWarmSpeedup = summary.ratios?.warmCallJavascriptOverRust ?? null
    const byTool = summary.pairedColdBoundary?.byTool ?? {}
    const slowerOrEqualTools = Object.entries(byTool)
        .filter(([, value]) => !Number.isFinite(value.speedup?.median)
            || value.speedup.median <= 1)
        .map(([tool]) => tool)
    return {
        metric: 'median paired fresh-process coldBoundaryMs speedup (JavaScript / Rust)',
        boundary: 'installed package bin spawn through first successful tools/call response',
        ordering: 'alternating Rust-first and JavaScript-first within matched tool/sample pairs',
        pairs: summary.pairedColdBoundary?.pairs ?? 0,
        byTool,
        minimumSpeedup,
        measuredSpeedup,
        warmMetric: 'median warm tools/call latency speedup (JavaScript / Rust)',
        minimumWarmSpeedup,
        measuredWarmSpeedup,
        everySelectedToolFasterThanJavaScript: slowerOrEqualTools.length === 0,
        slowerOrEqualTools,
        pass: Number.isFinite(measuredSpeedup)
            && measuredSpeedup >= minimumSpeedup
            && Number.isFinite(measuredWarmSpeedup)
            && measuredWarmSpeedup >= minimumWarmSpeedup
            && slowerOrEqualTools.length === 0,
    }
}

export function allInvariantsPass(fullReport) {
    return Object.values(fullReport.engines).every((engine) => engine.summary?.status === 'PASS')
}

export function summarizeNumbers(numbers) {
    const values = numbers.filter(Number.isFinite).sort((left, right) => left - right)
    if (values.length === 0) {
        return {samples: 0, min: null, median: null, p95: null, max: null}
    }
    return {
        samples: values.length,
        min: round(values[0]),
        median: round(percentile(values, 0.5)),
        p95: round(percentile(values, 0.95)),
        max: round(values.at(-1)),
    }
}

function summarizePairedColdBoundaries(fullReport) {
    const measurements = (fullReport.execution?.pairs || []).flatMap((pair) => {
        const rust = pair.sessions?.rust?.coldBoundaryMs
        const javascript = pair.sessions?.javascript?.coldBoundaryMs
        if (!Number.isFinite(rust) || !Number.isFinite(javascript) || rust <= 0) return []
        return [{
            pairId: pair.id,
            tool: pair.tool,
            coldSample: pair.coldSample,
            order: pair.order,
            rustMs: rust,
            javascriptMs: javascript,
            speedup: javascript / rust,
        }]
    })
    const byTool = {}
    for (const tool of new Set(measurements.map((item) => item.tool))) {
        const selected = measurements.filter((item) => item.tool === tool)
        byTool[tool] = {
            pairs: selected.length,
            rustMs: summarizeNumbers(selected.map((item) => item.rustMs)),
            javascriptMs: summarizeNumbers(selected.map((item) => item.javascriptMs)),
            speedup: summarizeNumbers(selected.map((item) => item.speedup)),
        }
    }
    return {
        pairs: measurements.length,
        speedup: summarizeNumbers(measurements.map((item) => item.speedup)),
        byTool,
        measurements: measurements.map((item) => ({
            ...item,
            speedup: round(item.speedup),
        })),
    }
}

function percentile(sorted, quantile) {
    if (sorted.length === 1) return sorted[0]
    const position = (sorted.length - 1) * quantile
    const lower = Math.floor(position)
    const fraction = position - lower
    return sorted[lower]
        + (sorted[Math.min(lower + 1, sorted.length - 1)] - sorted[lower]) * fraction
}

function ratio(numerator, denominator) {
    return Number.isFinite(numerator) && Number.isFinite(denominator) && denominator > 0
        ? round(numerator / denominator)
        : null
}
