$srcRoot = "C:\Users\devandroid\Downloads\MixSpace\pluginbueno\build\MixSpace_artefacts\Release\VST3\MixSpace.vst3"
$dstRoot = "C:\Program Files\Common Files\VST3\MixSpace.vst3"

Write-Host "Instalando MixSpace VST3..." -ForegroundColor Cyan

# Tomar ownership de todos los archivos destino existentes y dar permisos completos
Write-Host "Tomando ownership de archivos existentes..." -ForegroundColor Yellow
Get-ChildItem $dstRoot -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
    takeown /F $_.FullName /A | Out-Null
    icacls $_.FullName /grant "Administrators:F" /T | Out-Null
}

# Ahora copiar todos los archivos
Write-Host "Copiando archivos..." -ForegroundColor Yellow
Get-ChildItem $srcRoot -Recurse | ForEach-Object {
    $rel    = $_.FullName.Substring($srcRoot.Length)
    $target = $dstRoot + $rel

    if ($_.PSIsContainer) {
        if (!(Test-Path $target)) {
            New-Item -ItemType Directory -Path $target -Force | Out-Null
        }
    } else {
        try {
            Copy-Item -Force $_.FullName $target
            Write-Host "  OK: $rel" -ForegroundColor Green
        } catch {
            Write-Host "  ERROR: $rel — $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
$dll = Get-Item "$dstRoot\Contents\x86_64-win\MixSpace.vst3" -ErrorAction SilentlyContinue
if ($dll) {
    Write-Host "Listo! Fecha: $($dll.LastWriteTime)  Tamaño: $([math]::Round($dll.Length/1KB,1)) KB" -ForegroundColor Green
    if ($dll.LastWriteTime -gt (Get-Date "2026-09-28 09:50:00")) {
        Write-Host "Instalacion correcta - version nueva detectada." -ForegroundColor Green
    } else {
        Write-Host "ADVERTENCIA: la fecha parece la version vieja. Revisa los errores." -ForegroundColor Red
    }
} else {
    Write-Host "No se encontro el archivo destino." -ForegroundColor Red
}

Read-Host "Presiona Enter para cerrar"
