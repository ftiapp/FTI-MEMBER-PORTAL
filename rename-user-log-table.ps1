# Fix Member_portal_User_log table name
# Change: Member_portal_User_log -> FTI_Portal_User_Activity_Logs

$rootPath = "C:\Users\polawats\Downloads\ftiprotal\ftiprotal\ftiprotal"
$oldName = "Member_portal_User_log"
$newName = "FTI_Portal_User_Logs"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Renaming: $oldName => $newName" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Find all files containing the old table name
$files = Get-ChildItem -Path $rootPath -Recurse -File -Include *.js,*.sql,*.json,*.md,*.ts,*.tsx | 
    Where-Object { 
        $_.FullName -notlike "*node_modules*" -and 
        $_.FullName -notlike "*.git*" -and
        (Select-String -Path $_.FullName -Pattern $oldName -Quiet)
    }

$totalFiles = $files.Count

if ($totalFiles -eq 0) {
    Write-Host "No files found containing '$oldName'" -ForegroundColor Gray
    exit
}

Write-Host "Found $totalFiles file(s)" -ForegroundColor Cyan
Write-Host ""

$totalReplacements = 0
$counter = 0

foreach ($file in $files) {
    $counter++
    
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        
        # Count occurrences
        $matches = ([regex]::Matches($content, [regex]::Escape($oldName))).Count
        
        if ($matches -gt 0) {
            $newContent = $content -replace [regex]::Escape($oldName), $newName
            Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
            
            $relativePath = $file.FullName.Replace($rootPath, "").TrimStart("\")
            Write-Host "[$counter/$totalFiles] $relativePath - Replaced $matches time(s)" -ForegroundColor Green
            $totalReplacements += $matches
        }
    }
    catch {
        Write-Host "Error processing $($file.Name): $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Completed!" -ForegroundColor Green
Write-Host "  Total: $totalReplacements replacement(s) in $totalFiles file(s)" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review changes: git diff" -ForegroundColor White
Write-Host "2. Run SQL: ALTER TABLE Member_portal_User_log RENAME TO FTI_Portal_User_Logs;" -ForegroundColor White
Write-Host "3. Test your application" -ForegroundColor White
Write-Host "4. Commit changes" -ForegroundColor White
