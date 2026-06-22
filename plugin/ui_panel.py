"""
ui_panel.py — Tkinter floating window for the MixSpace FL Studio plugin.

Phase 1 (current): displays a single "Open MixSpace" button that opens the
MixSpace web UI in the system default browser.  All upload logic will be
added in later phases once the panel scaffold is confirmed working inside
FL Studio.

Installation: place this file in the MixSpace plugin folder alongside
device_plugin.py.  FL Studio's embedded Python must be able to import tkinter
(it is bundled with FL Studio's Python 3 on Windows).

mixspace_config.json schema (used in later phases):
  {
    "api_base_url": "http://localhost:3000",
    "web_ui_url":   "http://localhost:5173",
    "project_mappings": { "MyTrack.flp": "supabase-project-id" }
  }
"""

import tkinter as tk        # import the standard tkinter GUI toolkit
import webbrowser           # import the stdlib module that can open URLs in the browser
import traceback            # import traceback so we can log unexpected errors to the console


# URL of the MixSpace Vite web UI — change this to your deployed URL when in production
MIXSPACE_WEB_URL = "http://localhost:5173"  # default dev server address for the Vite frontend


class TkinterPanel:  # class that owns the floating tkinter window shown alongside FL Studio
    """
    A tkinter Tk window that floats alongside FL Studio.

    Phase 1 responsibilities:
    - Show the currently open FL Studio project filename (or empty when none is open).
    - Provide an "Open MixSpace" button that launches the web UI in the browser.
    - Provide a status label area for future feedback messages.

    Parameters: none (the window is self-contained in this phase).
    """

    def __init__(self) -> None:  # constructor — create the window and all widgets
        """Initialise the tkinter window and lay out all Phase-1 widgets."""

        self._root = tk.Tk()  # create the top-level application window
        self._root.title("MixSpace")  # set the window title bar text
        self._root.resizable(False, False)  # prevent the user from resizing the window
        self._root.minsize(320, 160)  # set a minimum window size so widgets are never clipped

        # ── Project filename row ──────────────────────────────────────────────
        self._project_var = tk.StringVar()  # StringVar that holds the displayed project filename
        self._project_var.set("")  # initialise to empty; will be set by refresh_project()

        project_frame = tk.Frame(self._root, padx=10, pady=6)  # frame that groups the filename row
        project_frame.pack(fill=tk.X)  # stretch the frame horizontally across the window

        tk.Label(  # static label that names the row
            project_frame,  # parent widget
            text="Project:",  # label text
            font=("Helvetica", 9, "bold"),  # slightly bold font to distinguish it from the value
            anchor="w",  # left-align the text inside the label
        ).pack(side=tk.LEFT)  # place the label on the left side of the frame

        tk.Label(  # dynamic label that shows the current project filename
            project_frame,  # parent widget
            textvariable=self._project_var,  # bind to the StringVar so it updates automatically
            font=("Helvetica", 9),  # normal weight for the value
            anchor="w",  # left-align the value text
            fg="#444444",  # dark grey colour for the filename text
        ).pack(side=tk.LEFT, padx=4)  # place it immediately to the right of the "Project:" label

        # ── Open MixSpace button ──────────────────────────────────────────────
        button_frame = tk.Frame(self._root, padx=10, pady=6)  # frame that holds the action button
        button_frame.pack(fill=tk.X)  # stretch to fill the window width

        self._open_btn = tk.Button(  # the primary action button for Phase 1
            button_frame,  # parent widget
            text="Open MixSpace",  # button label text visible to the user
            font=("Helvetica", 10, "bold"),  # bold font makes the primary action stand out
            bg="#4A90D9",  # blue background colour matching the MixSpace brand palette
            fg="white",  # white text for contrast against the blue background
            activebackground="#357ABD",  # darker blue when the button is pressed
            activeforeground="white",  # keep text white when the button is pressed
            relief=tk.FLAT,  # flat style looks more modern than the default raised style
            padx=16,  # horizontal padding inside the button for a comfortable click target
            pady=6,  # vertical padding inside the button
            cursor="hand2",  # change the cursor to a pointer when hovering the button
            command=self._on_open_mixspace,  # call our handler when the button is clicked
        )
        self._open_btn.pack(fill=tk.X)  # stretch the button to fill the frame width

        # ── Status area ───────────────────────────────────────────────────────
        status_frame = tk.Frame(self._root, padx=10, pady=4)  # frame for the status text area
        status_frame.pack(fill=tk.X)  # stretch to fill the window width

        self._status_var = tk.StringVar()  # StringVar that holds the current status message
        self._status_var.set("")  # initialise to empty (idle state)

        self._status_label = tk.Label(  # label that displays status messages to the user
            status_frame,  # parent widget
            textvariable=self._status_var,  # bind to the StringVar for dynamic updates
            font=("Helvetica", 8),  # small font so status text does not dominate the layout
            anchor="w",  # left-align status text
            fg="#555555",  # medium grey for idle/info messages
            wraplength=300,  # wrap long messages at 300 px so the window does not widen
        )
        self._status_label.pack(fill=tk.X)  # stretch the label across the frame

        self._after_id = None  # holds the tkinter.after() handle for the auto-clear timer

    # ── Public interface ──────────────────────────────────────────────────────

    def show(self) -> None:  # make the window visible; called from OnInit in device_plugin.py
        """Make the panel window visible and start the tkinter event loop update cycle."""
        self._root.deiconify()  # un-hide the window if it was previously withdrawn
        self._root.lift()  # bring the window to the front of the Z-order

    def refresh_project(self, filename: str) -> None:  # update the displayed project filename
        """
        Update the project filename label.

        Parameters:
            filename: bare filename (e.g. 'MyTrack.flp') or empty string when no project is open.
        """
        self._project_var.set(filename)  # update the StringVar; tkinter refreshes the label automatically

    def set_status(self, message: str, style: str = "info") -> None:  # display a status message
        """
        Display a message in the status area.

        Parameters:
            message: the text to display.
            style:   'info' (grey), 'success' (green), or 'error' (red).
        """
        if self._after_id is not None:  # cancel any pending auto-clear timer from a previous message
            self._root.after_cancel(self._after_id)  # cancel the scheduled callback
            self._after_id = None  # reset the handle to None

        colour_map = {  # map style names to foreground colours
            "info": "#555555",  # grey for neutral information
            "success": "#2E7D32",  # dark green for successful outcomes
            "error": "#C62828",  # dark red for errors
        }
        fg = colour_map.get(style, "#555555")  # look up the colour; fall back to grey if unknown
        self._status_label.config(fg=fg)  # apply the foreground colour to the status label
        self._status_var.set(message)  # update the displayed text

        if style == "success":  # auto-clear success messages after 5 seconds
            self._after_id = self._root.after(  # schedule the clear callback
                5000,  # 5 000 ms = 5 seconds, within the 3–10 s window required by the spec
                self._clear_status,  # the method to call when the timer fires
            )

    def enable_upload_button(self) -> None:  # re-enable the button after an upload completes
        """Re-enable the Upload button so the user can initiate a new upload."""
        self._open_btn.config(state=tk.NORMAL)  # set button state back to normal/enabled

    def disable_upload_button(self) -> None:  # disable the button during an upload
        """Disable the Upload button to prevent duplicate submissions while uploading."""
        self._open_btn.config(state=tk.DISABLED)  # grey out the button and block clicks

    def get_description(self) -> str:  # retrieve the current description field text (Phase 2+)
        """Return the current text in the version description input field (empty in Phase 1)."""
        return ""  # Phase 1 has no description field; returns empty string as a safe placeholder

    def destroy(self) -> None:  # tear down the window when FL Studio exits
        """Destroy the tkinter window and release all associated resources."""
        try:  # guard against errors during teardown
            self._root.destroy()  # tell tkinter to destroy the window and free its memory
        except Exception:  # catch any tkinter error during destruction
            pass  # silently ignore teardown errors; FL Studio is already closing

    def update(self) -> None:  # pump the tkinter event loop; called periodically from FL Studio
        """Process pending tkinter events to keep the UI responsive."""
        try:  # guard against errors if the window has already been destroyed
            self._root.update()  # process all pending tkinter events (repaints, callbacks, etc.)
        except Exception:  # catch TclError or any other exception from a destroyed window
            pass  # silently ignore; the window may have been closed by the user

    # ── Private helpers ───────────────────────────────────────────────────────

    def _on_open_mixspace(self) -> None:  # handler called when the "Open MixSpace" button is clicked
        """Open the MixSpace web UI in the system default browser."""
        try:  # guard against errors in case the browser cannot be launched
            webbrowser.open(MIXSPACE_WEB_URL)  # ask the OS to open the URL in the default browser
            self.set_status(f"Opened {MIXSPACE_WEB_URL}", "success")  # confirm to the user
        except Exception as exc:  # catch any error from webbrowser.open()
            self.set_status(f"Could not open browser: {exc}", "error")  # show the error in the status area
            traceback.print_exc()  # also log the full traceback to FL Studio's script console

    def _clear_status(self) -> None:  # clear the status area; called by the auto-clear timer
        """Reset the status area to the idle (empty) state after the auto-clear delay."""
        self._status_var.set("")  # clear the displayed text
        self._after_id = None  # reset the timer handle to None
