"""
mixspace_helper.py — MixSpace browser helper.

Run this ONCE before opening FL Studio:
    python mixspace_helper.py

It watches for a trigger file written by the FL Studio MIDI script and opens
the MixSpace web UI in the browser when triggered.

The trigger file approach is used because FL Studio 2025 sandboxes its Python
environment and blocks socket, subprocess, os.startfile, and webbrowser calls.
File I/O is the only reliable cross-boundary mechanism.
"""

import os
import time
import webbrowser

MIXSPACE_WEB_URL = "http://localhost:5173"
TRIGGER_FILE = os.path.join(os.environ.get("TEMP", "C:\\Temp"), "mixspace_trigger.txt")
POLL_INTERVAL = 0.5  # seconds between checks

print("[MixSpace Helper] Running. Waiting for FL Studio to trigger...")
print(f"[MixSpace Helper] Watching: {TRIGGER_FILE}")
print("[MixSpace Helper] Press Ctrl+C to stop.\n")

# Remove any leftover trigger file from a previous session
if os.path.exists(TRIGGER_FILE):
    os.remove(TRIGGER_FILE)
    print("[MixSpace Helper] Cleared old trigger file.")

while True:
    try:
        if os.path.exists(TRIGGER_FILE):
            # Read the URL from the trigger file (in case it differs)
            try:
                with open(TRIGGER_FILE, "r") as f:
                    url = f.read().strip() or MIXSPACE_WEB_URL
            except Exception:
                url = MIXSPACE_WEB_URL

            # Delete the trigger file before opening so repeated triggers work
            try:
                os.remove(TRIGGER_FILE)
            except Exception:
                pass

            print(f"[MixSpace Helper] Triggered! Opening: {url}")
            webbrowser.open(url)

        time.sleep(POLL_INTERVAL)

    except KeyboardInterrupt:
        print("\n[MixSpace Helper] Stopped.")
        break
    except Exception as exc:
        print(f"[MixSpace Helper] Error: {exc}")
        time.sleep(1)
