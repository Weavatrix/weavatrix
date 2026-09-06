mod mcp;

use std::env;
use std::path::PathBuf;
use std::process::ExitCode;
use weavatrix_rust::{Analyzer, Weavatrix, operations};

fn main() -> ExitCode {
    match run(env::args().skip(1).collect()) {
        Ok(code) => code,
        Err(message) => {
            eprintln!("weavatrix: {message}");
            ExitCode::FAILURE
        }
    }
}

fn run(arguments: Vec<String>) -> Result<ExitCode, String> {
    if arguments.first().is_some_and(|value| value == "--version") {
        println!(
            "weavatrix {} (engine {})",
            env!("CARGO_PKG_VERSION"),
            weavatrix_rust::VERSION
        );
        return Ok(ExitCode::SUCCESS);
    }
    if arguments
        .first()
        .is_some_and(|value| value == "--help" || value == "-h")
    {
        print_help();
        return Ok(ExitCode::SUCCESS);
    }
    match arguments.first().map(String::as_str) {
        Some("mcp") => serve_mcp(&arguments),
        Some("list-tools") => list_operations(&arguments),
        Some("tool") => call_operation(&arguments),
        Some("analyze") => analyze(arguments),
        _ => {
            print_help();
            Err("expected the `mcp`, `analyze`, `tool`, or `list-tools` command".into())
        }
    }
}

fn serve_mcp(arguments: &[String]) -> Result<ExitCode, String> {
    let launch = parse_mcp_launch(&arguments[1..])?;
    let options = mcp::ServeOptions {
        profile: launch.profile,
        default_payload: mcp::parse_output_format(&default_output_format(launch.output_format))?,
    };
    // Stdio serve is the product entrypoint; unit coverage lives under `mcp::build_server`.
    let mut server =
        mcp::build_server(&launch.repository, options).map_err(|error| error.to_string())?;
    mcport::serve(&mut server)
        .map(|()| ExitCode::SUCCESS)
        .map_err(|error| error.to_string())
}

#[derive(Debug)]
struct McpLaunch {
    repository: String,
    profile: mcp::McpProfile,
    output_format: Option<String>,
}

/// Parses `mcp` launch arguments.
///
/// Exactly one positional repository root is accepted. A second positional is
/// treated only as a legacy JS capability/profile token (`offline`, `pinned`,
/// or a comma-separated group list) and never silently replaces the root.
fn parse_mcp_launch(arguments: &[String]) -> Result<McpLaunch, String> {
    let mut repository = None;
    let mut profile = mcp::McpProfile::All;
    let mut output_format = None;
    let mut positional = 0_u8;
    for argument in arguments {
        if let Some(value) = argument.strip_prefix("--profile=") {
            profile = value.parse()?;
        } else if let Some(value) = argument.strip_prefix("--output-format=") {
            output_format = Some(value.to_owned());
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

/// Whether a client reads `structuredContent` does not change between calls,
/// so the answer shape is chosen once here rather than restated as an argument
/// on every call. The flag wins over the environment; both are explicit.
fn default_output_format(flag: Option<String>) -> String {
    flag.or_else(|| {
        env::var("WEAVATRIX_OUTPUT_FORMAT")
            .ok()
            .filter(|value| !value.trim().is_empty())
    })
    .unwrap_or_else(|| "json".to_owned())
}

fn list_operations(arguments: &[String]) -> Result<ExitCode, String> {
    let mut profile = mcp::McpProfile::All;
    for argument in arguments.iter().skip(1) {
        if let Some(value) = argument.strip_prefix("--profile=") {
            profile = value.parse()?;
        } else {
            return Err(format!("unknown list-tools option: {argument}"));
        }
    }
    println!(
        "{}",
        blazingly_json::to_string_pretty(&operations::catalog_for_profile(profile))
            .map_err(|error| error.to_string())?
    );
    Ok(ExitCode::SUCCESS)
}

fn call_operation(arguments: &[String]) -> Result<ExitCode, String> {
    let name = arguments
        .get(1)
        .ok_or_else(|| "tool requires an operation name".to_owned())?;
    let repository = arguments.get(2).map_or(".", String::as_str);
    let input = arguments
        .get(3)
        .map_or_else(
            || Ok(blazingly_json::json!({})),
            |value| blazingly_json::from_str(value),
        )
        .map_err(|error| format!("invalid operation JSON: {error}"))?;
    let mut engine = Weavatrix::open(repository).map_err(|error| error.to_string())?;
    let output = operations::call(&mut engine, name, input)?;
    println!(
        "{}",
        blazingly_json::to_string_pretty(&output).map_err(|error| error.to_string())?
    );
    // A blocked verification is a failed gate, not a tool error: the report
    // stays on stdout and the exit code carries the verdict.
    if matches!(name.as_str(), "verify_architecture" | "verify_capabilities")
        && output["state"] == "BLOCKED"
    {
        return Ok(ExitCode::FAILURE);
    }
    Ok(ExitCode::SUCCESS)
}

fn analyze(arguments: Vec<String>) -> Result<ExitCode, String> {
    let mut repository = PathBuf::from(".");
    let mut pretty = false;
    let mut legacy = false;
    for argument in arguments.into_iter().skip(1) {
        if argument == "--pretty" {
            pretty = true;
        } else if argument == "--format=legacy" {
            legacy = true;
        } else if argument == "--format=snapshot" {
            legacy = false;
        } else if argument.starts_with('-') {
            return Err(format!("unknown analyze option: {argument}"));
        } else {
            repository = PathBuf::from(argument);
        }
    }
    let analyzer = Analyzer::default();
    let json = if legacy {
        analyzer.analyze_legacy_json(repository, pretty)
    } else {
        analyzer.analyze_json(repository, pretty)
    }
    .map_err(|error| error.to_string())?;
    println!("{json}");
    Ok(ExitCode::SUCCESS)
}

fn print_help() {
    println!(
        "Weavatrix repository intelligence for coding agents\n\n\
Usage:\n  weavatrix mcp [REPOSITORY] [--profile=all|code|seo] \
[--output-format=json|text|structured]\n\
  weavatrix analyze [REPOSITORY] [--pretty] [--format=snapshot|legacy]\n\
  weavatrix list-tools [--profile=all|code|seo]\n\
  weavatrix tool NAME [REPOSITORY] ['{{\"argument\":\"value\"}}']\n\
  weavatrix --version\n\n\
Legacy JS launches that passed a second positional capability token are \
accepted only as:\n\
  offline → --profile=all (native is always offline)\n\
  pinned / comma-lists → migration error with the new command\n\n\
Output format (also WEAVATRIX_OUTPUT_FORMAT; a call may still name its own):\n\
  json        structuredContent plus the text mirror clients without \
structured\n              output need. The default.\n\
  structured  structuredContent alone. The mirror is the pretty-printed copy \
of\n              the payload, so dropping it roughly halves every answer.\n\
  text        the concise text block alone, no structuredContent."
    );
}

#[cfg(test)]
mod mcp_launch_tests {
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
