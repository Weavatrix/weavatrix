//! Catalog, profile, and lifecycle behaviour of the MCP server adapter.

use super::server;
use crate::mcp::McpProfile;
use mcport::json;

#[test]
fn tool_server_identity_and_catalog_are_stable() {
    use mcport::ToolServer;

    let mut server = server(McpProfile::All);
    let identity = server.identity();
    assert_eq!(identity.name, "weavatrix");
    assert_eq!(
        server.identity_ref().map(|id| id.name.as_str()),
        Some("weavatrix")
    );
    let catalog = server.catalog();
    assert!(catalog.as_array().is_some_and(|tools| !tools.is_empty()));
    assert!(server.catalog_ref().is_some());
    assert_eq!(server.has_tool("graph_stats"), Some(true));
    assert_eq!(server.has_tool("definitely_not_a_tool"), Some(false));
}

#[test]
fn serve_options_default_is_mirrored_all_profile() {
    let options = super::super::ServeOptions::default();
    assert_eq!(options.profile, McpProfile::All);
    assert_eq!(options.default_payload, mcport::ToolPayload::Mirrored);
}

#[test]
fn missing_repository_root_fails_before_handshake() {
    let result = super::super::build_server(
        std::path::Path::new("C:/definitely/missing/weavatrix-root-xyz"),
        super::super::ServeOptions::default(),
    );
    let Err(error) = result else {
        panic!("missing root must fail");
    };
    let message = error.to_string();
    assert!(
        message.contains("not a directory") || message.contains("missing"),
        "got {message}"
    );
}

#[test]
fn profile_denies_unavailable_tool_via_call_operation_path() {
    use mcport::ToolServer;

    let mut code = server(McpProfile::Code);
    let reply = code.call("graph_stats", json!({}));
    match reply {
        mcport::ToolReply::Success { .. } => {}
        other => panic!("graph_stats must work in Code profile, got {other:?}"),
    }
}

#[test]
fn call_operation_rejects_tools_outside_profile_with_clear_message() {
    use mcport::ToolServer;

    let mut code = server(McpProfile::Code);
    // Bypass mcport has_tool gate by calling a name the All catalog would have
    // but Code profile rejects inside call_operation.
    let reply = code.call("seo_link_suggestions", json!({}));
    let text = format!("{reply:?}");
    assert!(
        text.contains("unavailable") || text.contains("profile") || text.contains("Error"),
        "seo tool must be rejected in Code profile, got {text}"
    );
    assert!(
        !matches!(reply, mcport::ToolReply::Success { .. }),
        "seo tool must not succeed in Code profile"
    );
}

#[test]
fn text_output_format_parses() {
    assert!(matches!(
        crate::mcp::parse_output_format("text"),
        Ok(mcport::ToolPayload::Text)
    ));
    assert!(matches!(
        crate::mcp::parse_output_format("structured"),
        Ok(mcport::ToolPayload::Structured)
    ));
    assert!(matches!(
        crate::mcp::parse_output_format("json"),
        Ok(mcport::ToolPayload::Mirrored)
    ));
}

#[test]
fn log_default_payload_and_validate_root_helpers() {
    // Mirrored is silent; structured writes a stderr line (not asserted).
    super::super::log_default_payload(mcport::ToolPayload::Mirrored);
    super::super::log_default_payload(mcport::ToolPayload::Structured);
    super::super::log_default_payload(mcport::ToolPayload::Text);
    super::super::validate_serve_root(std::path::Path::new(env!("CARGO_MANIFEST_DIR")))
        .expect("manifest dir exists");
    super::super::validate_serve_root(std::path::Path::new("C:/no/such/weavatrix/root"))
        .expect_err("missing root");
}

#[test]
fn build_server_succeeds_for_package_root() {
    let server = super::super::build_server(
        env!("CARGO_MANIFEST_DIR"),
        super::super::ServeOptions {
            profile: McpProfile::Code,
            default_payload: mcport::ToolPayload::Text,
        },
    )
    .expect("build server");
    assert!(server.session.repository_is_loaded());
}

#[test]
fn call_operation_maps_tool_errors_to_tool_reply_error() {
    use mcport::ToolServer;

    let mut server = server(McpProfile::All);
    // Unknown tool name that still passes the profile allow-list check only if
    // the profile filter treats it as available — profile.allows uses catalog
    // membership, so use a real tool with invalid arguments instead.
    let reply = server.call(
        "open_repo",
        json!({"path": "C:/definitely/missing/weavatrix-open-repo-xyz"}),
    );
    assert!(
        !matches!(reply, mcport::ToolReply::Success { .. }),
        "missing open_repo path must not succeed, got {reply:?}"
    );
    let text = format!("{reply:?}");
    assert!(
        text.contains("Error") || text.contains("error") || text.contains("failed"),
        "got {text}"
    );
}
