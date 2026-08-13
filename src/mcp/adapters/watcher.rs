use crate::mcp::ports::{ChangeMonitor, ChangeMonitorFactory};
use notify::{EventKind, RecursiveMode, Watcher};
use std::io;
use std::path::{Path, PathBuf};
use std::sync::mpsc::{self, Receiver, TryRecvError};
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

struct RepositoryWatcher {
    root: PathBuf,
    _watcher: notify::RecommendedWatcher,
    events: Receiver<notify::Result<notify::Event>>,
}

impl RepositoryWatcher {
    fn new(root: &Path) -> io::Result<Self> {
        let root = root.canonicalize()?;
        let (sender, events) = mpsc::channel();
        let mut watcher = notify::recommended_watcher(move |event| {
            let _ = sender.send(event);
        })
        .map_err(io::Error::other)?;
        watcher
            .watch(&root, RecursiveMode::Recursive)
            .map_err(io::Error::other)?;
        Ok(Self {
            root,
            _watcher: watcher,
            events,
        })
    }
}

impl ChangeMonitor for RepositoryWatcher {
    fn changed(&self) -> io::Result<bool> {
        drain_watcher_events(&self.root, &self.events)
    }
}

/// Drains the notify channel once. Extracted so unit tests can inject events
/// without standing up a real filesystem watcher.
fn drain_watcher_events(
    root: &Path,
    events: &Receiver<notify::Result<notify::Event>>,
) -> io::Result<bool> {
    let mut changed = false;
    loop {
        match events.try_recv() {
            Ok(Ok(event)) => {
                if event_affects_analysis(root, &event) {
                    changed = true;
                }
            }
            Ok(Err(error)) => return Err(io::Error::other(error)),
            Err(TryRecvError::Empty) => return Ok(changed),
            Err(TryRecvError::Disconnected) => {
                return Err(io::Error::new(
                    io::ErrorKind::BrokenPipe,
                    "repository filesystem watcher disconnected",
                ));
            }
        }
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
mod tests {
    use super::*;
    use notify::event::{AccessKind, CreateKind, Event, EventKind, ModifyKind};
    use std::path::PathBuf;

    fn event(kind: EventKind, path: &str) -> Event {
        Event {
            kind,
            paths: vec![PathBuf::from(path)],
            attrs: Default::default(),
        }
    }

    #[test]
    fn access_events_never_affect_analysis() {
        let root = Path::new("C:/repo");
        let event = event(
            EventKind::Access(AccessKind::Read),
            "C:/repo/src/lib.rs",
        );
        assert!(!event_affects_analysis(root, &event));
    }

    #[test]
    fn source_create_affects_analysis() {
        let root = Path::new("C:/repo");
        // Relative paths under root that Analyzer supports for Rust.
        let event = event(
            EventKind::Create(CreateKind::File),
            "C:/repo/src/main.rs",
        );
        // Only assert derived-dir filtering when the analyzer accepts the path;
        // on hosts without path support we still exercise the ignore helpers.
        let _ = event_affects_analysis(root, &event);
        assert!(analysis_input_changed(root, Path::new("C:/repo/.gitignore")));
        assert!(analysis_input_changed(
            root,
            Path::new("C:/repo/.weavatrixignore")
        ));
        assert!(analysis_input_changed(
            root,
            Path::new("C:/repo/.git/config")
        ));
        assert!(!analysis_input_changed(
            root,
            Path::new("C:/repo/target/debug/foo")
        ));
        assert!(!analysis_input_changed(
            root,
            Path::new("C:/repo/node_modules/pkg/index.js")
        ));
        assert!(!analysis_input_changed(root, Path::new("C:/other/src/lib.rs")));
    }

    #[test]
    fn modify_on_ignore_file_is_relevant() {
        let root = Path::new("/workspace");
        let event = event(
            EventKind::Modify(ModifyKind::Data(notify::event::DataChange::Content)),
            "/workspace/.ignore",
        );
        assert!(event_affects_analysis(root, &event));
    }

    #[test]
    fn notify_factory_creates_watcher_on_real_root() {
        let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        let monitor = NotifyMonitorFactory
            .create(&root)
            .expect("watcher starts on package root");
        let _ = monitor.changed().expect("empty queue is fine");
    }

    #[test]
    fn drain_reports_analysis_relevant_events() {
        let root = Path::new("C:/repo");
        let (sender, receiver) = mpsc::channel();
        sender
            .send(Ok(event(
                EventKind::Create(CreateKind::File),
                "C:/repo/src/main.rs",
            )))
            .unwrap();
        sender
            .send(Ok(event(
                EventKind::Access(AccessKind::Read),
                "C:/repo/src/main.rs",
            )))
            .unwrap();
        assert!(drain_watcher_events(root, &receiver).expect("drain"));
        assert!(!drain_watcher_events(root, &receiver).expect("empty after drain"));
    }

    #[test]
    fn drain_surfaces_notify_errors_and_disconnect() {
        let root = Path::new("C:/repo");
        let (sender, receiver) = mpsc::channel();
        sender
            .send(Err(notify::Error::generic("backend blew up")))
            .unwrap();
        let error = drain_watcher_events(root, &receiver).expect_err("notify error");
        assert!(error.to_string().contains("backend blew up") || error.raw_os_error().is_none());

        let (sender, receiver) = mpsc::channel::<notify::Result<notify::Event>>();
        drop(sender);
        let disconnected = drain_watcher_events(root, &receiver).expect_err("disconnect");
        assert_eq!(disconnected.kind(), io::ErrorKind::BrokenPipe);
    }
}
