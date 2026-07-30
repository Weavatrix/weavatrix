import {existsSync, mkdirSync} from 'node:fs'
import {homedir} from 'node:os'
import {join, resolve} from 'node:path'

export function prepareRuntimeIsolation(root) {
    if (existsSync(root)) {
        throw new Error(`runtime isolation root already exists and cannot be reused: ${root}`)
    }
    const roaming = join(root, 'AppData', 'Roaming')
    const local = join(root, 'AppData', 'Local')
    const xdgCache = join(root, '.cache')
    const xdgConfig = join(root, '.config')
    const xdgData = join(root, '.local', 'share')
    const xdgState = join(root, '.local', 'state')
    const xdgRuntime = join(root, '.runtime')
    const graphHome = join(root, '.weavatrix', 'graphs')
    for (const directory of [
        root,
        roaming,
        local,
        xdgCache,
        xdgConfig,
        xdgData,
        xdgState,
        xdgRuntime,
    ]) {
        mkdirSync(directory, {recursive: true, mode: 0o700})
    }
    const inheritedGraphHome = resolve(
        process.env.WEAVATRIX_GRAPH_HOME || join(homedir(), '.weavatrix', 'graphs'),
    )
    if (resolve(graphHome) === inheritedGraphHome) {
        throw new Error('isolated WEAVATRIX_GRAPH_HOME unexpectedly resolves to the inherited cache')
    }
    const environment = {
        HOME: root,
        USERPROFILE: root,
        APPDATA: roaming,
        LOCALAPPDATA: local,
        XDG_CACHE_HOME: xdgCache,
        XDG_CONFIG_HOME: xdgConfig,
        XDG_DATA_HOME: xdgData,
        XDG_STATE_HOME: xdgState,
        XDG_RUNTIME_DIR: xdgRuntime,
        WEAVATRIX_GRAPH_HOME: graphHome,
    }
    return {
        environment,
        report: {
            policy: 'fresh-empty-per-session',
            root,
            graphHome,
            graphHomeExistedBeforeSession: existsSync(graphHome),
            inheritedHomeExcluded: resolve(root) !== resolve(homedir()),
            inheritedWeavatrixGraphHomeExcluded: resolve(graphHome) !== inheritedGraphHome,
            environment: Object.keys(environment),
        },
    }
}
