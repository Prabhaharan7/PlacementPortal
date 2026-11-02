@echo off
echo Starting Placement Portal...

:: Start Django Backend in a new window
start "Django Backend" cmd /k "cd /d %~dp0 && call venv\Scripts\activate && python manage.py runserver"

:: Start React Frontend in a new window
start "React Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
