@echo off

REM Check if node_modules exists
if not exist node_modules (
    echo Installing root dependencies...
    npm install
)

REM Install project dependencies if needed
npm run install:all

REM Start both servers
npm run dev 