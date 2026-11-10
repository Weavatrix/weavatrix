mod adapters;
mod application;
mod error;
mod ports;
mod server;

pub use error::McpError;
pub use server::{ServeOptions, build_server, parse_output_format};
pub use weavatrix_rust::operations::ToolProfile as McpProfile;

/// Library methods that engine 2.17.4 still lists. The MCP catalog and call
/// path omit them. Engine 2.17.6 omits them too; this gate keeps a host linked
/// to 2.17.4 from serving them.
pub(crate) fn closed_library_tool_error(name: &str) -> Option<String> {
    let (crate_name, inputs) = match name {
        "vector_search" => (
            "weavatrix-search-vector",
            "the numeric query and the vectors to search",
        ),
        "seo_link_suggestions" => ("weavatrix-semantic", "page profiles and their vectors"),
        "memory_context" => ("weavatrix-memory", "an event journal and a context request"),
        _ => return None,
    };
    Some(format!(
        "{name} is not an MCP tool. It uses only {inputs}. Call it from the {crate_name} crate in a product that already has those inputs. semantic_link remains the repository tool for a phrase or for caller-supplied embeddings over the code graph."
    ))
}
