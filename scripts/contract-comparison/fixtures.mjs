import {existsSync} from 'node:fs'
import {firstAnchor} from '../tool-harness-lib.mjs'

export function fixtureFor(tool, entry, crossFixture) {
    const first = firstAnchor(entry)
    const symbol = entry.symbol || first
    const endpoint = entry.endpoint || {path: '/__weavatrix_harness_not_found__'}
    const base = {
        graph_stats: {},
        get_node: {label: first},
        get_neighbors: {label: first, max_results: 50},
        query_graph: {question: first, depth: 2, mode: 'bfs', token_budget: 1200},
        god_nodes: {top_n: 10, include_classified: false},
        shortest_path: {source: first, target: first, max_hops: 8},
        get_dependents: {label: first, depth: 2, max_nodes: 30, precision: 'graph'},
        change_impact: {base: 'HEAD', files: [first], depth: 2, max_nodes: 30, precision: 'graph'},
        git_history: {months: 6, max_commits: 100, min_pair_count: 2, max_pairs: 30, top_n: 10},
        verified_change: {
            task: `Review ${first} without changing source`,
            phase: 'plan',
            base_ref: 'HEAD',
            files: [first],
            precision: 'graph',
            max_symbols: 3,
            impact_depth: 2,
            max_impact_nodes: 30,
            duplicate_ratchet: true,
            run_tests: false,
        },
        trace_api_contract: crossFixture || {
            backend: entry.absolutePath,
            clients: [entry.absolutePath],
            transport: 'all',
            max_endpoints: 30,
            max_matches: 100,
            top_n: 10,
        },
        get_community: {community_id: 0, max_nodes: 50},
        search_code: {query: entry.search || symbol, is_regex: false, max_results: 40},
        read_source: {path: first, start_line: 1, before: 0, after: 20},
        inspect_symbol: {label: first, precision: 'graph', max_references: 100, max_containers: 10},
        context_bundle: {label: first, precision: 'graph', max_related: 8, max_source_files: 3},
        find_duplicates: {mode: 'renamed', min_tokens: 50, min_similarity: 80, top_n: 15},
        find_dead_code: {min_confidence: 'medium', top_n: 30},
        run_audit: {max_findings: 30, include_classified: false},
        coverage_map: {top_n: 15},
        hot_path_review: {top_n: 20, min_score: 85, include_tests: false},
        list_communities: {top_n: 20},
        module_map: {top_n: 25, include_non_product: false},
        list_endpoints: {max_results: 100, include_classified: false},
        trace_endpoint: {path: endpoint.path, ...(endpoint.method ? {method: endpoint.method} : {}), max_depth: 3},
        rebuild_graph: {scope: first, precision: 'off'},
        graph_diff: {base_ref: 'HEAD'},
        get_architecture_contract: {},
        prepare_change: {intent: `Review ${first}`, files: [first]},
        verify_architecture: {},
        explain_architecture_violation: {fingerprint: '__weavatrix_harness_missing__'},
        propose_architecture_exception: {
            fingerprint: '__weavatrix_harness_missing__',
            reason: 'differential harness proposal only',
            expires: '2099-12-31',
        },
        open_repo: {path: entry.absolutePath, build: false, precision: 'off'},
        list_known_repos: {},
    }[tool]
    return {...base, output_format: 'json'}
}

export function crossRepositoryFixture(entry, manifest) {
    const spec = (manifest.crossRepositoryFixtures || []).find((item) => item.backend === entry.id)
    if (!spec) return null
    const backend = manifest.byId.get(spec.backend)
    const clients = spec.clients.map((id) => manifest.byId.get(id)).filter(Boolean)
    if (!backend || clients.length !== spec.clients.length) return null
    if (![backend, ...clients].every((item) => existsSync(item.absolutePath))) return null
    return {
        backend: backend.absolutePath,
        clients: clients.map((item) => item.absolutePath),
        transport: 'all',
        max_endpoints: 100,
        max_matches: 500,
        max_affected_files: 100,
        top_n: 10,
    }
}

export function evidenceScope(entry, tool, args) {
    const path = args.path || args.handler_file || args.files?.[0]
        || args.changed_files?.[0] || firstAnchor(entry)
    return {
        repository: entry.id,
        languages: entry.languages,
        call: tool,
        span: {
            path,
            startLine: args.start_line || null,
            endLine: args.start_line
                ? args.start_line + Number(args.after || 0)
                : null,
        },
        selector: args.label || args.question || args.fingerprint || null,
    }
}
