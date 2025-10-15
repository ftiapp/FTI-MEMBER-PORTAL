# PowerShell script to rename companies_Member to FTI_Original_Membership
# This will search and replace in all files

$oldName = "companies_Member"
$newName = "FTI_Original_Membership"
$rootPath = "C:\Users\polawats\Downloads\ftiprotal\ftiprotal\ftiprotal"

Write-Host "Starting table name replacement..." -ForegroundColor Green
Write-Host "Old name: $oldName" -ForegroundColor Yellow
Write-Host "New name: $newName" -ForegroundColor Yellow
Write-Host ""

# Get all files that contain the old table name
$files = Get-ChildItem -Path $rootPath -Recurse -File -Include *.js,*.sql,*.json,*.md | 
    Where-Object { 
        $_.FullName -notlike "*node_modules*" -and 
        $_.FullName -notlike "*.git*" -and
        (Select-String -Path $_.FullName -Pattern $oldName -Quiet)
    }

$totalFiles = $files.Count
Write-Host "Found $totalFiles files containing '$oldName'" -ForegroundColor Cyan
Write-Host ""

$counter = 0
foreach ($file in $files) {
    $counter++
    Write-Host "[$counter/$totalFiles] Processing: $($file.FullName)" -ForegroundColor Gray
    
    try {
        # Read file content
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        
        # Count occurrences before replacement
        $matches = ([regex]::Matches($content, [regex]::Escape($oldName))).Count
        
        if ($matches -gt 0) {
            # Replace all occurrences
            $newContent = $content -replace [regex]::Escape($oldName), $newName
            
            # Write back to file
            Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
            
            Write-Host "  ✓ Replaced $matches occurrence(s)" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "  ✗ Error: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Replacement completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review the changes using: git diff" -ForegroundColor White
Write-Host "2. Update your database table name:" -ForegroundColor White
Write-Host "   ALTER TABLE companies_Member RENAME TO FTI_Original_Membership;" -ForegroundColor Cyan
Write-Host "3. Test your application thoroughly" -ForegroundColor White
Write-Host "4. Commit changes" -ForegroundColor White
