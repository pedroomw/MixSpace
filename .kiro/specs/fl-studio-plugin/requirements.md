# Requirements Document

## Introduction

This document defines the requirements for a Python-based FL Studio plugin that integrates with the MixSpace version control system. The plugin appears as a panel inside FL Studio and allows music producers to upload the currently open project file (`.flp`) to the MixSpace API with a single button press. It eliminates the manual workflow of opening a browser, navigating to the MixSpace web UI, and filling in metadata fields by hand.

**Scope constraint**: This plugin is a client-side frontend only. The existing MixSpace Node.js/Express API and Supabase backend are not modified in any way. The plugin consumes the API as-is, sending the same multipart form payload (`file`, `description`, `projectID`) that the React web frontend already sends to `POST /files/upload`.

Every Python source file produced for this plugin SHALL include an inline comment on each line of code explaining what that line does, so the codebase is fully self-documented for producers and contributors unfamiliar with Python internals.

The plugin communicates with the existing MixSpace Node.js REST API (`POST /files/upload`) using a multipart form payload containing the `.flp` file, a description, and a project ID — matching the same contract used by the React frontend.

---

## Glossary

- **API_Contract**: The fixed interface of the MixSpace_API — `POST /files/upload` accepting `multipart/form-data` with fields `file`, `description`, and `projectID`. The Plugin SHALL NOT modify this contract.
- **Plugin**: The FL Studio Python Script Panel plugin described by this document.
- **FL_Studio**: The digital audio workstation application hosting the Plugin.
- **Script_Panel**: FL Studio's built-in GUI scripting environment, which renders a Python-driven panel inside FL Studio.
- **MIDI_Script**: FL Studio's Python MIDI scripting layer, used to receive FL Studio lifecycle callbacks (e.g., project load/save events).
- **Project_File**: The `.flp` file representing the currently open FL Studio project.
- **MixSpace_API**: The existing Node.js/Express REST API that receives file uploads at `POST /files/upload`.
- **Upload_Payload**: The multipart/form-data HTTP request body sent to the MixSpace_API, containing the fields `file`, `description`, and `projectID`.
- **Config_File**: A JSON file stored on disk (`mixspace_config.json`) that persists the Plugin's settings between FL Studio sessions.
- **Project_Mapping**: A user-defined association between an FL Studio project filename (or path) and a MixSpace `projectID` string.
- **Version_Description**: A short free-text string entered by the user describing the changes in this version (e.g., "Added bass line", "Final mixdown").
- **Upload_Result**: The JSON response returned by the MixSpace_API after an upload attempt.
- **Uploader**: The internal component responsible for constructing and sending the HTTP request to the MixSpace_API.
- **Config_Manager**: The internal component responsible for reading and writing the Config_File.
- **Project_Detector**: The internal component responsible for resolving the path of the currently open Project_File.

---

## Requirements

### Requirement 10: Code Documentation

**User Story:** As a music producer or contributor, I want every line of the plugin's source code to have an inline comment explaining what it does, so that I can understand and maintain the code without prior Python experience.

#### Acceptance Criteria

1. EVERY line of Python source code in the Plugin (excluding blank lines and lines containing only a comment) SHALL have an inline `#` comment that describes what that specific line does in plain language.
2. THE inline comments SHALL be written in English, be concise (one short sentence or phrase), and describe the purpose of the line rather than restating the syntax (e.g., `# open the config file for reading` rather than `# open file`).
3. THE Plugin's module-level docstring SHALL summarize the plugin's overall purpose, how to install it, and the structure of `mixspace_config.json`.
4. EACH class and function/method in the Plugin SHALL have a docstring that describes its responsibility, parameters, and return value where applicable.

---

### Requirement 1: Script Panel UI

**User Story:** As a music producer, I want a panel inside FL Studio that shows the current project details and an upload button, so that I can version my project without leaving FL Studio.

#### Acceptance Criteria

1. THE Plugin SHALL render a Script_Panel inside FL Studio containing: the detected project filename, a Version_Description text input field (max 200 characters), and an "Upload Version" button.
2. WHEN FL_Studio has no project open, THE Plugin SHALL display the project filename field as empty and disable the "Upload Version" button.
3. WHEN FL_Studio opens, saves, or closes a project, THE Plugin SHALL refresh the displayed project filename to reflect the current Project_File, or clear it to empty if no project is open.
4. WHILE an upload is in progress, THE Plugin SHALL disable the "Upload Version" button to prevent duplicate submissions.
5. WHEN an upload completes (whether successfully or with an error), THE Plugin SHALL re-enable the "Upload Version" button.
6. THE Plugin SHALL display the current API base URL from the Config_File in a read-only field within the Script_Panel; IF the Config_File is absent or the URL is empty, THE Plugin SHALL display "Not configured" in that field.

---

### Requirement 2: Project File Detection

**User Story:** As a music producer, I want the plugin to automatically detect which `.flp` file is open, so that I don't have to manually locate or select the file.

#### Acceptance Criteria

1. WHEN the "Upload Version" button is pressed, THE Project_Detector SHALL resolve the absolute path of the currently open Project_File using the FL Studio scripting API.
2. IF the Project_Detector cannot resolve a valid `.flp` file path (e.g., project is unsaved or the path is empty), THEN THE Plugin SHALL display an error message indicating no saved project was detected and abort the upload, returning the plugin to its idle state.
3. WHEN the absolute path is resolved, THE Project_Detector SHALL verify that the resolved file path ends with the `.flp` extension (case-insensitive); IF it does not, THE Plugin SHALL display an error message indicating an unsupported file type and abort the upload.
4. IF the resolved Project_File does not exist on disk at the time of upload, THEN THE Plugin SHALL display an error message indicating the project file was not found on disk and abort the upload, returning the plugin to its idle state.
5. IF the FL Studio scripting API raises an exception during path resolution, THEN THE Plugin SHALL catch the exception, display an error message indicating the project path could not be determined, and abort the upload.

---

### Requirement 3: Metadata Input and Project Mapping

**User Story:** As a music producer, I want to enter a version description and have the plugin automatically supply the correct MixSpace project ID, so that uploads are attributed to the right project without manual ID lookup.

#### Acceptance Criteria

1. THE Plugin SHALL provide a Version_Description text input field that accepts between 1 and 1000 characters.
2. WHEN the "Upload Version" button is pressed and the Version_Description field is empty, THE Plugin SHALL display an error message stating "Version description is required." and abort the upload.
3. THE Plugin SHALL resolve the `projectID` for the current Project_File by looking up the Project_File's filename (without path) in the active Project_Mapping list stored in the Config_File.
4. IF no Project_Mapping exists for the current Project_File filename, THEN THE Plugin SHALL display an error message stating "No project ID mapped for this project. Please configure a mapping in the settings." and abort the upload.
5. THE Config_Manager SHALL support multiple Project_Mappings, each associating one FL Studio project filename (without path) to one non-empty MixSpace `projectID` string.

---

### Requirement 4: Upload Execution

**User Story:** As a music producer, I want pressing "Upload Version" to send the project file and metadata to MixSpace automatically, so that versioning requires only one action.

#### Acceptance Criteria

1. WHEN the "Upload Version" button is pressed and all validation passes, THE Uploader SHALL construct a multipart/form-data HTTP POST request to `{api_base_url}/files/upload` with the fields `file` (the binary `.flp` content), `description` (the Version_Description), and `projectID` (the resolved project ID).
2. THE Uploader SHALL send the HTTP request using Python's standard `urllib` or `http.client` library, without requiring third-party packages not included in FL Studio's Python environment.
3. THE Uploader SHALL set a total request timeout of 30 seconds; IF the request exceeds this limit, THE Plugin SHALL treat it as a timeout failure and display a timeout error message.
4. WHEN the MixSpace_API responds with HTTP status 201, THE Plugin SHALL display a success message stating "Version uploaded successfully."
5. IF the MixSpace_API responds with HTTP status 400, THEN THE Plugin SHALL display an error message stating "Upload rejected by server: [error field from response body]."
6. IF the MixSpace_API responds with HTTP status 413, THEN THE Plugin SHALL display an error message stating "File too large: the server rejected the upload."
7. IF the MixSpace_API responds with HTTP status 500 or greater, THEN THE Plugin SHALL display an error message stating "Server error. Please try again later."
8. IF the HTTP request fails due to connection refused or a network-level error, THEN THE Plugin SHALL display an error message indicating the MixSpace API could not be reached.

---

### Requirement 5: Upload Status Feedback

**User Story:** As a music producer, I want clear in-panel feedback about the upload state, so that I know whether my version was saved successfully.

#### Acceptance Criteria

1. WHILE an upload is in progress, THE Plugin SHALL display a status message "Uploading…" in the Script_Panel.
2. WHEN an upload completes successfully, THE Plugin SHALL display the success status message for at least 3 seconds and no more than 10 seconds before clearing it; after clearing, the status area SHALL return to its idle (empty) state.
3. WHEN an upload fails for any reason, THE Plugin SHALL display the relevant error message and keep it visible until the user initiates a new upload attempt.
4. THE Plugin SHALL display all status messages in a dedicated status area within the Script_Panel, separate from the form inputs.
5. IF a network connection to the MixSpace_API cannot be established within the timeout period, THEN THE Plugin SHALL display "Could not connect to MixSpace API. Check that the server is running and the API URL is correct."
6. WHEN the user initiates a new upload attempt after a previous failure, THE Plugin SHALL clear the previous error message and display "Uploading…" before the new request is sent.

---

### Requirement 6: Configuration Management

**User Story:** As a music producer, I want to configure the API URL and project ID mappings once, so that the plugin works correctly across different projects and deployment environments.

#### Acceptance Criteria

1. THE Config_Manager SHALL read configuration from a JSON file named `mixspace_config.json` stored in the same directory as the Plugin's Python script.
2. IF the `mixspace_config.json` file does not exist on Plugin startup, THE Config_Manager SHALL create it with the default values: `api_base_url` set to `"http://localhost:3000"` and `project_mappings` set to an empty object.
3. THE Config_File SHALL conform to the following schema: an `api_base_url` string field (non-empty, 1–2048 characters, must use `http` or `https` scheme) and a `project_mappings` object field whose keys are FL Studio project filenames and whose values are non-empty MixSpace `projectID` strings.
4. WHEN the user updates the API URL or a Project_Mapping through the Script_Panel settings section, THE Config_Manager SHALL write the updated Config_File to disk within 500 ms; IF the write fails, THE Plugin SHALL display an error message indicating the configuration could not be saved.
5. IF the `mixspace_config.json` file exists but contains malformed JSON or is missing required fields, THEN THE Config_Manager SHALL log the parse error, discard the file, and recreate it with default values.
6. THE Config_Manager SHALL support adding, editing, and removing Project_Mappings through the Script_Panel without requiring the user to edit the JSON file manually; each CRUD operation SHALL persist to disk within 500 ms.
7. IF a Config_File write operation fails for any reason, THEN THE Plugin SHALL display an error message in the Script_Panel indicating the configuration could not be saved and retain the previous in-memory configuration.

---

### Requirement 7: Error Handling and Resilience

**User Story:** As a music producer, I want the plugin to handle errors gracefully without crashing FL Studio, so that unexpected problems don't interrupt my workflow.

#### Acceptance Criteria

1. IF any unhandled exception occurs inside the Plugin, THEN THE Plugin SHALL catch the exception, log the exception type, message, and stack trace to FL Studio's script output console, display "An unexpected error occurred. See the script console for details." in the Script_Panel, and remain operational for subsequent user interactions.
2. IF the MixSpace_API returns a non-JSON response body, THEN THE Plugin SHALL treat the response as an opaque error and display "Unexpected response from server (status [HTTP status code])." without attempting to parse the body.
3. IF a network-level error occurs with no HTTP status code (e.g., connection refused, DNS failure), THEN THE Plugin SHALL display "Could not reach the MixSpace API. Check your network and the configured API URL." in the status area.
4. WHEN the upload is retried after a failure, THE Plugin SHALL reuse the same Version_Description and resolved project path from the failed attempt until the retry succeeds or the user initiates a new upload session.
5. IF the resolved project path is no longer valid at retry time, THEN THE Plugin SHALL display an error message indicating the project path has changed and prompt the user to re-save the project before retrying.
6. IF the Project_File size exceeds 100 MB, THEN THE Plugin SHALL display "Project file exceeds the 100 MB upload limit." and abort the upload before sending any data to the MixSpace_API.
7. THE Plugin SHALL never terminate the FL Studio process or raise an uncaught exception to the FL Studio host environment.

---

### Requirement 8: Upload Payload Serialization

**User Story:** As a developer, I want the plugin's multipart form construction to be correct and well-tested, so that the MixSpace API always receives a valid request.

#### Acceptance Criteria

1. THE Uploader SHALL construct the multipart/form-data body using a boundary string of 1–70 characters composed exclusively of characters from the RFC 2046 `bchar` set (alphanumeric, `'`, `(`, `)`, `+`, `_`, `,`, `-`, `.`, `/`, `:`, `=`, `?`).
2. THE Uploader SHALL encode the `file` part with `Content-Type: application/octet-stream` and a `Content-Disposition` header that includes the bare filename (no directory path components) as the `filename` parameter.
3. THE Uploader SHALL encode the `description` and `projectID` parts as `Content-Type: text/plain; charset=utf-8` fields with no `filename` parameter in the `Content-Disposition` header.
4. FOR ALL valid combinations of Version_Description (non-empty UTF-8 string, ≤1000 chars) and projectID (non-empty UTF-8 string, ≤100 chars), THE Uploader SHALL produce a multipart body that, when parsed by a standards-compliant multipart parser, yields byte-for-byte identical field values to the original UTF-8-encoded inputs (round-trip property).
5. FOR ALL `.flp` file byte sequences, THE Uploader SHALL include the exact binary content in the `file` part without modification or re-encoding.

---

### Requirement 9: FL Studio Lifecycle Integration

**User Story:** As a music producer, I want the plugin to stay in sync with FL Studio's project lifecycle, so that the displayed project name is always accurate.

#### Acceptance Criteria

1. WHEN FL_Studio fires the `OnProjectLoad` callback, THE Plugin SHALL update the displayed project filename to the newly loaded Project_File's bare filename (without directory path, including file extension).
2. WHEN FL_Studio fires the `OnProjectSave` callback, THE Plugin SHALL unconditionally refresh the displayed project filename to the saved file's bare filename (without directory path, including file extension).
3. WHEN FL_Studio fires the `OnInit` callback at plugin startup AND a project is currently open, THE Plugin SHALL load the Config_File and populate the Script_Panel with the current project's bare filename and the configured API URL.
4. IF FL_Studio fires the `OnInit` callback at plugin startup AND no project is open, THE Plugin SHALL load the Config_File and display an empty filename field and the configured API URL (or "Not configured" if the URL is absent or empty).
5. IF the Config_File cannot be loaded or parsed during `OnInit`, THE Plugin SHALL default the filename field to empty and the API URL field to an empty string without raising an exception.
6. THE Plugin SHALL define `OnInit`, `OnProjectLoad`, and `OnProjectSave` as callables at module level so that FL Studio can invoke them directly; IF any of these callbacks raises an exception, THE Plugin SHALL catch it internally and log it without propagating it to FL Studio.
