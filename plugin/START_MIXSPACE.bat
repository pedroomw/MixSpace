@echo off
REM ═══════════════════════════════════════════════════════
REM  MixSpace — run at Windows login (lives in Startup)
REM  Starts the API backend and the native upload panel.
REM  The panel is hidden until FL Studio is detected.
REM ═══════════════════════════════════════════════════════

SET ROOT=%~dp0..

REM ── 1. Start the API backend ──────────────────────────
echo [MixSpace] Starting API on port 3000...
start "MixSpace API" cmd /c "cd /d "%ROOT%\API" && npm start"

REM ── 2. Launch the panel (hidden until FL Studio opens) ─
echo [MixSpace] Starting MixSpace panel (waiting for FL Studio)...
start "" pythonw "%~dp0mixspace_launcher.py"

echo [MixSpace] Ready. Panel will appear when FL Studio opens.
