# PowerShell script to rename verification_tokens table
# Date: 2025-10-15

$rootPath = "C:\Users\polawats\Downloads\ftiprotal\ftiprotal\ftiprotal"
$oldName = "verification_tokens"
$newName = "FTI_Portal_User_Verification_Tokens"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Renaming: $oldName => $newName" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Find all files containing the old table name
$files = Get-ChildItem -Path $rootPath -Recurse -File -Include *.js,*.sql,*.json,*.md,*.ts,*.tsx | 
    Where-Object { 
        $_.FullName -notlike "*node_modules*" -and 
        $_.FullName -notlike "*.git*" -and
        $_.FullName -notlike "*rename-verification-tokens.ps1*" -and
        (Select-String -Path $_.FullName -Pattern "\b$oldName\b" -Quiet)
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
        
        # Use word boundary regex for precise matching
        $pattern = "\b$([regex]::Escape($oldName))\b"
        $matches = ([regex]::Matches($content, $pattern)).Count
        
        if ($matches -gt 0) {
            $newContent = $content -replace $pattern, $newName
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
Write-Host "2. Run SQL: ALTER TABLE verification_tokens RENAME TO FTI_Portal_User_Verification_Tokens;" -ForegroundColor White
Write-Host "3. Test your application" -ForegroundColor White
Write-Host "4. Commit changes" -ForegroundColor White
