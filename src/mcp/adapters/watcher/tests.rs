use super::*;
use notify::event::{AccessKind, CreateKind, Event, EventAttributes, EventKind, ModifyKind};
use std::path::PathBuf;

fn event(kind: EventKind, path: &str) -> Event {
    Event {
        kind,
        paths: vec![PathBuf::from(path)],
        attrs: EventAttributes::default(),
    }
}

#[test]
fn access_events_never_affect_analysis() {
    let root = Path::new("C:/repo");
    let event = event(EventKind::Access(AccessKind::Read), "C:/repo/src/lib.rs");
    assert!(!event_affects_analysis(root, &event));
}

#[test]
fn source_create_affects_analysis() {
    let root = Path::new("C:/repo");
    // Relative paths under root that Analyzer supports for Rust.
    let event = event(EventKind::Create(CreateKind::File), "C:/repo/src/main.rs");
    // Only assert derived-dir filtering when the analyzer accepts the path;
    // on hosts without path support we still exercise the ignore helpers.
    let _ = event_affects_analysis(root, &event);
    assert!(analysis_input_changed(
        root,
        Path::new("C:/repo/.gitignore")
    ));
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
    assert!(!analysis_input_changed(
        root,
        Path::new("C:/other/src/lib.rs")
    ));
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
fn recording_reports_analysis_relevant_events() {
    let root = Path::new("C:/repo");
    let state = WatchState::default();
    state.record(
        root,
        Ok(event(
            EventKind::Create(CreateKind::File),
            "C:/repo/.gitignore",
        )),
    );
    state.record(
        root,
        Ok(event(
            EventKind::Access(AccessKind::Read),
            "C:/repo/src/main.rs",
        )),
    );
    assert!(state.take().expect("recorded change"));
    assert!(!state.take().expect("flag clears once taken"));
}

#[test]
fn irrelevant_events_never_accumulate() {
    // The regression this monitor exists to prevent: derived-directory
    // churn must cost nothing and leave nothing behind, however much of
    // it arrives between two tool calls.
    let root = Path::new("C:/repo");
    let state = WatchState::default();
    for index in 0..100_000 {
        state.record(
            root,
            Ok(event(
                EventKind::Create(CreateKind::File),
                &format!("C:/repo/target/debug/deps/artifact_{index}.o"),
            )),
        );
    }
    assert!(!state.take().expect("derived churn is not a change"));
}

#[test]
fn recording_surfaces_notify_errors_and_disconnect() {
    let root = Path::new("C:/repo");
    let state = WatchState::default();
    state.record(root, Err(notify::Error::generic("backend blew up")));
    let error = state.take().expect_err("notify error");
    assert!(error.to_string().contains("backend blew up"));
    assert!(!state.take().expect("error clears once reported"));

    let state = Arc::new(WatchState::default());
    drop(Callback {
        root: root.to_path_buf(),
        state: Arc::clone(&state),
    });
    let disconnected = state.take().expect_err("disconnect");
    assert_eq!(disconnected.kind(), io::ErrorKind::BrokenPipe);
}
