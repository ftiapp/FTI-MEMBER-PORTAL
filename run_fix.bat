@echo off
echo Fixing FTI_Portal_User_Login_Logs foreign key constraint...
echo.

mysql -h asia-southeast1-001.proxy.kinsta.app -P 30285 -u ermine -p"qZ5[oG2:wK5*zC2[" ftimemberportal < fix_foreign_key.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Foreign key constraint fixed successfully!
) else (
    echo.
    echo ❌ Error occurred while fixing foreign key constraint.
    echo Please check the error message above.
)

echo.
pause
