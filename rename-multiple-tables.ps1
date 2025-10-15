# PowerShell script to rename multiple tables
# Date: 2025-10-15

$rootPath = "C:\Users\polawats\Downloads\ftiprotal\ftiprotal\ftiprotal"

# Define table name mappings (old name => new name)
$tableReplacements = @{
    "business_categories" = "MemberRegist_Business_Categories"
    "documents_Member" = "FTI_Original_Membership_Documents_Member"
    "member_tsic_codes" = "FTI_Original_Membership_Member_Tsic_Codes"
    "member_social_media" = "FTI_Original_Membership_Member_Social_Media"
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Table Rename Script" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

foreach ($oldName in $tableReplacements.Keys) {
    $newName = $tableReplacements[$oldName]
    
    Write-Host "Processing: $oldName => $newName" -ForegroundColor Yellow
    Write-Host "---" -ForegroundColor Gray
    
    # Find all files containing the old table name
    $files = Get-ChildItem -Path $rootPath -Recurse -File -Include *.js,*.sql,*.json,*.md | 
        Where-Object { 
            $_.FullName -notlike "*node_modules*" -and 
            $_.FullName -notlike "*.git*" -and
            (Select-String -Path $_.FullName -Pattern $oldName -Quiet)
        }
    
    $totalFiles = $files.Count
    
    if ($totalFiles -eq 0) {
        Write-Host "  No files found containing '$oldName'" -ForegroundColor Gray
        Write-Host ""
        continue
    }
    
    Write-Host "  Found $totalFiles file(s)" -ForegroundColor Cyan
    
    $totalReplacements = 0
    $counter = 0
    
    foreach ($file in $files) {
        $counter++
        
        try {
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
            $matches = ([regex]::Matches($content, [regex]::Escape($oldName))).Count
            
            if ($matches -gt 0) {
                $newContent = $content -replace [regex]::Escape($oldName), $newName
                Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
                
                $relativePath = $file.FullName.Replace($rootPath, "").TrimStart("\")
                Write-Host "  [$counter/$totalFiles] $relativePath - Replaced $matches time(s)" -ForegroundColor Green
                $totalReplacements += $matches
            }
        }
        catch {
            Write-Host "  Error processing $($file.Name): $_" -ForegroundColor Red
        }
    }
    
    Write-Host "  Total: $totalReplacements replacement(s) in $totalFiles file(s)" -ForegroundColor Green
    Write-Host ""
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  All replacements completed!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review changes: git diff" -ForegroundColor White
Write-Host "2. Run the SQL migration file" -ForegroundColor White
Write-Host "3. Test your application" -ForegroundColor White
Write-Host "4. Commit: git add . && git commit -m 'Rename tables'" -ForegroundColor White
