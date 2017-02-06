@echo OFF
setlocal EnableDelayedExpansion

reg Query "HKLM\Hardware\Description\System\CentralProcessor\0" | find /i "x86" > NUL && set OS=32BIT || set OS=64BIT

if %OS%==32BIT echo 32bit
if %OS%==64BIT echo 64bit
