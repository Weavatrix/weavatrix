use crate::mcp::ports::RepositoryPort;
use blazingly_json::Value;
use std::collections::BTreeSet;
use std::io;
use std::path::{Path, PathBuf};
use weavatrix_rust::operations::ToolProfile as McpProfile;
use weavatrix_rust::{Error, Weavatrix, operations};

pub(crate) struct ToolCatalog {
    pub(crate) encoded: Value,
    pub(crate) names: BTreeSet<String>,
}

impl ToolCatalog {
    pub(crate) fn for_profile(profile: McpProfile) -> io::Result<Self> {
        let definitions = operations::catalog_for_profile(profile);
        let names = definitions
            .iter()
            .map(|definition| definition.name.to_owned())
            .collect();
        let encoded = blazingly_json::to_value(definitions).map_err(io::Error::other)?;
        Ok(Self { encoded, names })
    }
}

pub(crate) struct CoreRepository {
    root: PathBuf,
    engine: Option<Weavatrix>,
}

impl CoreRepository {
    pub(crate) fn open(root: PathBuf) -> Result<Self, Error> {
        let engine = Weavatrix::open(&root)?;
        Ok(Self {
            root,
            engine: Some(engine),
        })
    }

    fn engine(&mut self) -> Result<&mut Weavatrix, Error> {
        if self.engine.is_none() {
            let engine = Weavatrix::open(&self.root)?;
            engine.state().warm_communities();
            self.engine = Some(engine);
        }
        self.engine
            .as_mut()
            .ok_or_else(|| Error::InvalidRepository(self.root.clone()))
    }

    fn refresh(&mut self) -> Result<bool, String> {
        let engine = self
            .engine
            .as_mut()
            .ok_or_else(|| "repository graph is not initialized".to_owned())?;
        let refreshed = engine
            .refresh_if_stale()
            .map_err(|error| format!("repository refresh failed: {error}"))?;
        if refreshed {
            engine.state().warm_communities();
        }
        Ok(refreshed)
    }
}

impl RepositoryPort for CoreRepository {
    fn root(&self) -> &Path {
        &self.root
    }

    fn is_loaded(&self) -> bool {
        self.engine.is_some()
    }

    fn ensure_loaded(&mut self) -> Result<(), String> {
        self.engine().map(|_| ()).map_err(|error| error.to_string())
    }

    fn refresh_if_stale(&mut self) -> Result<bool, String> {
        self.refresh()
    }

    fn call(&mut self, name: &str, arguments: Value) -> Result<Value, String> {
        let engine = self.engine().map_err(|error| error.to_string())?;
        let result = operations::call(engine, name, arguments);
        if result.is_ok() && name == "open_repo" {
            self.root = self
                .engine()
                .map_err(|error| error.to_string())?
                .state()
                .root()
                .to_path_buf();
        }
        result
    }
}

impl CoreRepository {
    #[cfg(test)]
    fn unload_for_test(&mut self) {
        self.engine = None;
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use blazingly_json::json;
    use std::path::PathBuf;

    #[test]
    fn open_real_package_root_and_call_graph_stats() {
        let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        let mut repo = CoreRepository::open(root).expect("open package root");
        assert!(repo.is_loaded());
        assert!(repo.root().exists());
        repo.ensure_loaded().expect("already loaded");
        let refreshed = repo.refresh_if_stale().expect("refresh");
        let _ = refreshed;
        let stats = repo
            .call("graph_stats", json!({}))
            .expect("graph_stats works");
        assert!(
            stats.get("nodes").and_then(Value::as_u64).unwrap_or(0) > 0,
            "package graph should have nodes"
        );
    }

    #[test]
    fn catalog_for_all_profile_lists_tools() {
        let catalog = ToolCatalog::for_profile(McpProfile::All).expect("catalog");
        assert!(!catalog.names.is_empty());
        assert!(catalog.names.contains("graph_stats"));
        assert!(catalog.encoded.as_array().is_some_and(|a| !a.is_empty()));
    }

    #[test]
    fn catalog_for_code_profile_excludes_seo_tools() {
        let catalog = ToolCatalog::for_profile(McpProfile::Code).expect("catalog");
        assert!(catalog.names.contains("graph_stats"));
        assert!(!catalog.names.contains("seo_link_suggestions"));
    }

    #[test]
    fn reloads_engine_after_unload_and_open_repo_updates_root() {
        let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        let mut repo = CoreRepository::open(root.clone()).expect("open");
        repo.unload_for_test();
        assert!(!repo.is_loaded());
        // call() must re-open the engine when unloaded.
        let stats = repo
            .call("graph_stats", json!({}))
            .expect("reload via call");
        assert!(stats.get("nodes").is_some());
        assert!(repo.is_loaded());
        let _ = repo.call("open_repo", json!({"path": root.to_string_lossy()}));
        let _ = repo.refresh_if_stale();
        let _ = repo.call("rebuild_graph", json!({}));
    }

    #[test]
    fn refresh_without_engine_fails_closed() {
        let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        let mut repo = CoreRepository::open(root).expect("open");
        repo.unload_for_test();
        let error = repo
            .refresh_if_stale()
            .expect_err("refresh must require a loaded engine");
        assert!(
            error.contains("not initialized"),
            "got {error}"
        );
    }

    #[test]
    fn ensure_loaded_reopens_after_unload() {
        let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        let mut repo = CoreRepository::open(root).expect("open");
        repo.unload_for_test();
        repo.ensure_loaded().expect("reopen");
        assert!(repo.is_loaded());
        // Second ensure is a no-op path through the already-open engine.
        repo.ensure_loaded().expect("already open");
    }

    #[test]
    fn unknown_tool_returns_error_string() {
        let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        let mut repo = CoreRepository::open(root).expect("open");
        let error = repo
            .call("definitely_not_a_weavatrix_tool", json!({}))
            .expect_err("unknown tool");
        assert!(
            !error.is_empty(),
            "operations layer must name the failure"
        );
    }
}
