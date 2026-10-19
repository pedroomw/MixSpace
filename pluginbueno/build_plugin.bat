@echo off
set CMAKE="C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin\cmake.exe"
set "BUILD_DIR=C:\Users\devandroid\Downloads\MixSpace\pluginbueno\build"
set "SRC_DIR=C:\Users\devandroid\Downloads\MixSpace\pluginbueno"

echo === Limpiando cache CMake ===
if exist "%BUILD_DIR%\CMakeCache.txt" del /q "%BUILD_DIR%\CMakeCache.txt"
if exist "%BUILD_DIR%\CMakeFiles" rmdir /s /q "%BUILD_DIR%\CMakeFiles" 2>nul
if not exist "%BUILD_DIR%" mkdir "%BUILD_DIR%"

echo === Configurando CMake ===
%CMAKE% -S "%SRC_DIR%" -B "%BUILD_DIR%" -G "Visual Studio 17 2022" -A x64
if %ERRORLEVEL% neq 0 ( echo ERROR en configuracion && exit /b 1 )

echo === Compilando Release ===
%CMAKE% --build "%BUILD_DIR%" --config Release
if %ERRORLEVEL% neq 0 ( echo ERROR en compilacion && exit /b 1 )

echo === Buscando VST3 ===
if exist "%BUILD_DIR%\MixSpace_artefacts\Release\VST3\MixSpace.vst3" (
    echo VST3 encontrado!
    echo === Copiando VST3 a VST3 comun ===
    xcopy /E /I /Y "%BUILD_DIR%\MixSpace_artefacts\Release\VST3\MixSpace.vst3" "C:\Program Files\Common Files\VST3\MixSpace.vst3\"
    echo Plugin copiado correctamente
) else (
    echo Buscando en otros paths...
    dir "%BUILD_DIR%\MixSpace_artefacts" /s /b 2>&1
)

echo === BUILD_DONE ===
