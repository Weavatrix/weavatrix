import {git, stableHash} from '../tool-harness-lib.mjs'

export async function runGroundTruthChecks(context) {
    return [
        await checkCrossRepoGit(context),
        await checkVectorSearch(context),
        await checkSemanticLink(context),
        await checkSeoLinks(context),
        await checkMemoryContext(context),
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

async function checkVectorSearch(context) {
    const args = {
        vectors: [
            {node: 'alpha', values: [1, 0, 0]},
            {node: 'beta', values: [0.9, 0.1, 0]},
            {node: 'gamma', values: [0, 1, 0]},
        ],
        query: [1, 0, 0],
        top_k: 3,
        exact: true,
        output_format: 'json',
    }
    const call = await context.client.call('vector_search', args)
    const hits = call.response.value?.hits || []
    return result(context, 'vector_search', args, call, [
        {name: 'exact-backend', pass: call.response.value?.exact === true},
        {name: 'known-cosine-order', pass: hits.map((hit) => hit.node).join(',') === 'alpha,beta,gamma'},
        {name: 'self-distance-zero', pass: Math.abs(Number(hits[0]?.distance)) < 1e-6},
        {
            name: 'monotonic-distance',
            pass: hits.every((hit, index) =>
                index === 0 || hit.distance >= hits[index - 1].distance),
        },
    ])
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

async function checkSeoLinks(context) {
    const args = {
        vectors: semanticVectors(context.nodeIds),
        pages: [
            {node: context.nodeIds[0], site: 'docs', canonical: '/alpha', language: 'en'},
            {
                node: context.nodeIds[1],
                site: 'docs',
                canonical: '/beta',
                language: 'en',
                cornerstone: true,
                target_priority: 10,
            },
            {node: context.nodeIds[2], site: 'docs', canonical: '/gamma', language: 'fr'},
        ],
        min_similarity: 0.5,
        top_k: 2,
        selection: 'directed',
        allow_cross_language: false,
        model: 'ground-truth-3d',
        output_format: 'json',
    }
    const call = await context.client.call('seo_link_suggestions', args)
    const links = call.response.value?.recommendations || call.response.value?.edges || []
    return result(context, 'seo_link_suggestions', args, call, [
        {name: 'no-source-mutation', pass: call.response.value?.mutation === 'NONE'},
        {name: 'no-self-links', pass: links.every((edge) => sourceOf(edge) !== targetOf(edge))},
        {
            name: 'language-policy',
            pass: links.every((edge) => {
                const left = context.nodeIds.indexOf(sourceOf(edge))
                const right = context.nodeIds.indexOf(targetOf(edge))
                return left < 2 && right < 2
            }),
        },
        {
            name: 'cornerstone-similar-target',
            pass: links.some((edge) => targetOf(edge) === context.nodeIds[1]),
        },
    ])
}

async function checkMemoryContext(context) {
    const args = {
        events: [{
            metadata: {
                id: 'event:test',
                stream_id: 'stream:test',
                stream_version: 0,
                global_position: 0,
                event_type: 'node_upserted',
                occurred_at: 1,
                recorded_at: 1,
                agent_id: 'agent:test',
                session_id: 'session:test',
            },
            payload: {
                type: 'node_upserted',
                node: {id: 'task:test', kind: 'task', label: 'Test task', attributes: {}},
            },
        }],
        request: {
            seeds: ['task:test'],
            valid_at: 2,
            known_at: 2,
            token_budget: 1000,
            max_depth: 2,
            relations: [],
            repositories: [],
            branches: [],
        },
        output_format: 'json',
    }
    const call = await context.client.call('memory_context', args)
    const serialized = JSON.stringify(call.response.value || {})
    return result(context, 'memory_context', args, call, [
        {name: 'no-mutation', pass: call.response.value?.mutation === 'NONE'},
        {name: 'seed-present-in-view', pass: serialized.includes('task:test')},
        {name: 'budget-respected', pass: call.response.value?.receipt?.estimated_tokens <= 1000},
        {
            name: 'receipt-preserves-time',
            pass: call.response.value?.receipt?.valid_at === 2
                && call.response.value?.receipt?.known_at === 2,
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
