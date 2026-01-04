@echo off
echo ========================================
echo   ERM Server with PDF Export
echo ========================================
echo.
echo Starting Node.js server with Puppeteer...
echo.

REM Run from parent directory so node_modules is accessible
node server/server.js

pause
