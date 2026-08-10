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
/// How this server is served, decided once at startup.
#[derive(Debug, Clone, Copy)]
pub struct ServeOptions {
    /// Which bounded operation catalog to expose.
    pub profile: McpProfile,
    /// The payload a call receives when it does not name its own
    /// `output_format`.
    pub default_payload: ToolPayload,
}

impl Default for ServeOptions {
    fn default() -> Self {
        Self {
            profile: McpProfile::default(),
            default_payload: ToolPayload::Mirrored,
        }
    }
}

/// Reads one `output_format` value into the payload it selects.
///
/// # Errors
///
/// Returns a message naming the accepted values when `value` is not one.
pub fn parse_output_format(value: &str) -> Result<ToolPayload, String> {
    match value {
        "text" => Ok(ToolPayload::Text),
        "json" => Ok(ToolPayload::Mirrored),
        "structured" => Ok(ToolPayload::Structured),
        other => Err(format!(
            "unknown output format {other:?}; expected text, json, or structured"
        )),
    }
}

struct WeavatrixServer {
    profile: McpProfile,
    default_payload: ToolPayload,
    identity: ServerIdentity,
    catalog: Value,
    tool_names: std::collections::BTreeSet<String>,
    session: RepositorySession,
}

impl WeavatrixServer {
    fn new(root: impl AsRef<Path>, options: ServeOptions) -> Result<Self, McpError> {
        let profile = options.profile;
        let catalog = ToolCatalog::for_profile(profile)?;
        let repository = CoreRepository::open(root.as_ref().to_path_buf())?;
        Ok(Self {
            profile,
            default_payload: options.default_payload,
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
        // A call that names neither takes the server's startup default, so an
        // agent does not spend argument tokens restating it on every call.
        let payload = arguments
            .get("output_format")
            .and_then(Value::as_str)
            .and_then(|value| parse_output_format(value).ok())
            .unwrap_or(self.default_payload);
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

/// Serves the read-only MCP runtime with the options chosen at startup.
///
/// The repository root and graph are validated eagerly so misconfiguration
/// fails before the protocol handshake. The first tool call performs an
/// incremental catch-up scan, then later calls use filesystem events.
///
/// # Errors
///
/// Returns stdio failures or a missing repository root.
pub fn serve_with_options(root: impl AsRef<Path>, options: ServeOptions) -> Result<(), McpError> {
    let root = root.as_ref();
    if !root.is_dir() {
        return Err(McpError::Io(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            format!("repository root {} is not a directory", root.display()),
        )));
    }
    if options.default_payload != ToolPayload::Mirrored {
        // stdout carries the protocol, so the one line that tells an operator
        // which answer shape this process produces belongs on stderr.
        eprintln!(
            "weavatrix: answering with output_format={} unless a call names its own",
            match options.default_payload {
                ToolPayload::Text => "text",
                ToolPayload::Structured => "structured",
                ToolPayload::Mirrored => "json",
            }
        );
    }
    let mut server = WeavatrixServer::new(root, options)?;
    mcport::serve(&mut server).map_err(McpError::Io)
}

#[cfg(test)]
mod tests;
