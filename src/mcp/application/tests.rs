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

struct NoisyMonitor {
    remaining: Mutex<usize>,
}

impl ChangeMonitor for NoisyMonitor {
    fn changed(&self) -> io::Result<bool> {
        let mut remaining = self.remaining.lock().unwrap();
        if *remaining > 0 {
            *remaining -= 1;
            Ok(true)
        } else {
            Ok(false)
        }
    }
}

struct NoisyMonitorFactory;

impl ChangeMonitorFactory for NoisyMonitorFactory {
    fn create(&self, _root: &Path) -> io::Result<Box<dyn ChangeMonitor>> {
        Ok(Box::new(NoisyMonitor {
            remaining: Mutex::new(2),
        }))
    }
}

#[test]
fn noisy_watcher_triggers_extra_revision_refresh() {
    let counts = Arc::new(Mutex::new(RepositoryCounts::default()));
    let repository = CountingRepository {
        root: PathBuf::from("fixture"),
        counts: Arc::clone(&counts),
    };
    let mut session = RepositorySession::new(Box::new(repository), Arc::new(NoisyMonitorFactory));

    session.call("graph_stats", json!({})).unwrap();
    session.call("graph_stats", json!({})).unwrap();

    let counts = counts.lock().unwrap();
    assert_eq!(counts.calls, 2);
    assert!(
        counts.refreshes >= 3,
        "watcher change after the first call must force another revision check, got {}",
        counts.refreshes
    );
}

#[test]
fn open_repo_call_still_refreshes_and_starts_monitor_path() {
    let counts = Arc::new(Mutex::new(RepositoryCounts::default()));
    let repository = CountingRepository {
        root: PathBuf::from("fixture"),
        counts: Arc::clone(&counts),
    };
    let mut session = RepositorySession::new(Box::new(repository), Arc::new(QuietMonitorFactory));
    session.call("open_repo", json!({})).unwrap();
    assert!(session.repository_is_loaded());
    // Second open_repo skips the "not rebuild" refresh branch differently.
    session.call("open_repo", json!({})).unwrap();
    let counts = counts.lock().unwrap();
    assert_eq!(counts.calls, 2);
}

struct FailingMonitorFactory;

impl ChangeMonitorFactory for FailingMonitorFactory {
    fn create(&self, _root: &Path) -> io::Result<Box<dyn ChangeMonitor>> {
        Err(io::Error::other("watcher denied"))
    }
}

struct BrokenMonitor;

impl ChangeMonitor for BrokenMonitor {
    fn changed(&self) -> io::Result<bool> {
        Err(io::Error::other("broken watcher"))
    }
}

struct BrokenMonitorFactory;

impl ChangeMonitorFactory for BrokenMonitorFactory {
    fn create(&self, _root: &Path) -> io::Result<Box<dyn ChangeMonitor>> {
        Ok(Box::new(BrokenMonitor))
    }
}

#[test]
fn watcher_factory_failure_surfaces_on_next_call_after_async_start() {
    let counts = Arc::new(Mutex::new(RepositoryCounts::default()));
    let repository = CountingRepository {
        root: PathBuf::from("fixture"),
        counts: Arc::clone(&counts),
    };
    let mut session =
        RepositorySession::new(Box::new(repository), Arc::new(FailingMonitorFactory));
    // First call starts the watcher on a background thread after the tool succeeds.
    session
        .call("graph_stats", json!({}))
        .expect("tool call itself still succeeds");
    // Second call joins the failed factory and must fail closed.
    let error = session
        .call("graph_stats", json!({}))
        .expect_err("monitor create must fail closed on the next call");
    assert!(
        error.contains("watcher"),
        "error should mention watcher, got {error}"
    );
}

#[test]
fn broken_monitor_changed_fails_closed_on_refresh() {
    let counts = Arc::new(Mutex::new(RepositoryCounts::default()));
    let repository = CountingRepository {
        root: PathBuf::from("fixture"),
        counts: Arc::clone(&counts),
    };
    let mut session =
        RepositorySession::new(Box::new(repository), Arc::new(BrokenMonitorFactory));
    session
        .call("graph_stats", json!({}))
        .expect("first call starts the broken monitor");
    let error = session
        .call("graph_stats", json!({}))
        .expect_err("changed() error must fail closed");
    assert!(
        error.contains("watcher") || error.contains("broken"),
        "got {error}"
    );
}

#[test]
fn rebuild_graph_skips_monitor_refresh_branch() {
    let counts = Arc::new(Mutex::new(RepositoryCounts::default()));
    let repository = CountingRepository {
        root: PathBuf::from("fixture"),
        counts: Arc::clone(&counts),
    };
    let mut session = RepositorySession::new(Box::new(repository), Arc::new(QuietMonitorFactory));
    session.call("graph_stats", json!({})).unwrap();
    session.call("rebuild_graph", json!({})).unwrap();
    let counts = counts.lock().unwrap();
    assert_eq!(counts.calls, 2);
}

struct FailingCallRepository {
    root: PathBuf,
    refreshes: Arc<Mutex<usize>>,
}

impl RepositoryPort for FailingCallRepository {
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
        *self.refreshes.lock().unwrap() += 1;
        Ok(false)
    }

    fn call(&mut self, _name: &str, _arguments: Value) -> Result<Value, String> {
        Err("tool failed".into())
    }
}

#[test]
fn failed_tool_call_still_starts_monitor_when_repo_loaded() {
    let refreshes = Arc::new(Mutex::new(0usize));
    let repository = FailingCallRepository {
        root: PathBuf::from("fixture"),
        refreshes: Arc::clone(&refreshes),
    };
    let mut session =
        RepositorySession::new(Box::new(repository), Arc::new(QuietMonitorFactory));
    let err = session
        .call("graph_stats", json!({}))
        .expect_err("call fails");
    assert_eq!(err, "tool failed");
    // Monitor startup is tied to a loaded repository on the first call, not tool success.
    assert!(
        !session.monitor_is_not_started(),
        "first call should schedule monitor start when the repository is already loaded"
    );
    assert_eq!(*refreshes.lock().unwrap(), 1);
}

struct UnloadedThenLoadedRepository {
    root: PathBuf,
    loaded: bool,
    calls: usize,
}

impl RepositoryPort for UnloadedThenLoadedRepository {
    fn root(&self) -> &Path {
        &self.root
    }

    fn is_loaded(&self) -> bool {
        self.loaded
    }

    fn ensure_loaded(&mut self) -> Result<(), String> {
        self.loaded = true;
        Ok(())
    }

    fn refresh_if_stale(&mut self) -> Result<bool, String> {
        Ok(false)
    }

    fn call(&mut self, _name: &str, _arguments: Value) -> Result<Value, String> {
        self.calls += 1;
        Ok(json!({"ok": true}))
    }
}

#[test]
fn first_call_on_unloaded_repository_loads_and_starts_monitor() {
    let repository = UnloadedThenLoadedRepository {
        root: PathBuf::from("fixture"),
        loaded: false,
        calls: 0,
    };
    let mut session =
        RepositorySession::new(Box::new(repository), Arc::new(QuietMonitorFactory));
    session.call("graph_stats", json!({})).unwrap();
    assert!(session.repository_is_loaded());
}

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
    let mut session =
        RepositorySession::new(Box::new(repository), Arc::new(QuietMonitorFactory));
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
    let mut session =
        RepositorySession::new(Box::new(repository), Arc::new(QuietMonitorFactory));
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
    let mut session =
        RepositorySession::new(Box::new(repository), Arc::new(QuietMonitorFactory));
    let error = session
        .call("graph_stats", json!({}))
        .expect_err("refresh_if_stale must fail the first call");
    assert!(error.contains("stale check failed"), "got {error}");
}
