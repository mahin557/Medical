@echo off
title MedDx Mobile
echo.
echo  MedDx Mobile
echo ==============
echo.

cd /d "%~dp0mobile"

echo Installing dependencies...
call npm install --silent

echo.
echo Starting Expo (clearing cache)...
echo Scan the QR code with Expo Go on your phone.
echo.
call npx expo start --port 8085 --clear

pause
