@echo off
REM MixSpace FL Studio Plugin Deploy Script
SET DEST=C:\Program Files\Image-Line\FL Studio 2025\System\Hardware specific\MixSpace

echo [MixSpace] Creating plugin folder...
if not exist "%DEST%" mkdir "%DEST%"

echo [MixSpace] Copying plugin files...
copy /Y "%~dp0device_MixSpace.py" "%DEST%"
copy /Y "%~dp0ui_panel.py" "%DEST%"
copy /Y "%~dp0exceptions.py" "%DEST%"
copy /Y "%~dp0mixspace_helper.py" "%DEST%"

echo.
echo [MixSpace] Deploy complete!
echo.
pause
