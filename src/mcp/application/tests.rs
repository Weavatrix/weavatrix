use super::RepositorySession;
use crate::mcp::ports::{ChangeMonitor, ChangeMonitorFactory, RepositoryPort};
use blazingly_json::{Value, json};
use std::io;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};

#[derive(Default)]
struct RepositoryCounts {
    refreshes: usize,
    calls: usize,
}

struct CountingRepository {
    root: PathBuf,
    counts: Arc<Mutex<RepositoryCounts>>,
}

impl RepositoryPort for CountingRepository {
    fn root(&self) -> &Path {
        &self.root
    }

    fn is_loaded(&self) -> bool {
        true
    }

    fn ensure_loaded(&mut self) -> Result<(), String> {
        Ok(())
    }

    fn refresh_if_stale(&mut self) -> Result<bool, String> {
        self.counts.lock().unwrap().refreshes += 1;
        Ok(false)
    }

    fn call(&mut self, _name: &str, _arguments: Value) -> Result<Value, String> {
        self.counts.lock().unwrap().calls += 1;
        Ok(json!({"status": "COMPLETE"}))
    }
}

struct QuietMonitor;

impl ChangeMonitor for QuietMonitor {
    fn changed(&self) -> io::Result<bool> {
        Ok(false)
    }
}

struct QuietMonitorFactory;

impl ChangeMonitorFactory for QuietMonitorFactory {
    fn create(&self, _root: &Path) -> io::Result<Box<dyn ChangeMonitor>> {
        Ok(Box::new(QuietMonitor))
    }
}

#[test]
fn quiet_watcher_never_suppresses_the_repository_revision_check() {
    let counts = Arc::new(Mutex::new(RepositoryCounts::default()));
    let repository = CountingRepository {
        root: PathBuf::from("fixture"),
        counts: Arc::clone(&counts),
    };
    let mut session = RepositorySession::new(Box::new(repository), Arc::new(QuietMonitorFactory));

    for _ in 0..3 {
        session.call("graph_stats", json!({})).unwrap();
    }

    let counts = counts.lock().unwrap();
    assert_eq!(counts.calls, 3);
    assert_eq!(
        counts.refreshes, 3,
        "every tool call must check the repository revision even without watcher events"
    );
}
