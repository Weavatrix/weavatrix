//! Concurrent MCP server. Each call takes a repository lane and returns.

use super::{ServeOptions, log_default_payload, parse_output_format, validate_serve_root};
use crate::mcp::McpError;
use crate::mcp::adapters::ToolCatalog;
use crate::mcp::application::resolve_pin_root;
use mcport::{ConcurrentToolServer, RequestContext, ServerIdentity, ToolPayload, ToolReply, Value};
use std::collections::BTreeSet;
use std::path::Path;
use std::sync::Arc;
use weavatrix_rust::ParallelEngine;

/// Handler threads for one stdio process. One chat can keep 40 calls in flight.
pub const IN_FLIGHT: usize = 128;
/// Calls waiting for a handler.
pub const QUEUE_DEPTH: usize = 256;
/// Cold graphs on a large tree can exceed the mcport default of 30 seconds.
pub const HANDLER_DEADLINE_SECS: u64 = 120;

pub struct ParallelServer {
    profile: crate::mcp::McpProfile,
    default_payload: ToolPayload,
    identity: ServerIdentity,
    catalog: Value,
    tool_names: BTreeSet<String>,
    engine: Arc<ParallelEngine>,
}

impl ParallelServer {
    fn open(root: &Path, options: ServeOptions) -> Result<Self, McpError> {
        let catalog = ToolCatalog::for_profile(options.profile)?;
        let engine = ParallelEngine::open(root, options.allow_retarget)?;
        Ok(Self {
            profile: options.profile,
            default_payload: options.default_payload,
            identity: ServerIdentity::new(
                "weavatrix",
                env!("CARGO_PKG_VERSION"),
                "Local read-only repository intelligence. Inferred evidence is explicitly labelled.",
            ),
            catalog: catalog.encoded,
            tool_names: catalog.names,
            engine: Arc::new(engine),
        })
    }

    pub(crate) fn answer(&self, name: &str, arguments: Value) -> ToolReply {
        if let Some(error) = crate::mcp::closed_library_tool_error(name) {
            return ToolReply::error(error);
        }
        if !self.profile.allows(name) {
            return ToolReply::error(format!(
                "tool {name} is unavailable in the {:?} profile",
                self.profile
            ));
        }
        let payload = arguments
            .get("output_format")
            .and_then(Value::as_str)
            .and_then(|value| parse_output_format(value).ok())
            .unwrap_or(self.default_payload);
        match self.engine.call(name, arguments) {
            Ok(value) => ToolReply::Success { value, payload },
            Err(error) => ToolReply::error(error),
        }
    }
}

pub fn build_parallel_server(
    root: impl AsRef<Path>,
    options: ServeOptions,
) -> Result<ParallelServer, McpError> {
    validate_serve_root(root.as_ref())?;
    let pinned = resolve_pin_root(root.as_ref());
    eprintln!(
        "weavatrix: pinned repository {} (retarget {}); {IN_FLIGHT} calls in flight",
        pinned.display(),
        if options.allow_retarget {
            "allowed"
        } else {
            "blocked"
        }
    );
    log_default_payload(options.default_payload);
    ParallelServer::open(&pinned, options)
}

impl ConcurrentToolServer for ParallelServer {
    fn identity(&self) -> ServerIdentity {
        self.identity.clone()
    }

    fn identity_ref(&self) -> Option<&ServerIdentity> {
        Some(&self.identity)
    }

    fn catalog(&self) -> Value {
        self.catalog.clone()
    }

    fn catalog_ref(&self) -> Option<&Value> {
        Some(&self.catalog)
    }

    fn has_tool(&self, name: &str) -> Option<bool> {
        Some(self.tool_names.contains(name))
    }

    fn call(&self, _context: &RequestContext, name: &str, arguments: Value) -> ToolReply {
        self.answer(name, arguments)
    }
}
