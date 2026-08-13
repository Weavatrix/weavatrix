//! Session behaviour when the repository or its watcher fails.

use super::*;

struct ProbeLoadedRepository {
    root: PathBuf,
    /// Hits to `is_loaded`, shared so the fixture can flip behaviour.
    probes: Arc<Mutex<usize>>,
    /// After this many probes, `is_loaded` returns false once (the post-call check).
    skip_monitor_at: usize,
}

impl RepositoryPort for ProbeLoadedRepository {
    fn root(&self) -> &Path {
        &self.root
    }

    fn is_loaded(&self) -> bool {
        let mut probes = self.probes.lock().unwrap();
        *probes += 1;
        if *probes == self.skip_monitor_at {
            return false;
        }
        true
    }

    fn ensure_loaded(&mut self) -> Result<(), String> {
        Ok(())
    }

    fn refresh_if_stale(&mut self) -> Result<bool, String> {
        Ok(false)
    }

    fn call(&mut self, _name: &str, _arguments: Value) -> Result<Value, String> {
        Ok(json!({"ok": true}))
    }
}

#[test]
fn not_started_monitor_is_created_synchronously_on_refresh() {
    let probes = Arc::new(Mutex::new(0usize));
    let repository = ProbeLoadedRepository {
        root: PathBuf::from("fixture"),
        probes: Arc::clone(&probes),
        // First probe: graph_was_loaded. Second: start_monitor gate → false.
        skip_monitor_at: 2,
    };
    let mut session = RepositorySession::new(Box::new(repository), Arc::new(QuietMonitorFactory));
    session.call("graph_stats", json!({})).unwrap();
    assert!(
        session.monitor_is_not_started(),
        "post-call is_loaded=false must skip async monitor start"
    );
    // Second call: first_tool_call=false, graph loaded → refresh_from_monitor
    // with MonitorState::NotStarted (synchronous factory.create path).
    session.call("graph_stats", json!({})).unwrap();
    assert!(!session.monitor_is_not_started());
}

#[test]
fn monitor_changed_errors_when_watcher_is_not_ready() {
    let counts = Arc::new(Mutex::new(RepositoryCounts::default()));
    let repository = CountingRepository {
        root: PathBuf::from("fixture"),
        counts: Arc::clone(&counts),
    };
    let session = RepositorySession::new(Box::new(repository), Arc::new(QuietMonitorFactory));
    let error = session
        .monitor_changed_for_test()
        .expect_err("NotStarted monitor must fail closed");
    assert!(
        error.contains("not ready"),
        "expected not-ready message, got {error}"
    );
}

struct EnsureFailsRepository {
    root: PathBuf,
}

impl RepositoryPort for EnsureFailsRepository {
    fn root(&self) -> &Path {
        &self.root
    }

    fn is_loaded(&self) -> bool {
        false
    }

    fn ensure_loaded(&mut self) -> Result<(), String> {
        Err("ensure boom".into())
    }

    fn refresh_if_stale(&mut self) -> Result<bool, String> {
        Ok(false)
    }

    fn call(&mut self, _name: &str, _arguments: Value) -> Result<Value, String> {
        Ok(json!({}))
    }
}

#[test]
fn ensure_loaded_failure_is_wrapped() {
    let repository = EnsureFailsRepository {
        root: PathBuf::from("fixture"),
    };
    let mut session = RepositorySession::new(Box::new(repository), Arc::new(QuietMonitorFactory));
    let error = session
        .call("graph_stats", json!({}))
        .expect_err("ensure_loaded must fail the call");
    assert!(
        error.contains("repository initialization failed"),
        "got {error}"
    );
    assert!(error.contains("ensure boom"), "got {error}");
}

struct RefreshFailsRepository {
    root: PathBuf,
}

impl RepositoryPort for RefreshFailsRepository {
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
        Err("stale check failed".into())
    }

    fn call(&mut self, _name: &str, _arguments: Value) -> Result<Value, String> {
        Ok(json!({}))
    }
}

#[test]
fn first_call_refresh_failure_surfaces() {
    let repository = RefreshFailsRepository {
        root: PathBuf::from("fixture"),
    };
    let mut session = RepositorySession::new(Box::new(repository), Arc::new(QuietMonitorFactory));
    let error = session
        .call("graph_stats", json!({}))
        .expect_err("refresh_if_stale must fail the first call");
    assert!(error.contains("stale check failed"), "got {error}");
}
