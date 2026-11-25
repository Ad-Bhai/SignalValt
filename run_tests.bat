@echo off
echo Running SignalVault Unit and Integration Tests...
cd /d "%~dp0"
call .\venv\Scripts\activate
set PYTHONPATH=.
pytest -v
