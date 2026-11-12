@echo off
title Placement Coach (close this window to stop the app)
cd /d "%~dp0"
node scripts\start-local.mjs
if errorlevel 1 pause
