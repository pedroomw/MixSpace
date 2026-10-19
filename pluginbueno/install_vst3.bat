@echo off
echo Copiando MixSpace.vst3 a VST3 comun...
xcopy /E /I /Y "C:\Users\devandroid\Downloads\MixSpace\pluginbueno\build\MixSpace_artefacts\Release\VST3\MixSpace.vst3" "C:\Program Files\Common Files\VST3\MixSpace.vst3\"
if %ERRORLEVEL% equ 0 (
    echo Plugin instalado correctamente en C:\Program Files\Common Files\VST3\
) else (
    echo Error al copiar. Asegurate de ejecutar como Administrador.
)
pause
