"""
device_plugin.py — FL Studio MIDI Script entry point for the MixSpace plugin.

PURPOSE
-------
This file is the module FL Studio imports when you select 'MixSpace' in
Options → MIDI Settings.  It defines the three lifecycle callbacks FL Studio
calls automatically:

  OnInit()        — called once when the script is loaded (FL Studio startup
                    or when you enable the script in MIDI Settings).
  OnProjectLoad() — called each time a project (.flp) is opened.
  OnProjectSave() — called each time the current project is saved.

PHASE 1 BEHAVIOUR
-----------------
On initialisation the plugin opens a small floating tkinter window that shows
the current project filename and an "Open MixSpace" button.  Clicking the
button opens the MixSpace Vite web UI (http://localhost:5173 by default) in
the system default browser.

No upload logic, no config file, no HTTP requests — that is all Phase 2+.

INSTALLATION
------------
1. Locate FL Studio's MIDI Scripts folder:
       %USERPROFILE%\\Documents\\Image-Line\\FL Studio\\Settings\\Hardware
2. Copy the entire MixSpace\\ folder (containing this file and ui_panel.py)
   into that directory.
3. In FL Studio open Options → MIDI Settings, click an empty controller slot,
   and select 'MixSpace' from the script dropdown.
4. Enable the port.  FL Studio will call OnInit() and the panel will appear.

mixspace_config.json schema (used in Phase 2+):
  {
    "api_base_url":      "http://localhost:3000",
    "web_ui_url":        "http://localhost:5173",
    "project_mappings":  { "MyTrack.flp": "supabase-project-id" }
  }
"""

import os           # import os so we can manipulate file paths (basename, exists, etc.)
import traceback    # import traceback so unhandled exceptions are logged to the script console
from typing import Optional  # import Optional for Python 3.9-compatible type hints

from ui_panel import TkinterPanel  # import the floating tkinter window class from our ui module


# ── Module-level singletons ───────────────────────────────────────────────────
# FL Studio imports this module once and calls the callbacks at module scope,
# so we create the panel instance here so all callbacks share the same object.

_panel: Optional[TkinterPanel] = None  # holds the single TkinterPanel instance; None until OnInit runs


def _get_project_filename() -> str:  # helper that safely resolves the bare .flp filename
    """
    Return the bare filename of the currently open FL Studio project.

    Uses FL Studio's 'ui' scripting module (available only inside FL Studio).
    Returns an empty string if no project is open or the scripting API fails.
    """
    try:  # guard against missing 'ui' module when running outside FL Studio
        import ui  # import FL Studio's built-in scripting module (not available on plain Python)
        raw_path = ui.getProjectName()  # ask FL Studio for the full path of the open project
        if not raw_path:  # check whether FL Studio returned an empty or None path
            return ""  # return empty string to indicate no project is currently open
        return os.path.basename(raw_path)  # strip directory components and return only the filename
    except Exception:  # catch ImportError (outside FL Studio) or any FL Studio API error
        return ""  # return empty string so callers handle the no-project case gracefully


# ── FL Studio lifecycle callbacks ─────────────────────────────────────────────


def OnInit() -> None:  # FL Studio calls this once when the MIDI script is first loaded
    """
    Initialise the MixSpace plugin panel.

    Creates the TkinterPanel window, makes it visible, and populates it with
    the current project filename (if any project is already open).
    Never raises an exception — all errors are caught and logged to the console.
    """
    global _panel  # we need to assign to the module-level _panel variable
    try:  # wrap everything so FL Studio is never exposed to an unhandled Python exception
        _panel = TkinterPanel()  # create the floating tkinter window
        _panel.show()  # make the window visible on screen

        filename = _get_project_filename()  # resolve the current project filename (may be empty)
        _panel.refresh_project(filename)  # populate the filename label in the panel

        print("[MixSpace] Plugin initialised.")  # log a confirmation to FL Studio's script console
    except Exception:  # catch any error that occurred during initialisation
        traceback.print_exc()  # print the full stack trace to FL Studio's script output console
        print("[MixSpace] OnInit failed — see traceback above.")  # print a short summary line


def OnProjectLoad() -> None:  # FL Studio calls this every time a project is opened
    """
    Refresh the displayed project filename when a new project is loaded.

    Never raises an exception — all errors are caught and logged to the console.
    """
    global _panel  # reference the module-level panel
    try:  # guard against unhandled exceptions reaching the FL Studio host
        if _panel is None:  # check whether OnInit ran successfully before this callback
            return  # nothing to update if the panel was never created
        filename = _get_project_filename()  # resolve the newly loaded project's bare filename
        _panel.refresh_project(filename)  # update the panel label to show the new filename
        print(f"[MixSpace] Project loaded: {filename!r}")  # log the event to the script console
    except Exception:  # catch any unexpected error
        traceback.print_exc()  # log the full traceback to the script console


def OnProjectSave() -> None:  # FL Studio calls this every time the current project is saved
    """
    Refresh the displayed project filename after the project is saved.

    This handles the case where the user does File → Save As, which changes
    the project filename.  Never raises an exception.
    """
    global _panel  # reference the module-level panel
    try:  # guard against unhandled exceptions reaching the FL Studio host
        if _panel is None:  # check whether the panel exists before trying to update it
            return  # nothing to update if the panel was never created
        filename = _get_project_filename()  # resolve the saved project's bare filename
        _panel.refresh_project(filename)  # update the panel to reflect the (possibly new) filename
        print(f"[MixSpace] Project saved: {filename!r}")  # log the event to the script console
    except Exception:  # catch any unexpected error
        traceback.print_exc()  # log the full traceback to the script console


def OnIdle() -> None:  # FL Studio calls this periodically to let scripts do background work
    """
    Pump the tkinter event loop so the panel stays responsive.

    FL Studio's OnIdle() is called roughly every 10–30 ms.  We use it to
    call panel.update() so tkinter can process button clicks, repaints, and
    the after() timer callbacks (e.g. the success message auto-clear).
    Never raises an exception.
    """
    global _panel  # reference the module-level panel
    try:  # guard against errors if the panel was never created or has been destroyed
        if _panel is not None:  # only update if the panel was successfully created
            _panel.update()  # pump the tkinter event queue to keep the UI responsive
    except Exception:  # catch any error from tkinter (e.g. TclError after window is closed)
        pass  # silently ignore; the audio engine must not be disturbed by UI errors
