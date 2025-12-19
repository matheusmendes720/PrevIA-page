@echo off
REM Script to run active testing builds in Docker
REM Usage: scripts\docker-testing-build.bat [mode]
REM Modes: watch, 5g, 5g:watch, validation, dev, all

setlocal

set MODE=%1
if "%MODE%"=="" set MODE=watch

cd /d "%~dp0\.."

echo 🧪 Starting Active Testing Build...
echo 📦 Test Mode: %MODE%
echo 📁 Working Directory: %CD%
echo.

REM Export TEST_MODE for docker-compose
set TEST_MODE=%MODE%

REM Run docker-compose with testing configuration
docker-compose -f docker-compose.testing.yml up --build

endlocal

























