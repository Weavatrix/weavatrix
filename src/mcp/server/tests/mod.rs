mod catalog;
mod protocol;
mod refresh;

use super::WeavatrixServer;
use crate::mcp::McpProfile;
use std::path::PathBuf;

fn server(profile: McpProfile) -> WeavatrixServer {
    served(super::ServeOptions {
        profile,
        ..super::ServeOptions::default()
    })
}

fn served(options: super::ServeOptions) -> WeavatrixServer {
    WeavatrixServer::new(PathBuf::from(env!("CARGO_MANIFEST_DIR")), options).unwrap()
}
