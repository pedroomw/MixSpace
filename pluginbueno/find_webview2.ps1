$pkg = Get-Package Microsoft.Web.WebView2 -ErrorAction SilentlyContinue
if ($pkg) {
    Write-Host "Fuente: $($pkg.Source)"
    Write-Host "Version: $($pkg.Version)"
}
# Buscar en rutas comunes
$paths = @(
    "$env:USERPROFILE\.nuget\packages\microsoft.web.webview2",
    "$env:LOCALAPPDATA\PackageManagement\NuGet\Packages",
    "$env:LOCALAPPDATA\NuGet\Cache"
)
foreach ($p in $paths) {
    if (Test-Path $p) {
        Write-Host "Encontrado en: $p"
        Get-ChildItem $p | Select-Object Name
    }
}
