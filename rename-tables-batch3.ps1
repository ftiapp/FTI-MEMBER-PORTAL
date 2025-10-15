# PowerShell script to rename multiple tables - Batch 3
# Date: 2025-10-15

$rootPath = "C:\Users\polawats\Downloads\ftiprotal\ftiprotal\ftiprotal"

# Define table name mappings (old name => new name)
$tableReplacements = @{
    "contact_message_replies" = "FTI_Portal_User_Contact_Message_Replies"
    "contact_message_responses" = "FTI_Portal_User_Contact_Message_Responses"
    "contact_messages" = "FTI_Portal_User_Contact_Messages"
    "company_logos" = "FTI_Original_Membership_Company_Logos"
    "admin_actions_log" = "FTI_Portal_Admin_Actions_Logs"
    "admin_actions_log_backup" = "FTI_Portal_Admin_Actions_Logs_Backup"
    "admin_invitation_tokens" = "FTI_Portal_Admin_Invitation_Tokens"
    "admin_settings" = "FTI_Portal_Admin_Settings"
    "admin_users" = "FTI_Portal_Admin_Users"
    "guest_contact_messages" = "FTI_Portal_Guest_Contact_Messages"
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Table Rename Script - Batch 3" -ForegroundColor Cyan
Write-Host "  Total tables to rename: $($tableReplacements.Count)" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$grandTotalReplacements = 0
$grandTotalFiles = 0

foreach ($oldName in $tableReplacements.Keys) {
    $newName = $tableReplacements[$oldName]
    
    Write-Host "Processing: $oldName => $newName" -ForegroundColor Yellow
    Write-Host "---" -ForegroundColor Gray
    
    # Find all files containing the old table name
    $files = Get-ChildItem -Path $rootPath -Recurse -File -Include *.js,*.sql,*.json,*.md,*.ts,*.tsx | 
        Where-Object { 
            $_.FullName -notlike "*node_modules*" -and 
            $_.FullName -notlike "*.git*" -and
            $_.FullName -notlike "*rename-tables-batch3.ps1*" -and
            (Select-String -Path $_.FullName -Pattern "\b$oldName\b" -Quiet)
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
            
            # Use word boundary regex for more precise matching
            $pattern = "\b$([regex]::Escape($oldName))\b"
            $matches = ([regex]::Matches($content, $pattern)).Count
            
            if ($matches -gt 0) {
                $newContent = $content -replace $pattern, $newName
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
    
    $grandTotalReplacements += $totalReplacements
    $grandTotalFiles += $totalFiles
    
    Write-Host "  Subtotal: $totalReplacements replacement(s) in $totalFiles file(s)" -ForegroundColor Green
    Write-Host ""
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  All replacements completed!" -ForegroundColor Green
Write-Host "  Grand Total: $grandTotalReplacements replacement(s) in $grandTotalFiles file(s)" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review changes: git diff" -ForegroundColor White
Write-Host "2. Run the SQL migration file: migrations\rename_tables_batch3.sql" -ForegroundColor White
Write-Host "3. Test your application thoroughly" -ForegroundColor White
Write-Host "4. Commit changes" -ForegroundColor White
