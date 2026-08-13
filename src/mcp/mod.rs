mod adapters;
mod application;
mod error;
mod ports;
mod server;

pub use error::McpError;
pub use server::{ServeOptions, build_server, parse_output_format};
pub use weavatrix_rust::operations::ToolProfile as McpProfile;
