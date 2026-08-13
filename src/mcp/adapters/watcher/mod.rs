//! Filesystem change detection for a watched repository root.
//!
//! A monitor is asked one question - `changed()` - and never asked *what*
//! changed, so the only state kept between tool calls is a single flag.
//! Classification therefore happens inside the notify callback rather than at
//! drain time: the callback runs on the backend thread as events arrive, while
//! a drain runs only when an MCP tool is called. Queueing raw events instead
//! would grow without bound whenever the server sits idle - a build writing
//! into `target/` produces events this monitor discards, but a queue would
//! still hold every one of them until the next tool call.

use crate::mcp::ports::{ChangeMonitor, ChangeMonitorFactory};
use notify::{EventKind, RecursiveMode, Watcher};
use std::io;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex, PoisonError};
use weavatrix_rust::Analyzer;

const DERIVED_DIRECTORIES: &[&str] = &[
    ".git",
    ".weavatrix",
    ".codegraph",
    ".next",
    ".nuxt",
    ".svelte-kit",
    ".turbo",
    ".venv",
    "build",
    "coverage",
    "dist",
    "node_modules",
    "target",
    "vendor",
];

pub(crate) struct NotifyMonitorFactory;

impl ChangeMonitorFactory for NotifyMonitorFactory {
    fn create(&self, root: &Path) -> io::Result<Box<dyn ChangeMonitor>> {
        RepositoryWatcher::new(root).map(|watcher| Box::new(watcher) as Box<dyn ChangeMonitor>)
    }
}

/// Everything the watcher carries between tool calls: one flag per condition,
/// and at most one error message. Constant size, whatever the event volume.
#[derive(Default)]
struct WatchState {
    changed: AtomicBool,
    disconnected: AtomicBool,
    failure: Mutex<Option<String>>,
}

impl WatchState {
    /// Folds one backend event into the flags. Separated from the callback so
    /// unit tests can inject events without standing up a real watcher.
    fn record(&self, root: &Path, event: notify::Result<notify::Event>) {
        match event {
            Ok(event) => {
                if event_affects_analysis(root, &event) {
                    self.changed.store(true, Ordering::Relaxed);
                }
            }
            // The first error describes the failure; later ones are noise from
            // the same broken backend.
            Err(error) => {
                self.failure
                    .lock()
                    .unwrap_or_else(PoisonError::into_inner)
                    .get_or_insert_with(|| error.to_string());
            }
        }
    }

    fn take(&self) -> io::Result<bool> {
        let failure = self
            .failure
            .lock()
            .unwrap_or_else(PoisonError::into_inner)
            .take();
        if let Some(error) = failure {
            return Err(io::Error::other(error));
        }
        if self.disconnected.load(Ordering::Relaxed) {
            return Err(io::Error::new(
                io::ErrorKind::BrokenPipe,
                "repository filesystem watcher disconnected",
            ));
        }
        Ok(self.changed.swap(false, Ordering::Relaxed))
    }
}

/// Owned by the notify callback, so dropping the callback - the backend
/// shutting down - reports as a disconnect on the next `changed()`.
struct Callback {
    root: PathBuf,
    state: Arc<WatchState>,
}

impl Callback {
    fn handle(&self, event: notify::Result<notify::Event>) {
        self.state.record(&self.root, event);
    }
}

impl Drop for Callback {
    fn drop(&mut self) {
        self.state.disconnected.store(true, Ordering::Relaxed);
    }
}

struct RepositoryWatcher {
    _watcher: notify::RecommendedWatcher,
    state: Arc<WatchState>,
}

impl RepositoryWatcher {
    fn new(root: &Path) -> io::Result<Self> {
        let root = root.canonicalize()?;
        let state = Arc::new(WatchState::default());
        let callback = Callback {
            root: root.clone(),
            state: Arc::clone(&state),
        };
        let mut watcher = notify::recommended_watcher(move |event| callback.handle(event))
            .map_err(io::Error::other)?;
        watcher
            .watch(&root, RecursiveMode::Recursive)
            .map_err(io::Error::other)?;
        Ok(Self {
            _watcher: watcher,
            state,
        })
    }
}

impl ChangeMonitor for RepositoryWatcher {
    fn changed(&self) -> io::Result<bool> {
        self.state.take()
    }
}

fn event_affects_analysis(root: &Path, event: &notify::Event) -> bool {
    !matches!(event.kind, EventKind::Access(_))
        && event
            .paths
            .iter()
            .any(|path| analysis_input_changed(root, path))
}

fn analysis_input_changed(root: &Path, path: &Path) -> bool {
    let Ok(relative) = path.strip_prefix(root) else {
        return false;
    };
    let normalized = relative.to_string_lossy().replace('\\', "/");
    let lower = normalized.to_ascii_lowercase();
    let file_name = relative
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase();

    if is_ignore_configuration(&file_name, &lower) {
        return true;
    }
    if lower
        .split('/')
        .any(|component| DERIVED_DIRECTORIES.contains(&component))
    {
        return false;
    }
    Analyzer::default().supports_path(&normalized)
}

fn is_ignore_configuration(file_name: &str, relative_path: &str) -> bool {
    matches!(file_name, ".gitignore" | ".ignore" | ".weavatrixignore")
        || matches!(relative_path, ".git/config" | ".git/info/exclude")
}

#[cfg(test)]
mod tests;
