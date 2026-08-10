use crate::mcp::adapters::{CoreRepository, NotifyMonitorFactory, ToolCatalog};
use crate::mcp::application::RepositorySession;
use crate::mcp::{McpError, McpProfile};
use mcport::{ServerIdentity, ToolPayload, ToolReply, ToolServer, Value};
use std::path::Path;
use std::sync::Arc;

/// Weavatrix tool surface behind the shared `mcport` stdio runtime.
///
/// Graph construction finishes before the handshake so startup does not split
/// CPU between a protocol thread and an analyzer thread. The first tool call
/// runs an incremental catch-up scan before using it, then starts the
/// filesystem watcher in the background.
struct WeavatrixServer {
    profile: McpProfile,
    identity: ServerIdentity,
    catalog: Value,
    tool_names: std::collections::BTreeSet<String>,
    session: RepositorySession,
}

impl WeavatrixServer {
    fn new(root: impl AsRef<Path>, profile: McpProfile) -> Result<Self, McpError> {
        let catalog = ToolCatalog::for_profile(profile)?;
        let repository = CoreRepository::open(root.as_ref().to_path_buf())?;
        Ok(Self {
            profile,
            identity: ServerIdentity::new(
                "weavatrix",
                env!("CARGO_PKG_VERSION"),
                "Local read-only repository intelligence. Inferred evidence is explicitly labelled.",
            ),
            catalog: catalog.encoded,
            tool_names: catalog.names,
            session: RepositorySession::new(Box::new(repository), Arc::new(NotifyMonitorFactory)),
        })
    }

    fn call_operation(&mut self, name: &str, arguments: Value) -> ToolReply {
        if !self.profile.allows(name) {
            return ToolReply::error(format!(
                "tool {name} is unavailable in the {:?} profile",
                self.profile
            ));
        }
        // `json` mirrors the payload into a text block for clients that read
        // only `content`; that mirror is pretty-printed, so it is the larger of
        // the two copies. `structured` drops it and roughly halves the answer.
        let payload = match arguments.get("output_format").and_then(Value::as_str) {
            Some("text") => ToolPayload::Text,
            Some("structured") => ToolPayload::Structured,
            _ => ToolPayload::Mirrored,
        };
        match self.session.call(name, arguments) {
            Ok(value) => ToolReply::Success { value, payload },
            Err(error) => ToolReply::error(error),
        }
    }
}

impl ToolServer for WeavatrixServer {
    fn identity(&self) -> ServerIdentity {
        self.identity.clone()
    }

    fn identity_ref(&self) -> Option<&ServerIdentity> {
        Some(&self.identity)
    }

    fn catalog(&mut self) -> Value {
        self.catalog.clone()
    }

    fn catalog_ref(&mut self) -> Option<&Value> {
        Some(&self.catalog)
    }

    fn has_tool(&self, name: &str) -> Option<bool> {
        Some(self.tool_names.contains(name))
    }

    fn call(&mut self, name: &str, arguments: Value) -> ToolReply {
        self.call_operation(name, arguments)
    }
}

/// Serves one capability profile over the same read-only MCP runtime.
///
/// The repository root and graph are validated eagerly so misconfiguration
/// fails before the protocol handshake. The first tool call performs an
/// incremental catch-up scan, then later calls use filesystem events.
///
/// # Errors
///
/// Returns stdio failures or a missing repository root.
pub fn serve_with_profile(root: impl AsRef<Path>, profile: McpProfile) -> Result<(), McpError> {
    let root = root.as_ref();
    if !root.is_dir() {
        return Err(McpError::Io(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            format!("repository root {} is not a directory", root.display()),
        )));
    }
    let mut server = WeavatrixServer::new(root, profile)?;
    mcport::serve(&mut server).map_err(McpError::Io)
}

#[cfg(test)]
mod tests;
