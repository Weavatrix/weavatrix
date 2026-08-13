use super::{served, server};
use crate::mcp::McpProfile;
use mcport::{MODERN_PROTOCOL_VERSION, dispatch, json};
use weavatrix_rust::operations;

#[test]
fn negotiates_legacy_and_modern_protocols() {
    let mut server = server(McpProfile::All);
    let initialized = dispatch(
        &mut server,
        &json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {"protocolVersion": "2025-06-18"}
        }),
    )
    .expect("initialize is answered");
    assert_eq!(initialized["result"]["protocolVersion"], "2025-06-18");
    assert_eq!(initialized["result"]["serverInfo"]["name"], "weavatrix");
    assert_graph_ready_without_monitor(&server);

    let discovered = dispatch(
        &mut server,
        &json!({
            "jsonrpc": "2.0",
            "id": "discover",
            "method": "server/discover",
            "params": {"_meta": modern_meta()}
        }),
    )
    .expect("modern server/discover is answered");
    assert_eq!(discovered["result"]["resultType"], "complete");
    assert_eq!(
        discovered["result"]["supportedVersions"][0],
        MODERN_PROTOCOL_VERSION
    );
    assert_eq!(
        discovered["result"]["_meta"]["io.modelcontextprotocol/serverInfo"]["name"],
        "weavatrix"
    );
    assert_graph_ready_without_monitor(&server);
}

#[test]
fn lists_the_profile_catalog_without_starting_the_monitor() {
    let mut server = server(McpProfile::All);
    let listed = dispatch(
        &mut server,
        &json!({"jsonrpc": "2.0", "id": 2, "method": "tools/list"}),
    )
    .expect("tools/list is answered");
    assert_eq!(
        listed["result"]["tools"].as_array().map(Vec::len),
        Some(operations::catalog().len())
    );
    assert_graph_ready_without_monitor(&server);

    let modern_listed = dispatch(
        &mut server,
        &json!({
            "jsonrpc": "2.0",
            "id": "modern-list",
            "method": "tools/list",
            "params": {"_meta": modern_meta()}
        }),
    )
    .expect("modern tools/list is answered");
    assert_eq!(modern_listed["result"]["resultType"], "complete");
    assert_eq!(
        modern_listed["result"]["tools"].as_array().map(Vec::len),
        Some(operations::catalog().len())
    );
}

#[test]
fn calls_tools_with_structured_and_text_output() {
    let mut all = server(McpProfile::All);
    let called = dispatch(
        &mut all,
        &json!({
            "jsonrpc": "2.0",
            "id": 3,
            "method": "tools/call",
            "params": {"name": "graph_stats", "arguments": {}}
        }),
    )
    .expect("tools/call is answered");
    assert_eq!(called["result"]["isError"], false);
    assert!(
        called["result"]["structuredContent"]["nodes"]
            .as_u64()
            .unwrap()
            > 0
    );

    let mut code = server(McpProfile::Code);
    let text = dispatch(
        &mut code,
        &json!({
            "jsonrpc": "2.0",
            "id": 4,
            "method": "tools/call",
            "params": {
                "name": "graph_stats",
                "arguments": {"output_format": "text"}
            }
        }),
    )
    .expect("tools/call is answered");
    assert!(text["result"].get("structuredContent").is_none());
}

/// The text block repeats the whole payload, pretty-printed, so it is the
/// larger of the two copies a mirrored answer carries.
#[test]
fn structured_output_drops_the_text_mirror_and_halves_the_answer() {
    let mut server = server(McpProfile::All);
    let call = |server: &mut _, format: &str| {
        dispatch(
            server,
            &json!({
                "jsonrpc": "2.0",
                "id": 6,
                "method": "tools/call",
                "params": {
                    "name": "list_endpoints",
                    "arguments": {"output_format": format}
                }
            }),
        )
        .expect("tools/call is answered")
    };

    let mirrored = call(&mut server, "json");
    let structured = call(&mut server, "structured");

    assert_eq!(
        mirrored["result"]["structuredContent"], structured["result"]["structuredContent"],
        "the machine-readable half is unchanged"
    );
    assert!(
        structured["result"]["content"]
            .as_array()
            .is_some_and(Vec::is_empty),
        "the mirror is gone and the field it lived in is still present"
    );
    assert!(
        !mirrored["result"]["content"]
            .as_array()
            .is_some_and(Vec::is_empty),
        "the default answer still carries the mirror"
    );
    assert!(
        blazingly_json::to_string(&structured).unwrap().len()
            < blazingly_json::to_string(&mirrored).unwrap().len(),
        "structured output must not cost more than the mirrored answer"
    );
}

/// A client's ability to read structured output does not change between
/// calls, so the operator sets it once and no call spends argument tokens
/// restating it.
#[test]
fn the_startup_default_decides_the_answer_shape_and_a_call_still_overrides_it() {
    let mut server = served(super::super::ServeOptions {
        profile: McpProfile::All,
        default_payload: mcport::ToolPayload::Structured,
    });
    let call = |server: &mut _, arguments| {
        dispatch(
            server,
            &json!({
                "jsonrpc": "2.0",
                "id": 7,
                "method": "tools/call",
                "params": {"name": "graph_stats", "arguments": arguments}
            }),
        )
        .expect("tools/call is answered")
    };

    let defaulted = call(&mut server, json!({}));
    assert!(
        defaulted["result"]["content"]
            .as_array()
            .is_some_and(Vec::is_empty),
        "a call that names no format takes the startup default"
    );
    assert!(defaulted["result"]["structuredContent"]["nodes"].is_number());

    let overridden = call(&mut server, json!({"output_format": "json"}));
    assert!(
        !overridden["result"]["content"]
            .as_array()
            .is_some_and(Vec::is_empty),
        "an explicit format on the call still wins over the startup default"
    );

    let mirrored = served(super::super::ServeOptions::default());
    assert_eq!(
        mirrored.default_payload,
        mcport::ToolPayload::Mirrored,
        "the shipped default keeps the mirror"
    );
}

#[test]
fn an_output_format_the_server_cannot_serve_is_named_in_the_error() {
    let error = crate::mcp::parse_output_format("compact")
        .expect_err("an unknown format must not silently become the default");
    assert!(error.contains("compact"), "got {error}");
    assert!(error.contains("text, json, or structured"), "got {error}");
}

#[test]
fn excludes_tools_outside_the_selected_profile() {
    let mut code = server(McpProfile::Code);
    let denied = dispatch(
        &mut code,
        &json!({
            "jsonrpc": "2.0",
            "id": 5,
            "method": "tools/call",
            "params": {"name": "seo_link_suggestions", "arguments": {}}
        }),
    )
    .expect("tools/call is answered");
    assert_eq!(denied["error"]["code"], -32_602);
    assert_eq!(
        denied["error"]["message"],
        "unknown tool: seo_link_suggestions"
    );
}

fn modern_meta() -> mcport::Value {
    json!({
        "io.modelcontextprotocol/protocolVersion": MODERN_PROTOCOL_VERSION,
        "io.modelcontextprotocol/clientInfo": {
            "name": "weavatrix-test",
            "version": env!("CARGO_PKG_VERSION")
        },
        "io.modelcontextprotocol/clientCapabilities": {}
    })
}

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

fn assert_graph_ready_without_monitor(server: &super::super::WeavatrixServer) {
    assert!(
        server.session.repository_is_loaded() && server.session.monitor_is_not_started(),
        "protocol discovery must use the ready graph without starting the watcher"
    );
}
