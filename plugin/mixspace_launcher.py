"""
mixspace_launcher.py — MixSpace native upload panel.

HOW IT WORKS:
  - Polls for the FL Studio process in the background.
  - When FL Studio opens  → the upload panel appears.
  - When FL Studio closes → the panel hides itself.
  - The MIDI script (device_MixSpace.py) writes the current project path
    to a temp file; this launcher reads it and pre-fills the filename.
  - Upload goes directly to the local API (localhost:3000) using only
    Python stdlib — no pip packages needed for the upload itself.

DEPENDENCIES (stdlib only for core, tkinter bundled with Python):
  - tkinter  (bundled with Python on Windows)
  - urllib   (stdlib)
  - json     (stdlib)
  - os, sys, threading, time, pathlib (stdlib)

Run once at Windows login via START_MIXSPACE.bat / Startup shortcut.
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import threading
import time
import os
import sys
import json
import urllib.request
import urllib.error
import pathlib

# ── Config ────────────────────────────────────────────────────────────────────
API_URL       = "http://localhost:3000/versions/upload"
PROJECT_FILE  = os.path.join(os.environ.get("TEMP", "C:\\Temp"), "mixspace_project.txt")
POLL_INTERVAL = 2          # seconds between FL Studio process checks
FL_EXE_NAME   = "FL64.exe" # FL Studio 2025 64-bit process name

# ── FL Studio process detection ───────────────────────────────────────────────
def is_fl_running():
    """Return True if FL Studio is currently running."""
    try:
        import subprocess
        out = subprocess.check_output(
            ["tasklist", "/FI", f"IMAGENAME eq {FL_EXE_NAME}", "/NH"],
            stderr=subprocess.DEVNULL
        ).decode(errors="ignore")
        return FL_EXE_NAME.lower() in out.lower()
    except Exception:
        return False


# ── Multipart upload using stdlib only ───────────────────────────────────────
def upload_file(filepath, description, project_id, on_progress=None):
    """
    POST the .flp file to the API as multipart/form-data.
    Returns (True, response_text) on success or (False, error_message).
    """
    boundary = "----MixSpaceBoundary7MA4YWxkTrZu0gW"
    CRLF = b"\r\n"

    def field(name, value):
        return (
            f'--{boundary}'.encode() + CRLF +
            f'Content-Disposition: form-data; name="{name}"'.encode() + CRLF +
            CRLF +
            value.encode() + CRLF
        )

    filename = os.path.basename(filepath)
    with open(filepath, "rb") as f:
        file_data = f.read()

    body = (
        field("description", description) +
        field("project_id", project_id) +
        f'--{boundary}'.encode() + CRLF +
        f'Content-Disposition: form-data; name="file"; filename="{filename}"'.encode() + CRLF +
        b'Content-Type: application/octet-stream' + CRLF +
        CRLF +
        file_data + CRLF +
        f'--{boundary}--'.encode() + CRLF
    )

    req = urllib.request.Request(
        API_URL,
        data=body,
        method="POST",
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return True, resp.read().decode()
    except urllib.error.HTTPError as e:
        return False, f"Server error {e.code}: {e.read().decode()}"
    except urllib.error.URLError as e:
        return False, f"Could not reach API: {e.reason}"
    except Exception as e:
        return False, str(e)


# ── Main UI ───────────────────────────────────────────────────────────────────
class MixSpacePanel:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("MixSpace — Upload FL Project")
        self.root.resizable(False, False)
        self.root.attributes("-topmost", True)
        self.root.protocol("WM_DELETE_WINDOW", self._on_close)

        # Center on screen
        w, h = 420, 360
        sw = self.root.winfo_screenwidth()
        sh = self.root.winfo_screenheight()
        self.root.geometry(f"{w}x{h}+{(sw-w)//2}+{(sh-h)//2}")

        self._build_ui()
        self._visible = False
        self.root.withdraw()   # hidden until FL Studio detected

        # Background thread that watches for FL Studio
        self._watcher = threading.Thread(target=self._watch_fl, daemon=True)
        self._watcher.start()

    # ── UI construction ───────────────────────────────────────────────────────
    def _build_ui(self):
        BG      = "#1e1e2e"
        CARD    = "#2a2a3e"
        PURPLE  = "#7C3AED"
        PURPLE2 = "#6D28D9"
        TEXT    = "#e0e0e0"
        MUTED   = "#888888"

        self.root.configure(bg=BG)

        # Header
        hdr = tk.Frame(self.root, bg=PURPLE, height=48)
        hdr.pack(fill=tk.X)
        tk.Label(hdr, text="🎛  MixSpace", font=("Segoe UI", 13, "bold"),
                 bg=PURPLE, fg="white", pady=10).pack(side=tk.LEFT, padx=16)

        # Body
        body = tk.Frame(self.root, bg=BG, padx=20, pady=16)
        body.pack(fill=tk.BOTH, expand=True)

        def label(parent, text):
            return tk.Label(parent, text=text, font=("Segoe UI", 9),
                            bg=BG, fg=MUTED, anchor="w")

        def entry(parent, textvariable, **kw):
            e = tk.Entry(parent, textvariable=textvariable,
                         font=("Segoe UI", 10), bg=CARD, fg=TEXT,
                         insertbackground=TEXT, relief=tk.FLAT,
                         highlightthickness=1, highlightbackground="#444",
                         highlightcolor=PURPLE, **kw)
            return e

        # FL Project file row
        label(body, "FL Project File (.flp)").pack(fill=tk.X)
        file_row = tk.Frame(body, bg=BG)
        file_row.pack(fill=tk.X, pady=(2, 10))

        self._file_var = tk.StringVar()
        entry(file_row, self._file_var, state="readonly").pack(
            side=tk.LEFT, fill=tk.X, expand=True, ipady=5)
        tk.Button(file_row, text="Browse", font=("Segoe UI", 9),
                  bg=CARD, fg=TEXT, relief=tk.FLAT, cursor="hand2",
                  activebackground=PURPLE, activeforeground="white",
                  command=self._browse_file, padx=8).pack(side=tk.LEFT, padx=(6, 0))

        # Description
        label(body, "Description").pack(fill=tk.X)
        self._desc_var = tk.StringVar()
        entry(body, self._desc_var).pack(fill=tk.X, ipady=5, pady=(2, 10))

        # Project ID
        label(body, "Project ID").pack(fill=tk.X)
        self._pid_var = tk.StringVar()
        entry(body, self._pid_var).pack(fill=tk.X, ipady=5, pady=(2, 10))

        # Upload button
        self._upload_btn = tk.Button(
            body, text="⬆  Upload Version",
            font=("Segoe UI", 11, "bold"),
            bg=PURPLE, fg="white", relief=tk.FLAT, cursor="hand2",
            activebackground=PURPLE2, activeforeground="white",
            pady=8, command=self._start_upload
        )
        self._upload_btn.pack(fill=tk.X, pady=(4, 0))

        # Status
        self._status_var = tk.StringVar(value="")
        self._status_lbl = tk.Label(
            body, textvariable=self._status_var,
            font=("Segoe UI", 9), bg=BG, fg=MUTED,
            wraplength=380, justify="left"
        )
        self._status_lbl.pack(fill=tk.X, pady=(8, 0))

    # ── File browser ──────────────────────────────────────────────────────────
    def _browse_file(self):
        path = filedialog.askopenfilename(
            title="Select FL Studio Project",
            filetypes=[("FL Studio Project", "*.flp"), ("All files", "*.*")]
        )
        if path:
            self._file_var.set(path)

    # ── Upload ────────────────────────────────────────────────────────────────
    def _start_upload(self):
        filepath    = self._file_var.get().strip()
        description = self._desc_var.get().strip()
        project_id  = self._pid_var.get().strip()

        if not filepath:
            self._set_status("Please select a .flp file.", "error"); return
        if not os.path.exists(filepath):
            self._set_status("File not found.", "error"); return
        if not description:
            self._set_status("Description is required.", "error"); return
        if not project_id:
            self._set_status("Project ID is required.", "error"); return

        self._upload_btn.config(state=tk.DISABLED)
        self._set_status("Uploading...", "info")

        def run():
            ok, msg = upload_file(filepath, description, project_id)
            self.root.after(0, lambda: self._on_upload_done(ok, msg))

        threading.Thread(target=run, daemon=True).start()

    def _on_upload_done(self, ok, msg):
        self._upload_btn.config(state=tk.NORMAL)
        if ok:
            self._set_status("✅ Upload successful!", "success")
            self._desc_var.set("")
        else:
            self._set_status(f"❌ {msg}", "error")

    def _set_status(self, msg, style="info"):
        colors = {"info": "#888888", "success": "#4ade80", "error": "#f87171"}
        self._status_lbl.config(fg=colors.get(style, "#888888"))
        self._status_var.set(msg)

    # ── FL Studio watcher ─────────────────────────────────────────────────────
    def _watch_fl(self):
        was_running = False
        while True:
            running = is_fl_running()
            if running and not was_running:
                # FL just opened — show panel and try to pre-fill project path
                self.root.after(0, self._on_fl_open)
            elif not running and was_running:
                # FL just closed — hide panel
                self.root.after(0, self._on_fl_close)
            was_running = running
            time.sleep(POLL_INTERVAL)

    def _on_fl_open(self):
        # Try to read project path written by the MIDI script
        if os.path.exists(PROJECT_FILE):
            try:
                path = open(PROJECT_FILE).read().strip()
                if path and os.path.exists(path):
                    self._file_var.set(path)
            except Exception:
                pass
        self._set_status("FL Studio detected. Ready to upload.", "info")
        self.root.deiconify()
        self.root.lift()
        self._visible = True

    def _on_fl_close(self):
        self.root.withdraw()
        self._visible = False

    def _on_close(self):
        # User closed the window manually — just hide it, don't quit
        self.root.withdraw()
        self._visible = False

    # ── Run ───────────────────────────────────────────────────────────────────
    def run(self):
        self.root.mainloop()


if __name__ == "__main__":
    MixSpacePanel().run()
