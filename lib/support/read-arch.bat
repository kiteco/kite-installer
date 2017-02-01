@echo off
setlocal EnableDelayedExpansion

if exist "%SYSTEMDRIVE%\Program Files (x86)" (
    @echo 64bit
) else (
    @echo 32bit
)
