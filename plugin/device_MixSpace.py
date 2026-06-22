# name=MixSpace
# url=https://github.com/your-repo/mixspace
"""
device_MixSpace.py — FL Studio MIDI Script entry point for the MixSpace plugin.

PURPOSE
-------
Opens the MixSpace web UI in the system default browser when triggered.
No tkinter — uses only FL Studio's built-in scripting modules.

USAGE
-----
Once this script is loaded in FL Studio MIDI Settings, press F12 (or use
the Script output window's Command field) to open MixSpace in the browser.
The plugin also opens the browser automatically on init.

INSTALLATION
------------
Place this file (and ui_panel.py, exceptions.py) in:
  C:\\Program Files\\Image-Line\\FL Studio 2025\\System\\Hardware specific\\MixSpace\\
"""

import traceback     # import traceback for logging errors to the script console


MIXSPACE_WEB_URL = "http://localhost:5173"  # URL of the MixSpace Vite web UI


def _open_mixspace():  # helper function that signals the browser helper via a socket
    """
    Send a TCP connection to the MixSpace helper process on localhost:9876.
    The helper receives it and opens the browser. This is the only method
    that works inside FL Studio 2025's sandboxed Python environment.
    """
    try:  # guard against any socket error
        import socket  # import socket — network calls are allowed in FL Studio's sandbox
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  # create a TCP socket
        s.settimeout(2)  # set a 2 second timeout so we don't hang FL Studio
        s.connect(("127.0.0.1", 9876))  # connect to the helper on localhost port 9876
        s.send(b"open")  # send the trigger signal
        s.close()  # close the socket immediately
        print(f"[MixSpace] Trigger sent to helper.")  # log success
    except Exception as exc:  # catch any socket error
        print(f"[MixSpace] Could not reach helper: {exc}")  # log the error
        print("[MixSpace] Make sure mixspace_helper.py is running.")  # remind user


def OnInit():  # called by FL Studio when the script loads
    """Initialise the MixSpace plugin and open the web UI."""
    try:  # guard so FL Studio never sees an unhandled exception
        print("[MixSpace] Plugin loaded. Opening MixSpace...")  # log to script console
        print(f"[MixSpace] URL: {MIXSPACE_WEB_URL}")  # show the URL being opened
        print("[MixSpace] Send any MIDI note to re-open the browser.")  # usage hint
        _open_mixspace()  # open the browser immediately on load
    except Exception:  # catch any unexpected error
        traceback.print_exc()  # log it to the script console


def OnMidiMsg(event):  # called by FL Studio when any MIDI message arrives on the loopMIDI port
    """Re-open the MixSpace web UI when any MIDI message is received."""
    try:  # guard against unhandled exceptions
        event.handled = True  # mark the event as handled so FL Studio ignores it
        _open_mixspace()  # open the browser on any MIDI trigger
    except Exception:  # catch any unexpected error
        traceback.print_exc()  # log it to the script console


def OnProjectLoad():  # called by FL Studio when a project is opened
    """Log the project load event."""
    try:  # guard against unhandled exceptions
        print("[MixSpace] Project loaded.")  # log to script console
    except Exception:  # catch any error
        traceback.print_exc()  # log it


def OnProjectSave():  # called by FL Studio when the project is saved
    """Log the project save event."""
    try:  # guard against unhandled exceptions
        print("[MixSpace] Project saved.")  # log to script console
    except Exception:  # catch any error
        traceback.print_exc()  # log it
