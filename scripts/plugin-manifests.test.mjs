import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

const root = new URL('..', import.meta.url)
const pluginRoot = new URL('../plugins/weavatrix/', import.meta.url)

const readText = (base, path) => readFileSync(new URL(path, base), 'utf8').replace(/^\uFEFF/, '')
const readJson = (base, path) => JSON.parse(readText(base, path))

const npmManifest = readJson(root, 'npm/weavatrix/package.json')
const serverManifest = readJson(root, 'server.json')
const cargoManifest = readText(root, 'Cargo.toml')
const version = npmManifest.version

const manifests = {
    codex: readJson(pluginRoot, '.codex-plugin/plugin.json'),
    cursor: readJson(pluginRoot, '.cursor-plugin/plugin.json'),
    claude: readJson(pluginRoot, '.claude-plugin/plugin.json'),
    grok: readJson(pluginRoot, '.grok-plugin/plugin.json'),
}

const toolNames = [
    'build_graph',
    'change_impact',
    'context_bundle',
    'coverage_map',
    'cross_repo_git',
    'explain_architecture_violation',
    'find_dead_code',
    'find_duplicates',
    'get_architecture_contract',
    'get_community',
    'get_dependents',
    'get_neighbors',
    'get_node',
    'git_history',
    'god_nodes',
    'graph_diff',
    'graph_stats',
    'hot_path_review',
    'inspect_symbol',
    'list_communities',
    'list_endpoints',
    'list_known_repos',
    'map_stacktrace',
    'memory_context',
    'module_map',
    'open_repo',
    'prepare_change',
    'propose_architecture_exception',
    'query_graph',
    'read_source',
    'rebuild_graph',
    'run_audit',
    'search_code',
    'select_tests',
    'semantic_link',
    'seo_link_suggestions',
    'shortest_path',
    'trace_api_contract',
    'trace_endpoint',
    'vector_search',
    'verified_change',
    'verify_architecture',
    'verify_capabilities',
]

test('plugin identity follows the published product', () => {
    assert.equal(serverManifest.version, version)
    assert.match(cargoManifest, new RegExp(`^version = "${version.replaceAll('.', '\\.')}"$`, 'm'))
    for (const [client, manifest] of Object.entries(manifests)) {
        assert.equal(manifest.name, 'weavatrix', `${client} plugin name`)
        assert.equal(manifest.version, version, `${client} plugin version`)
        assert.equal(manifest.repository, 'https://github.com/Weavatrix/weavatrix')
        assert.equal(manifest.license, 'MIT')
    }
})

test('both MCP manifests launch the pinned npm release', () => {
    for (const filename of ['.mcp.json', 'mcp.json']) {
        const config = readJson(pluginRoot, filename)
        const server = config.mcpServers?.weavatrix
        assert.ok(server, `${filename} defines weavatrix`)
        assert.equal(server.type, 'stdio')
        assert.equal(server.command, 'npx')
        assert.deepEqual(server.args, ['-y', `weavatrix@${version}`, 'mcp', '.'])
    }
})

test('client marketplaces resolve the bundled plugin', () => {
    const codex = readJson(root, '.agents/plugins/marketplace.json')
    const cursor = readJson(root, '.cursor-plugin/marketplace.json')
    const claude = readJson(root, '.claude-plugin/marketplace.json')
    const grok = readJson(root, '.grok-plugin/marketplace.json')

    assert.equal(codex.name, 'weavatrix')
    assert.equal(codex.plugins[0].source.path, './plugins/weavatrix')
    assert.equal(cursor.name, 'weavatrix')
    assert.equal(cursor.plugins[0].source, 'plugins/weavatrix')
    assert.equal(cursor.plugins[0].version, version)
    assert.equal(claude.name, 'weavatrix')
    assert.equal(claude.plugins[0].source, './plugins/weavatrix')
    assert.equal(claude.plugins[0].version, version)
    assert.equal(grok.name, 'weavatrix')
    assert.equal(grok.plugins[0].source.path, './plugins/weavatrix')
    assert.equal(grok.plugins[0].version, version)
    assert.deepEqual(grok.plugins[0].keywords, [
        'weavatrix',
        'weavatrix code graph',
        'weavatrix mcp',
    ])
})

test('the plugin skill is the released Weavatrix skill', () => {
    assert.equal(
        readText(pluginRoot, 'skills/weavatrix/SKILL.md'),
        readText(root, 'skill/SKILL.md'),
    )
    assert.equal(
        readText(pluginRoot, 'skills/weavatrix/references/tool-routing.md'),
        readText(root, 'skill/references/tool-routing.md'),
    )

    const canonicalCards = readdirSync(new URL('../skill/references/tools/', import.meta.url))
        .filter((name) => name.endsWith('.md'))
        .map((name) => name.slice(0, -3))
        .sort()
    const bundledCards = readdirSync(new URL('../plugins/weavatrix/skills/weavatrix/references/tools/', import.meta.url))
        .filter((name) => name.endsWith('.md'))
        .map((name) => name.slice(0, -3))
        .sort()
    assert.equal(toolNames.length, 43)
    assert.deepEqual(canonicalCards, toolNames)
    assert.deepEqual(bundledCards, toolNames)
    for (const name of toolNames) {
        assert.equal(
            readText(pluginRoot, `skills/weavatrix/references/tools/${name}.md`),
            readText(root, `skill/references/tools/${name}.md`),
        )
    }
})
