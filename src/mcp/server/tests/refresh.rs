use super::super::WeavatrixServer;
use crate::mcp::McpProfile;
use mcport::{dispatch, json};

#[test]
fn mcp_refreshes_after_a_real_source_change() {
    let root = temporary_repository();
    std::fs::write(root.join("source.rs"), "fn first() {}\n").unwrap();
    let mut server = WeavatrixServer::new(&root, McpProfile::All).unwrap();
    std::fs::write(root.join("source.rs"), "fn first() {}\nfn second() {}\n").unwrap();

    let first = graph_stats(&mut server, 1);
    let first_revision = first["result"]["structuredContent"]["revision"]
        .as_str()
        .unwrap()
        .to_owned();
    assert_eq!(
        first["result"]["structuredContent"]["node_kinds"]["function"],
        2
    );

    std::fs::write(
        root.join("source.rs"),
        "fn first() {}\nfn second() {}\nfn third() {}\n",
    )
    .unwrap();
    let second = graph_stats(&mut server, 2);
    assert_eq!(
        second["result"]["structuredContent"]["node_kinds"]["function"],
        3
    );
    assert_ne!(
        second["result"]["structuredContent"]["revision"].as_str(),
        Some(first_revision.as_str())
    );

    std::fs::remove_dir_all(root).unwrap();
}

fn temporary_repository() -> std::path::PathBuf {
    let nonce = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let root = std::env::temp_dir().join(format!(
        "weavatrix-mcp-watcher-{}-{nonce}",
        std::process::id()
    ));
    std::fs::create_dir_all(&root).unwrap();
    root
}

fn graph_stats(server: &mut WeavatrixServer, id: u64) -> mcport::Value {
    dispatch(
        server,
        &json!({
            "jsonrpc": "2.0",
            "id": id,
            "method": "tools/call",
            "params": {"name": "graph_stats", "arguments": {}}
        }),
    )
    .unwrap()
}
