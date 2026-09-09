//! Launch-root pin: keep every MCP answer on the repository this process was started for.

use blazingly_json::Value;
use std::path::{Path, PathBuf};

/// Policy for the process-wide active repository.
#[derive(Debug, Clone)]
pub(crate) struct RootPin {
    pinned: PathBuf,
    allow_retarget: bool,
}

impl RootPin {
    pub(crate) fn new(pinned: PathBuf, allow_retarget: bool) -> Self {
        Self {
            pinned,
            allow_retarget,
        }
    }

    /// Rejects `open_repo` away from the launch root unless retarget is allowed.
    pub(crate) fn guard_open_repo(&self, arguments: &Value) -> Result<(), String> {
        if self.allow_retarget {
            return Ok(());
        }
        let Some(path) = arguments.get("path").and_then(Value::as_str) else {
            return Ok(());
        };
        if paths_match(&self.pinned, Path::new(path)) {
            return Ok(());
        }
        Err(format!(
            "active repository is pinned to {}; refusing open_repo to {path}; \
             relaunch with --allow-retarget only for intentional multi-root sessions",
            self.pinned.display()
        ))
    }

    /// After a successful retarget, keep the pin aligned with the new active root.
    pub(crate) fn adopt(&mut self, root: &Path) {
        if self.allow_retarget {
            self.pinned = root.to_path_buf();
        }
    }

    /// Injects `expected_repository` from the pin when the caller omitted it.
    pub(crate) fn inject_expected(&self, mut arguments: Value) -> Value {
        let missing = arguments
            .get("expected_repository")
            .and_then(Value::as_str)
            .is_none_or(|value| value.trim().is_empty());
        if !missing {
            return arguments;
        }
        let pin = Value::String(self.pinned.to_string_lossy().into_owned());
        if let Some(object) = arguments.as_object_mut() {
            object.insert("expected_repository".into(), pin);
            return arguments;
        }
        blazingly_json::json!({ "expected_repository": self.pinned.to_string_lossy() })
    }
}

pub(crate) fn paths_match(left: &Path, right: &Path) -> bool {
    if let (Ok(a), Ok(b)) = (left.canonicalize(), right.canonicalize()) {
        return a == b;
    }
    let left_name = left.file_name().and_then(|value| value.to_str());
    let right_name = right.file_name().and_then(|value| value.to_str());
    if let (Some(a), Some(b)) = (left_name, right_name)
        && a.eq_ignore_ascii_case(b)
        && right.components().count() == 1
    {
        return true;
    }
    path_key(left) == path_key(right)
}

fn path_key(path: &Path) -> String {
    let raw = path.to_string_lossy();
    #[cfg(windows)]
    {
        raw.trim_end_matches(['/', '\\'])
            .replace('/', "\\")
            .to_ascii_lowercase()
    }
    #[cfg(not(windows))]
    {
        raw.trim_end_matches('/').to_string()
    }
}

/// Canonical absolute root used as the process pin.
pub(crate) fn resolve_pin_root(root: impl AsRef<Path>) -> PathBuf {
    let root = root.as_ref();
    root.canonicalize().unwrap_or_else(|_| {
        if root.is_absolute() {
            root.to_path_buf()
        } else {
            std::env::current_dir()
                .unwrap_or_else(|_| PathBuf::from("."))
                .join(root)
        }
    })
}

#[cfg(test)]
mod tests {
    use super::{RootPin, paths_match};
    use blazingly_json::json;
    use std::path::PathBuf;

    #[test]
    fn injects_expected_repository_when_missing() {
        let pin = RootPin::new(PathBuf::from("/repo/weavatrix"), false);
        let args = pin.inject_expected(json!({}));
        assert_eq!(
            args.get("expected_repository").and_then(|v| v.as_str()),
            Some("/repo/weavatrix")
        );
    }

    #[test]
    fn preserves_explicit_expected_repository() {
        let pin = RootPin::new(PathBuf::from("/repo/weavatrix"), false);
        let args = pin.inject_expected(json!({"expected_repository": "other"}));
        assert_eq!(
            args.get("expected_repository").and_then(|v| v.as_str()),
            Some("other")
        );
    }

    #[test]
    fn rejects_open_repo_away_from_pin() {
        let pin = RootPin::new(PathBuf::from("/repo/weavatrix"), false);
        let error = pin
            .guard_open_repo(&json!({"path": "/repo/sweeploom"}))
            .unwrap_err();
        assert!(error.contains("pinned"), "{error}");
        assert!(error.contains("--allow-retarget"), "{error}");
    }

    #[test]
    fn allows_open_repo_when_retarget_enabled() {
        let pin = RootPin::new(PathBuf::from("/repo/weavatrix"), true);
        pin.guard_open_repo(&json!({"path": "/repo/sweeploom"}))
            .unwrap();
    }

    #[test]
    fn folder_name_matches_pin() {
        assert!(paths_match(
            PathBuf::from("/repo/weavatrix").as_path(),
            PathBuf::from("weavatrix").as_path()
        ));
    }
}
