# Eliminar artefactos de Windows anteriores
Remove-Item -Path "dist\latest.yml", "dist\*.exe", "dist\*.blockmap" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "dist\win-unpacked" -Recurse -Force -ErrorAction SilentlyContinue

npm i
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm i falló. Abortando."
    exit $LASTEXITCODE
}

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm run build falló. No se generó dist."
    exit $LASTEXITCODE
}

# Reemplazar espacios por guiones en los nombres de archivo .exe y .blockmap generados
Get-ChildItem -Path . -Recurse -Include '*.exe', '*.blockmap' | ForEach-Object {
    $newName = $_.Name -replace ' ', '-'
    Rename-Item -Path $_.FullName -NewName $newName
}

# Duplicar el .exe generado y llamarlo StormPanel-App-Setup.exe
if (Test-Path -Path "dist") {
    $exeFile = Get-ChildItem -Path "dist" -Filter "*.exe" | Select-Object -First 1
    if ($exeFile) {
        Copy-Item -Path $exeFile.FullName -Destination (Join-Path $exeFile.DirectoryName "StormPanel-App-Setup.exe") -Force
        Write-Host "Se ha creado una copia: StormPanel-App-Setup.exe"
    }
}
