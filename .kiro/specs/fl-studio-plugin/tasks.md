# Implementation Plan: FL Studio MixSpace Plugin

## Overview

Implement a pure-Python FL Studio MIDI Script Device plugin consisting of 8 source files plus a test suite. The plugin surfaces a floating tkinter window, detects the open `.flp` project, validates metadata, constructs a multipart/form-data HTTP body using only Python stdlib, and posts it to the MixSpace API on a background daemon thread. Every line of code carries an inline `#` comment.

## Tasks

- [ ] 1. Create `exceptions.py` — custom exception hierarchy
  - [ ] 1.1 Define all custom exception classes
    - Write `MixSpacePluginError(Exception)` as the base class with an inline `#` comment on every line
    - Subclass `ProjectNotOpenError`, `UnsupportedFileTypeError`, `ProjectFileNotFoundError`, `FileTooLargeError`, `ConfigError`, and `UploadError` from `MixSpacePluginError`
    - Add a module-level docstring describing the exception hierarchy and its role in the plugin
    - Every class must have a docstring stating its trigger condition
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 6.5, 7.6_

- [ ] 2. Create `multipart_builder.py` — multipart/form-data serialisation
  - [ ] 2.1 Implement `build_boundary()` and `build_multipart_body()`
    - Write `build_boundary()` returning a 40-character string drawn exclusively from the RFC 2046 `bchar` set using `random.choices` — every line gets an inline `#` comment
    - Write `build_multipart_body(boundary, filename, file_bytes, description, project_id)` that encodes the `file` part with `Content-Type: application/octet-stream` and `filename=` in the disposition header, and encodes `description` and `projectID` parts as `text/plain; charset=utf-8` with no `filename` parameter — every line gets an inline `#` comment
    - Terminate the body with the closing boundary delimiter (`--boundary--\r\n`)
    - Include module-level and function docstrings
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 2.2 Implement `parse_multipart_body()` (test-support helper)
    - Write `parse_multipart_body(boundary, body)` that splits the raw bytes on the boundary delimiter and returns a `dict[str, bytes]` mapping each field name to its raw content bytes — every line gets an inline `#` comment
    - This function is used exclusively by tests to verify round-trip correctness; it must live in `multipart_builder.py` so tests can import it without additional dependencies
    - _Requirements: 8.4, 8.5_

  - [ ]* 2.3 Write property-based tests for `multipart_builder.py`
    - Create `tests/test_multipart_builder.py` using **Hypothesis**
    - **Property 1: Multipart round-trip preserves all field values** — use `text(min_size=1, max_size=1000)` for `description`, `text(min_size=1, max_size=100)` for `project_id`, `binary()` for file bytes; assert parsed values match UTF-8-encoded originals byte-for-byte. Tag with `# Feature: fl-studio-plugin, Property 1`
    - **Property 2: Boundary is always a valid RFC 2046 bchar string** — call `build_boundary()` in a `@given(data())` test and assert length 1–70 and charset. Tag with `# Feature: fl-studio-plugin, Property 2`
    - **Property 3: Multipart parts carry correct Content-Type and Content-Disposition headers** — use `text()` for filename (including path separators), `binary()` for content, `text(min_size=1)` for description and project_id; assert header values in raw body bytes. Tag with `# Feature: fl-studio-plugin, Property 3`
    - Annotate all tests with `@settings(max_examples=100)`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 3. Create `config_manager.py` — JSON config read/write
  - [ ] 3.1 Implement `ConfigManager` class
    - Write `__init__(self, config_path: str)` that stores the path and initialises an empty in-memory dict — every line gets an inline `#` comment
    - Write `load()` to read `mixspace_config.json`; if the file is absent, create it with defaults (`api_base_url: "http://localhost:3000"`, `project_mappings: {}`); if the file contains malformed JSON or is missing required fields, log the error, discard the file, and recreate it with defaults
    - Write `save()` to serialise the in-memory config to JSON and write it to disk; raise `ConfigError` if the write fails
    - Write `get_api_base_url()`, `set_api_base_url(url)`, `get_project_id(filename)`, `add_mapping(filename, project_id)`, and `remove_mapping(filename)` — every line gets an inline `#` comment
    - Add module-level and per-method docstrings
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 3.2 Write unit tests for `ConfigManager`
    - Create `tests/test_config_manager.py` using `unittest` and `tempfile`
    - Test scenarios: missing file triggers default creation, malformed JSON triggers recreation with defaults, load/save round-trip for non-trivial mappings, `add_mapping` persists, `remove_mapping` persists, `get_project_id` returns `None` for unmapped filename, disk write failure raises `ConfigError`
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.6, 6.7_

  - [ ]* 3.3 Write property-based test for config serialisation round-trip
    - Add to `tests/test_config_manager.py`
    - **Property 4: Config serialisation round-trip** — composite Hypothesis strategy building valid config dicts with arbitrary `text()` keys and values; assert `load()` after `save()` yields an equal object. Tag with `# Feature: fl-studio-plugin, Property 4`
    - _Requirements: 6.1, 6.3, 6.6_

- [ ] 4. Create `project_detector.py` — FL Studio path resolution
  - [ ] 4.1 Implement `ProjectDetector` class
    - Write `get_project_path(self) -> str` that calls `ui.getProjectName()` (FL Studio scripting API) to obtain the current project path — every line gets an inline `#` comment
    - Raise `ProjectNotOpenError` if the returned path is empty or `None`
    - Raise `UnsupportedFileTypeError` if the resolved path does not end with `.flp` (case-insensitive check)
    - Raise `ProjectFileNotFoundError` if `os.path.exists()` returns `False` for the resolved path
    - Wrap the `ui.getProjectName()` call in `try/except Exception` and raise `ProjectNotOpenError` on any scripting API exception, per requirement 2.5
    - Add module-level and method docstrings
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 4.2 Write unit tests for `ProjectDetector`
    - Create `tests/test_project_detector.py` using `unittest.mock.patch` to mock the `ui` module
    - Test scenarios: valid `.flp` path returned normally, empty path raises `ProjectNotOpenError`, non-`.flp` extension raises `UnsupportedFileTypeError`, path does not exist on disk raises `ProjectFileNotFoundError`, scripting API raises exception → caught and re-raised as `ProjectNotOpenError`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 5. Checkpoint — core domain layer complete
  - Ensure `exceptions.py`, `multipart_builder.py`, `config_manager.py`, and `project_detector.py` are all importable and their unit/property tests pass. Ask the user if any questions arise before proceeding.

- [ ] 6. Create `uploader.py` — HTTP client
  - [ ] 6.1 Implement `UploadResult` dataclass and `Uploader` class
    - Write the `UploadResult` dataclass with fields `success: bool`, `message: str`, `status_code: int` — every line gets an inline `#` comment
    - Write `Uploader.__init__(self, api_base_url: str)` storing the URL and parsing the scheme/host/port for `http.client` — every line gets an inline `#` comment
    - Write `upload(self, file_path: str, description: str, project_id: str) -> UploadResult` that: reads file bytes, checks file size (raise `FileTooLargeError` if > 100 MB), calls `build_boundary()` and `build_multipart_body()`, opens an `http.client.HTTPConnection` (or `HTTPSConnection` for `https`), sends the POST to `/files/upload` with a 30-second timeout, and maps HTTP status codes to the correct `UploadResult` messages per requirements 4.4–4.8
    - Handle `OSError` and `ConnectionRefusedError` by returning an `UploadResult` with `success=False`, the connection error message, and `status_code=0`
    - Handle non-JSON 400 response bodies per requirement 7.2
    - Add module-level and method docstrings
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 7.2, 7.6_

  - [ ]* 6.2 Write unit tests for `Uploader`
    - Create `tests/test_uploader.py` using `unittest.mock.patch` on `http.client.HTTPConnection`
    - Test scenarios: HTTP 201 returns success result, HTTP 400 with JSON `error` field returns formatted rejection message, HTTP 413 returns correct message, HTTP 500 returns server error message, `ConnectionRefusedError` returns network error message, timeout (mock `socket.timeout`) returns timeout message
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [ ]* 6.3 Write property-based tests for `Uploader` HTTP response handling
    - Add to `tests/test_uploader.py`
    - **Property 5: Whitespace-only and empty descriptions are rejected** — use `text(alphabet=characters(categories=["Zs", "Cc"]))` plus the empty string; mock the controller-level validation to confirm no `Uploader.upload()` call is made. Tag with `# Feature: fl-studio-plugin, Property 5`
    - **Property 6: File size guard prevents oversized uploads** — mock `os.path.getsize` with `integers(min_value=104_857_601)`; assert `FileTooLargeError` is raised and `http.client.HTTPConnection` is never opened. Tag with `# Feature: fl-studio-plugin, Property 6`
    - **Property 7: 5xx responses always produce a consistent server-error message** — mock HTTP responses with `integers(min_value=500, max_value=599)` status codes; assert `UploadResult.success=False` and `message == "Server error. Please try again later."`. Tag with `# Feature: fl-studio-plugin, Property 7`
    - **Property 8: 400 error field is always surfaced in the rejection message** — use `text(min_size=1)` for the `error` field value in mocked 400 JSON responses; assert `message` contains the exact error string. Tag with `# Feature: fl-studio-plugin, Property 8`
    - _Requirements: 3.1, 3.2, 4.5, 4.7, 7.6_

- [ ] 7. Checkpoint — HTTP and serialisation layer complete
  - Ensure all tests in `test_multipart_builder.py`, `test_config_manager.py`, and `test_uploader.py` pass. Ask the user if any questions arise before proceeding.

- [ ] 8. Create `controller.py` — upload orchestration
  - [ ] 8.1 Implement `UploadController` class
    - Write `__init__(self, panel, config_manager, project_detector, uploader_factory)` storing all collaborators — every line gets an inline `#` comment
    - Write `on_upload_click(self) -> None` that: reads `description` from the panel; validates it is non-empty and non-whitespace-only (display "Version description is required." and abort if not); calls `project_detector.get_project_path()`; calls `config_manager.get_project_id(bare_filename)`; displays the correct error message and aborts if any validation raises or returns `None`; disables the upload button; calls `panel.set_status("Uploading…", "info")`; dispatches `_do_upload_bg` on a `threading.Thread(daemon=True)`
    - Write `_do_upload_bg(self, file_path, description, project_id)` as the background thread target: instantiates `Uploader` via `uploader_factory`, calls `upload()`, then calls `panel.tk.after(0, lambda: self._on_result(result))` to schedule the UI update on the main thread — every line gets an inline `#` comment
    - Write `_on_result(self, result: UploadResult)` that calls `panel.set_status(result.message, "success" if result.success else "error")` and calls `panel.enable_upload_button()`
    - Wrap `on_upload_click` in a `try/except Exception` catch-all that logs the traceback and calls `panel.set_status("An unexpected error occurred. See the script console for details.", "error")`
    - Add module-level and method docstrings
    - _Requirements: 3.2, 3.4, 4.1, 4.3, 5.1, 5.3, 5.6, 7.1, 7.4, 7.5_

- [ ] 9. Create `ui_panel.py` — tkinter floating window
  - [ ] 9.1 Implement `TkinterPanel` class with all widgets
    - Write `__init__(self) -> None` that creates a `tkinter.Tk` window titled "MixSpace Upload", sets a fixed minimum size, and builds all widgets with inline `#` comments on every line
    - Lay out widgets in this order: project filename `Label`, API URL `Label` (read-only), description `Entry` with a `StringVar` trace capping input at 200 characters, "Upload Version" `Button`, and a status `Label` in a dedicated status area
    - Add a `Frame`-based settings section containing: an editable `Entry` for `api_base_url`, an `Entry` + "Add" `Button` for adding `filename → project_id` mappings, a `Listbox` showing current mappings, and a "Remove" `Button` for the selected mapping
    - Wire the "Upload Version" button to call `self._controller.on_upload_click()` (controller is injected after construction via `set_controller`)
    - Wire settings "Save" / "Add" / "Remove" callbacks to `ConfigManager` methods and persist within 500 ms
    - Implement `refresh_project(self, filename: str)`, `set_status(self, message: str, style: str)`, `enable_upload_button(self)`, `disable_upload_button(self)`, `get_description(self) -> str`, `show(self)`, `destroy(self)`, and `set_controller(self, controller)`
    - In `set_status`, implement the auto-clear timer for "success" style: use `tkinter.after(3000, self._clear_status)` so the message is visible for 3–10 seconds then cleared
    - If no project is open (`filename` is empty), disable the upload button
    - Add module-level and per-method docstrings; every line gets an inline `#` comment
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 5.1, 5.2, 5.3, 5.4, 6.4, 6.6_

- [ ] 10. Create `device_plugin.py` — FL Studio MIDI Script entry point
  - [ ] 10.1 Implement module-level lifecycle callbacks and startup wiring
    - Write the module-level docstring summarising the plugin's purpose, installation steps, and `mixspace_config.json` schema
    - Instantiate `ConfigManager`, `ProjectDetector`, `TkinterPanel`, and `UploadController` at module scope so FL Studio's import sees them immediately
    - Implement `OnInit() -> None` at module level: load config, call `panel.show()`, refresh the displayed project filename if a project is open, display the API URL — every line gets an inline `#` comment; wrap the entire body in `try/except Exception` that logs the traceback and does NOT propagate the exception
    - Implement `OnProjectLoad() -> None` at module level: call `panel.refresh_project(bare_filename)` — wrap in `try/except Exception` per requirement 9.6
    - Implement `OnProjectSave() -> None` at module level: call `panel.refresh_project(bare_filename)` — wrap in `try/except Exception` per requirement 9.6
    - Every line gets an inline `#` comment
    - _Requirements: 1.3, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 7.7_

  - [ ]* 10.2 Write property-based tests for lifecycle callback exception safety
    - Add `tests/test_device_plugin.py`
    - **Property 9: Lifecycle callbacks never propagate exceptions to FL Studio** — use `builds(Exception, text())` to generate arbitrary exception instances; patch the inner collaborator to raise each exception; assert all three callbacks (`OnInit`, `OnProjectLoad`, `OnProjectSave`) return `None` without re-raising. Tag with `# Feature: fl-studio-plugin, Property 9`
    - _Requirements: 7.7, 9.6_

- [ ] 11. Final checkpoint — full plugin wired together
  - Ensure all source files are present (`device_plugin.py`, `ui_panel.py`, `controller.py`, `config_manager.py`, `project_detector.py`, `multipart_builder.py`, `uploader.py`, `exceptions.py`) and all automated tests pass. Ask the user if any questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP; the core implementation tasks are sufficient for a working plugin.
- Every Python source line (excluding blank lines and comment-only lines) MUST carry an inline `#` comment — enforce this during code review of each task.
- No third-party packages are used at runtime; `hypothesis` is a dev-only dependency installed via `pip install hypothesis` in the test environment.
- The plugin folder must be placed in FL Studio's Hardware MIDI Scripts directory for FL Studio to discover it.
- `threading.Thread(daemon=True)` ensures the background upload thread does not prevent FL Studio from exiting cleanly.
- `tkinter.after(0, callback)` is the only safe way to update UI widgets from the background upload thread.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4.1"] },
    { "id": 2, "tasks": ["2.2", "3.2", "4.2"] },
    { "id": 3, "tasks": ["2.3", "3.3", "6.1"] },
    { "id": 4, "tasks": ["6.2", "6.3", "8.1"] },
    { "id": 5, "tasks": ["9.1"] },
    { "id": 6, "tasks": ["10.1"] },
    { "id": 7, "tasks": ["10.2"] }
  ]
}
```
