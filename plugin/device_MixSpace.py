# name=MixSpace
# url=https://github.com/your-repo/mixspace
"""
device_MixSpace.py — FL Studio MIDI Script for MixSpace.

Writes the currently open project path to a temp file so the
native MixSpace panel (mixspace_launcher.py) can pre-fill the
file path automatically.

FL Studio 2025 sandboxes socket/subprocess/webbrowser/os.startfile
but writing to a file in the plugin folder works fine.
"""

import traceback
import os

# Write project info here — mixspace_launcher.py reads this file
PROJECT_FILE = os.path.join(
    os.environ.get("TEMP", "C:\\Temp"), "mixspace_project.txt"
)


def _write_project_path():
    """Write the current FL project path to the temp file."""
    try:
        import general  # FL Studio built-in module
        path = general.getProjectPath()
        if path:
            with open(PROJECT_FILE, "w") as f:
                f.write(path)
            print(f"[MixSpace] Project path saved: {path}")
        else:
            print("[MixSpace] No project path available yet.")
    except Exception as exc:
        print(f"[MixSpace] Could not write project path: {exc}")


def OnInit():
    """Called when FL Studio loads this script."""
    try:
        print("[MixSpace] Plugin loaded. MixSpace panel should appear shortly.")
        _write_project_path()
    except Exception:
        traceback.print_exc()


def OnProjectLoad():
    """Called when a project is opened — update the path file."""
    try:
        print("[MixSpace] Project loaded.")
        _write_project_path()
    except Exception:
        traceback.print_exc()


def OnProjectSave():
    """Called when a project is saved — update the path file."""
    try:
        print("[MixSpace] Project saved.")
        _write_project_path()
    except Exception:
        traceback.print_exc()


def OnMidiMsg(event):
    """Swallow all MIDI messages so they don't pass through to FL."""
    try:
        event.handled = True
    except Exception:
        traceback.print_exc()
