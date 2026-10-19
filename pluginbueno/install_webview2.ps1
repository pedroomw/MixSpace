Register-PackageSource -provider NuGet -name nugetRepository -location https://www.nuget.org/api/v2 -Force -ErrorAction SilentlyContinue
Install-Package Microsoft.Web.WebView2 -Scope CurrentUser -RequiredVersion 1.0.3485.44 -Source nugetRepository -Force
Write-Host "WebView2 instalado."
