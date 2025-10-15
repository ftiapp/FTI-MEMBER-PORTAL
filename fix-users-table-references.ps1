# Fix remaining 'users' table references to 'FTI_Portal_User'
# This script specifically targets SQL queries that still reference the old 'users' table name

$rootPath = "C:\Users\polawats\Downloads\ftiprotal\ftiprotal\ftiprotal"

Write-Host "Fixing remaining 'users' table references..." -ForegroundColor Cyan

# Files that need fixing based on grep results
$filesToFix = @(
    "app\api\membership\oc\summary\[id]\route.js",
    "app\api\membership\ic\summary\[id]\route.js",
    "app\api\membership\am\summary\[id]\route.js",
    "app\api\membership\ac\summary\[id]\route.js",
    "app\api\admin\users\[id]\route.js",
    "app\api\admin\membership-requests\[type]\[id]\route.js",
    "app\api\admin\membership-requests\[type]\[id]\reject\route.js"
)

$totalFixed = 0

foreach ($relPath in $filesToFix) {
    $fullPath = Join-Path $rootPath $relPath
    
    if (-not (Test-Path $fullPath)) {
        Write-Host "  Skipping (not found): $relPath" -ForegroundColor Gray
        continue
    }
    
    Write-Host "Processing: $relPath" -ForegroundColor Yellow
    
    try {
        $content = Get-Content -Path $fullPath -Raw -Encoding UTF8
        $originalContent = $content
        
        # Replace SQL patterns with word boundaries
        # FROM users -> FROM FTI_Portal_User
        $content = $content -replace '\bFROM\s+users\b', 'FROM FTI_Portal_User'
        
        # JOIN users -> JOIN FTI_Portal_User  
        $content = $content -replace '\bJOIN\s+users\b', 'JOIN FTI_Portal_User'
        
        # INTO users -> INTO FTI_Portal_User
        $content = $content -replace '\bINTO\s+users\b', 'INTO FTI_Portal_User'
        
        # UPDATE users -> UPDATE FTI_Portal_User
        $content = $content -replace '\bUPDATE\s+users\b', 'UPDATE FTI_Portal_User'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $fullPath -Value $content -Encoding UTF8 -NoNewline
            $changes = ([regex]::Matches($originalContent, '\b(FROM|JOIN|INTO|UPDATE)\s+users\b')).Count
            Write-Host "  Fixed $changes reference(s)" -ForegroundColor Green
            $totalFixed += $changes
        } else {
            Write-Host "  No changes needed" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "  Error: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Completed! Fixed $totalFixed reference(s)" -ForegroundColor Green
