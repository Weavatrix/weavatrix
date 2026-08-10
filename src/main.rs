mod mcp;

use std::env;
use std::path::PathBuf;
use std::process::ExitCode;
use weavatrix_rust::{Analyzer, Weavatrix, operations};

fn main() -> ExitCode {
    match run(env::args().skip(1).collect()) {
        Ok(()) => ExitCode::SUCCESS,
        Err(message) => {
            eprintln!("weavatrix: {message}");
            ExitCode::FAILURE
        }
    }
}

fn run(arguments: Vec<String>) -> Result<(), String> {
    if arguments.first().is_some_and(|value| value == "--version") {
        println!(
            "weavatrix {} (engine {})",
            env!("CARGO_PKG_VERSION"),
            weavatrix_rust::VERSION
        );
        return Ok(());
    }
    if arguments
        .first()
        .is_some_and(|value| value == "--help" || value == "-h")
    {
        print_help();
        return Ok(());
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

fn serve_mcp(arguments: &[String]) -> Result<(), String> {
    let mut repository = ".";
    let mut profile = mcp::McpProfile::All;
    let mut output_format = None;
    for argument in arguments.iter().skip(1) {
        if let Some(value) = argument.strip_prefix("--profile=") {
            profile = value.parse()?;
        } else if let Some(value) = argument.strip_prefix("--output-format=") {
            output_format = Some(value.to_owned());
        } else if argument.starts_with('-') {
            return Err(format!("unknown MCP option: {argument}"));
        } else {
            repository = argument;
        }
    }
    let options = mcp::ServeOptions {
        profile,
        default_payload: mcp::parse_output_format(&default_output_format(output_format))?,
    };
    mcp::serve_with_options(repository, options).map_err(|error| error.to_string())
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

fn list_operations(arguments: &[String]) -> Result<(), String> {
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
    Ok(())
}

fn call_operation(arguments: &[String]) -> Result<(), String> {
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
    Ok(())
}

fn analyze(arguments: Vec<String>) -> Result<(), String> {
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
    Ok(())
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
Output format (also WEAVATRIX_OUTPUT_FORMAT; a call may still name its own):\n\
  json        structuredContent plus the text mirror clients without \
structured\n              output need. The default.\n\
  structured  structuredContent alone. The mirror is the pretty-printed copy \
of\n              the payload, so dropping it roughly halves every answer.\n\
  text        the concise text block alone, no structuredContent."
    );
}
