@echo off
rem Starts Schritt on http://localhost:8880 and opens it in your browser.
cd /d "%~dp0"
start "" http://localhost:8880/index.html
python serve.py 8880
