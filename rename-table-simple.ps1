$oldName = "companies_Member"
$newName = "FTI_Original_Membership"
$rootPath = "C:\Users\polawats\Downloads\ftiprotal\ftiprotal\ftiprotal"

Write-Host "Starting replacement..." -ForegroundColor Green

$files = Get-ChildItem -Path $rootPath -Recurse -File -Include *.js,*.sql,*.json,*.md | 
    Where-Object { 
        $_.FullName -notlike "*node_modules*" -and 
        $_.FullName -notlike "*.git*" -and
        (Select-String -Path $_.FullName -Pattern $oldName -Quiet)
    }

$totalFiles = $files.Count
Write-Host "Found $totalFiles files" -ForegroundColor Cyan

$counter = 0
foreach ($file in $files) {
    $counter++
    Write-Host "[$counter/$totalFiles] $($file.Name)"
    
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        $matches = ([regex]::Matches($content, [regex]::Escape($oldName))).Count
        
        if ($matches -gt 0) {
            $newContent = $content -replace [regex]::Escape($oldName), $newName
            Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
            Write-Host "  Replaced $matches times" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "  Error: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
