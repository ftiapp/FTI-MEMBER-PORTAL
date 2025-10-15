# Fix incorrect notification imports
# Change: lib/FTI_Portal_User_Notifications -> lib/notifications

$rootPath = "C:\Users\polawats\Downloads\ftiprotal\ftiprotal\ftiprotal"

Write-Host "Fixing notification import paths..." -ForegroundColor Cyan
Write-Host ""

# Find all files with incorrect import
$files = Get-ChildItem -Path $rootPath -Recurse -File -Include *.js,*.jsx,*.ts,*.tsx | 
    Where-Object { 
        $_.FullName -notlike "*node_modules*" -and 
        $_.FullName -notlike "*.git*" -and
        (Select-String -Path $_.FullName -Pattern "lib/FTI_Portal_User_Notifications" -Quiet)
    }

$totalFiles = $files.Count
Write-Host "Found $totalFiles file(s) with incorrect imports" -ForegroundColor Yellow
Write-Host ""

$totalFixed = 0
$counter = 0

foreach ($file in $files) {
    $counter++
    $relativePath = $file.FullName.Replace($rootPath, "").TrimStart("\")
    
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        $originalContent = $content
        
        # Replace the incorrect import path
        $content = $content -replace 'lib/FTI_Portal_User_Notifications', 'lib/notifications'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
            $changes = ([regex]::Matches($originalContent, 'lib/FTI_Portal_User_Notifications')).Count
            Write-Host "[$counter/$totalFiles] $relativePath - Fixed $changes import(s)" -ForegroundColor Green
            $totalFixed += $changes
        }
    }
    catch {
        Write-Host "[$counter/$totalFiles] Error processing $relativePath : $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Completed! Fixed $totalFixed import(s) in $totalFiles file(s)" -ForegroundColor Green
