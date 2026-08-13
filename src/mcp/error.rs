use std::fmt::{Display, Formatter};
use std::io;
use weavatrix_rust::Error;

#[derive(Debug)]
pub enum McpError {
    Io(io::Error),
    Repository(Error),
}

impl Display for McpError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Io(error) => write!(formatter, "MCP I/O failed: {error}"),
            Self::Repository(error) => {
                write!(formatter, "repository initialization failed: {error}")
            }
        }
    }
}

impl std::error::Error for McpError {}

impl From<io::Error> for McpError {
    fn from(value: io::Error) -> Self {
        Self::Io(value)
    }
}

impl From<Error> for McpError {
    fn from(value: Error) -> Self {
        Self::Repository(value)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn display_and_from_cover_both_variants() {
        let io_error = McpError::from(io::Error::new(io::ErrorKind::NotFound, "missing root"));
        let io_message = io_error.to_string();
        assert!(io_message.contains("MCP I/O failed"), "got {io_message}");
        assert!(io_message.contains("missing root"), "got {io_message}");
        // `Error` is the trait object path agents read when format!("{}", err).
        let _ = (&io_error as &dyn std::error::Error).source();

        let repository = McpError::from(Error::InvalidRepository(PathBuf::from("fixture")));
        let repository_message = repository.to_string();
        assert!(
            repository_message.contains("repository initialization failed"),
            "got {repository_message}"
        );
        assert!(
            format!("{repository:?}").contains("Repository"),
            "Debug must keep the variant name"
        );
    }
}
