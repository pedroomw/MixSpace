"""
exceptions.py — Custom exception hierarchy for the MixSpace FL Studio plugin.

All plugin-specific errors inherit from MixSpacePluginError so callers can
catch the base class when they want to handle any plugin error uniformly.

Installation: place this file in the same MixSpace plugin folder as device_plugin.py.
"""


class MixSpacePluginError(Exception):  # base class for all MixSpace plugin errors
    """Base exception for every error raised by the MixSpace plugin."""


class ProjectNotOpenError(MixSpacePluginError):  # raised when no FL Studio project is loaded
    """Raised when the FL Studio scripting API reports no open project."""


class UnsupportedFileTypeError(MixSpacePluginError):  # raised when the open file is not a .flp
    """Raised when the resolved project path does not end with the .flp extension."""


class ProjectFileNotFoundError(MixSpacePluginError):  # raised when the .flp file is missing on disk
    """Raised when the resolved .flp path does not exist on the filesystem."""


class FileTooLargeError(MixSpacePluginError):  # raised when the project file exceeds 100 MB
    """Raised when the project file size exceeds the 100 MB upload limit."""


class ConfigError(MixSpacePluginError):  # raised when the config file cannot be read or written
    """Raised when mixspace_config.json cannot be parsed, loaded, or saved."""


class UploadError(MixSpacePluginError):  # raised when the MixSpace API returns an error response
    """Raised when the MixSpace REST API returns a non-201 HTTP status code."""
