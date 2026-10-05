@echo off
echo Starting ReliefNet Development Environment...
echo.

:: 1. Start PostgreSQL database
echo Starting PostgreSQL database...
if exist "pgsql\pgsql\bin\pg_ctl.exe" (
    "pgsql\pgsql\bin\pg_ctl.exe" -D "pgdata" -l "pgdata\server.log" start
) else (
    echo [WARNING] Local PostgreSQL installation not found at pgsql\pgsql\bin\pg_ctl.exe.
    echo Assuming PostgreSQL is running externally or as a service.
)

:: Wait 2 seconds for DB to initialize
timeout /t 2 /nobreak > nul

:: 2. Start Django Backend Server in a new window
echo Starting Django Backend Server (http://localhost:8000)...
start "ReliefNet Backend" cmd /k "cd backend && ..\venv\Scripts\activate.bat && python manage.py runserver"

:: 3. Start Vite Frontend Server in a new window
echo Starting React/Vite Frontend Server (http://localhost:5173)...
start "ReliefNet Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo All servers launched!
echo - Frontend: http://localhost:5173
echo - Backend API: http://localhost:8000
echo.
pause
