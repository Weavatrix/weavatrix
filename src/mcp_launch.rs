//! MCP process launch argument parsing for the product CLI.

use crate::mcp;

#[derive(Debug)]
pub(crate) struct McpLaunch {
    pub(crate) repository: String,
    pub(crate) profile: mcp::McpProfile,
    pub(crate) output_format: Option<String>,
    pub(crate) allow_retarget: bool,
}

/// Parses `mcp` launch arguments.
///
/// Exactly one positional repository root is accepted. A second positional is
/// treated only as a legacy JS capability/profile token (`offline`, `pinned`,
/// or a comma-separated group list) and never silently replaces the root.
pub(crate) fn parse_mcp_launch(arguments: &[String]) -> Result<McpLaunch, String> {
    let mut repository = None;
    let mut profile = mcp::McpProfile::All;
    let mut output_format = None;
    let mut allow_retarget = false;
    let mut positional = 0_u8;
    for argument in arguments {
        if let Some(value) = argument.strip_prefix("--profile=") {
            profile = value.parse()?;
        } else if let Some(value) = argument.strip_prefix("--output-format=") {
            output_format = Some(value.to_owned());
        } else if argument == "--allow-retarget" {
            allow_retarget = true;
        } else if argument.starts_with('-') {
            return Err(format!("unknown MCP option: {argument}"));
        } else {
            positional = positional.saturating_add(1);
            match positional {
                1 if is_legacy_capability_token(argument) => {
                    profile = map_legacy_capability(argument)?;
                }
                1 => repository = Some(argument.clone()),
                2 => profile = map_legacy_capability(argument)?,
                _ => {
                    return Err(
                        "mcp accepts at most one repository path and one optional legacy \
                         capability token; use --profile=all|code|seo"
                            .into(),
                    );
                }
            }
        }
    }
    Ok(McpLaunch {
        repository: repository.unwrap_or_else(|| ".".to_owned()),
        profile,
        output_format,
        allow_retarget,
    })
}

fn is_legacy_capability_token(value: &str) -> bool {
    matches!(
        value,
        "offline" | "pinned" | "all" | "code" | "seo" | "content"
    ) || value.contains(',')
}

fn map_legacy_capability(value: &str) -> Result<mcp::McpProfile, String> {
    match value {
        "offline" | "all" => Ok(mcp::McpProfile::All),
        "code" => Ok(mcp::McpProfile::Code),
        "seo" | "content" => Ok(mcp::McpProfile::Seo),
        "pinned" => Err(
            "legacy capability `pinned` has no silent native equivalent; choose an explicit \
             surface with --profile=code (repository intelligence without SEO tools) or \
             --profile=all after reviewing the tool list. Example: weavatrix mcp . --profile=code"
                .into(),
        ),
        other if other.contains(',') => Err(format!(
            "legacy comma-separated capability list {other:?} is not accepted by native \
             Weavatrix; use --profile=all, --profile=code, or --profile=seo. Example: \
             weavatrix mcp . --profile=code"
        )),
        other => Err(format!(
            "unknown legacy capability {other:?}; expected offline (maps to --profile=all), \
             or use --profile=all|code|seo"
        )),
    }
}

#[cfg(test)]
mod tests {
    use super::{is_legacy_capability_token, map_legacy_capability, parse_mcp_launch};
    use crate::mcp::McpProfile;

    fn args(values: &[&str]) -> Vec<String> {
        values.iter().map(|value| (*value).to_owned()).collect()
    }

    #[test]
    fn one_root_and_profile_flag() {
        let launch = parse_mcp_launch(&args(&["/repo", "--profile=code"])).unwrap();
        assert_eq!(launch.repository, "/repo");
        assert_eq!(launch.profile, McpProfile::Code);
        assert!(!launch.allow_retarget);
    }

    #[test]
    fn allow_retarget_flag() {
        let launch = parse_mcp_launch(&args(&["/repo", "--allow-retarget"])).unwrap();
        assert!(launch.allow_retarget);
    }

    #[test]
    fn legacy_offline_second_positional_does_not_replace_root() {
        let launch = parse_mcp_launch(&args(&["/repo", "offline"])).unwrap();
        assert_eq!(launch.repository, "/repo");
        assert_eq!(launch.profile, McpProfile::All);
    }

    #[test]
    fn bare_offline_without_root_uses_cwd() {
        let launch = parse_mcp_launch(&args(&["offline"])).unwrap();
        assert_eq!(launch.repository, ".");
        assert_eq!(launch.profile, McpProfile::All);
    }

    #[test]
    fn pinned_requires_explicit_migration() {
        let error = parse_mcp_launch(&args(&["/repo", "pinned"])).unwrap_err();
        assert!(error.contains("--profile=code"), "{error}");
        assert!(error.contains("pinned"), "{error}");
    }

    #[test]
    fn comma_list_requires_explicit_migration() {
        let error = map_legacy_capability("graph,search,source").unwrap_err();
        assert!(error.contains("--profile="), "{error}");
    }

    #[test]
    fn third_positional_is_rejected() {
        let error = parse_mcp_launch(&args(&["/repo", "offline", "extra"])).unwrap_err();
        assert!(error.contains("at most one repository path"), "{error}");
    }

    #[test]
    fn legacy_tokens_are_recognized() {
        assert!(is_legacy_capability_token("offline"));
        assert!(is_legacy_capability_token("pinned"));
        assert!(is_legacy_capability_token("graph,search"));
        assert!(!is_legacy_capability_token("/abs/repo"));
    }
}
