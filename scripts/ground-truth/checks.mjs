import {git, stableHash} from '../tool-harness-lib.mjs'

export async function runGroundTruthChecks(context) {
    return [
        await checkCrossRepoGit(context),
        await checkClosedLibraryTool(context, 'vector_search'),
        await checkSemanticLink(context),
        await checkClosedLibraryTool(context, 'seo_link_suggestions'),
        await checkClosedLibraryTool(context, 'memory_context'),
    ]
}

async function checkCrossRepoGit(context) {
    const repositories = context.historyRepos.map((repo) => ({
        name: repo.id,
        path: repo.absolutePath,
    }))
    const args = {
        repositories,
        action: 'histories',
        revision: 'HEAD',
        max_commits: 25,
        output_format: 'json',
    }
    const call = await context.client.call('cross_repo_git', args)
    const output = call.response.value
    const actual = new Map((output?.repositories || []).map((item) => [item.name, item]))
    const expected = Object.fromEntries(context.historyRepos.map((repo) => {
        const commits = git(repo.absolutePath, ['rev-list', '--max-count=25', 'HEAD'])
            .split(/\r?\n/).filter(Boolean)
        return [repo.id, {head: git(repo.absolutePath, ['rev-parse', 'HEAD']), commits}]
    }))
    const invariants = context.historyRepos.flatMap((repo) => {
        const item = actual.get(repo.id)
        return [
            {name: `${repo.id}:head`, pass: item?.head === expected[repo.id].head},
            {
                name: `${repo.id}:bounded-ordered-history`,
                pass: Array.isArray(item?.commits)
                    && item.commits.length <= 25
                    && item.commits.every((commit, index) =>
                        commit === expected[repo.id].commits[index]),
            },
        ]
    })
    return result(context, 'cross_repo_git', args, call, invariants, {
        expectedHeads: Object.fromEntries(
            Object.entries(expected).map(([name, value]) => [name, value.head]),
        ),
    })
}

async function checkClosedLibraryTool(context, name) {
    const args = {output_format: 'json'}
    const call = await context.client.call(name, args)
    const error = `${call.response.error || ''}`
    const pass = call.response.ok === false
        && (error.includes('unknown tool') || error.includes('is not an MCP tool'))
    return {
        tool: name,
        pass,
        fixtureHash: stableHash(args),
        timingMs: call.wallMs,
        invariants: [{name: 'closed-in-mcp', pass}],
        ...((context.includeOutput || !pass) ? {output: {error}} : {}),
    }
}

async function checkSemanticLink(context) {
    const args = {
        vectors: semanticVectors(context.nodeIds),
        min_similarity: 0.5,
        selection: 'mutual',
        top_k: 2,
        model: 'ground-truth-3d',
        output_format: 'json',
    }
    const call = await context.client.call('semantic_link', args)
    const links = call.response.value?.links
        || call.response.value?.edges
        || call.response.value?.recommendations
        || []
    return result(context, 'semantic_link', args, call, [
        {
            name: 'reports-exact-candidates-for-small-fixture',
            pass: deepBoolean(call.response.value, 'candidate_exact') !== false,
        },
        {name: 'no-self-links', pass: links.every((edge) => sourceOf(edge) !== targetOf(edge))},
        {
            name: 'only-fixture-nodes',
            pass: links.every((edge) =>
                context.nodeIds.includes(sourceOf(edge))
                && context.nodeIds.includes(targetOf(edge))),
        },
        {
            name: 'similar-pair-linked',
            pass: hasPair(links, context.nodeIds[0], context.nodeIds[1]),
        },
    ])
}

function result(context, tool, args, call, invariants, oracle = undefined) {
    const pass = call.response.ok && invariants.every((invariant) => invariant.pass)
    return {
        tool,
        pass,
        fixtureHash: stableHash(args),
        timingMs: call.wallMs,
        invariants,
        ...(oracle ? {oracle} : {}),
        ...((context.includeOutput || !pass) ? {
            output: call.response.ok ? call.response.value : {error: call.response.error},
        } : {}),
    }
}

function semanticVectors(nodeIds) {
    return [
        {node: nodeIds[0], values: [1, 0, 0]},
        {node: nodeIds[1], values: [0.95, 0.05, 0]},
        {node: nodeIds[2], values: [0, 1, 0]},
    ]
}

function sourceOf(edge) {
    return edge?.source?.id || edge?.source || edge?.from || edge?.source_node
}

function targetOf(edge) {
    return edge?.target?.id || edge?.target || edge?.to || edge?.target_node
}

function hasPair(edges, left, right) {
    return edges.some((edge) => (sourceOf(edge) === left && targetOf(edge) === right)
        || (sourceOf(edge) === right && targetOf(edge) === left))
}

function deepBoolean(value, key) {
    if (!value || typeof value !== 'object') return undefined
    if (typeof value[key] === 'boolean') return value[key]
    for (const child of Object.values(value)) {
        const found = deepBoolean(child, key)
        if (found !== undefined) return found
    }
    return undefined
}
