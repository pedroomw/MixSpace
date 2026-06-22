"""
mixspace_helper.py — MixSpace browser helper process.

Run this script ONCE before opening FL Studio:
    python mixspace_helper.py

It watches for a trigger file written by the FL Studio MIDI script and opens
the MixSpace web UI in the browser when triggered. Keep it running in the
background while using FL Studio.
"""

import os           # import os for file path operations
import time         # import time for the polling sleep interval
import webbrowser   # import webbrowser to open the URL in the default browser
import socket       # import socket to listen for connections from FL Studio

MIXSPACE_WEB_URL = "http://localhost:5173"  # URL to open when triggered
PORT = 9876  # port the helper listens on for FL Studio connections

print("[MixSpace Helper] Running. Waiting for FL Studio to trigger...")  # startup message
print(f"[MixSpace Helper] Listening on port {PORT}")  # show the port being watched
print("[MixSpace Helper] Press Ctrl+C to stop.\n")  # exit instruction

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  # create a TCP server socket
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)  # allow reuse of the port
server.bind(("127.0.0.1", PORT))  # bind to localhost on our port
server.listen(5)  # listen for incoming connections
server.settimeout(1.0)  # timeout so we can check for KeyboardInterrupt regularly

while True:  # loop forever until the user presses Ctrl+C
    try:  # guard against any unexpected error in the loop
        try:  # try to accept a connection with timeout
            conn, addr = server.accept()  # wait for a connection from FL Studio
            conn.close()  # close the connection immediately — we just need the signal
            print(f"[MixSpace Helper] Triggered! Opening: {MIXSPACE_WEB_URL}")  # log the action
            webbrowser.open(MIXSPACE_WEB_URL)  # open the URL in the default browser
        except socket.timeout:  # timeout means no connection yet — just loop again
            pass  # nothing to do, keep waiting
    except KeyboardInterrupt:  # catch Ctrl+C to exit cleanly
        print("\n[MixSpace Helper] Stopped.")  # print exit message
        server.close()  # close the server socket
        break  # exit the loop
    except Exception as exc:  # catch any other unexpected error
        print(f"[MixSpace Helper] Error: {exc}")  # log it
        time.sleep(1)  # wait a second before retrying
