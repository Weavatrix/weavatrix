mod adapters;
mod application;
mod error;
mod ports;
mod server;

pub use error::McpError;
pub use server::{ServeOptions, parse_output_format, serve_with_options};
pub use weavatrix_rust::operations::ToolProfile as McpProfile;
