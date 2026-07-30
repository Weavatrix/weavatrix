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
