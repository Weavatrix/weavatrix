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

fn assert_graph_ready_without_monitor(server: &super::super::WeavatrixServer) {
    assert!(
        server.session.repository_is_loaded() && server.session.monitor_is_not_started(),
        "protocol discovery must use the ready graph without starting the watcher"
    );
}
