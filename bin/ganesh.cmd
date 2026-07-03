@echo off
rem Runs the one true bash launcher through Git Bash (installed with git).
set "BASH=%ProgramFiles%\Git\bin\bash.exe"
if not exist "%BASH%" set "BASH=%LocalAppData%\Programs\Git\bin\bash.exe"
if not exist "%BASH%" (
  echo A helper program is missing from this computer. Text your helper and say: Git Bash is gone.
  exit /b 1
)
"%BASH%" "%~dp0ganesh" %*
