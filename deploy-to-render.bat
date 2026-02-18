@echo off
echo 🚀 DEPLOYING GAMEPILOT API TO RENDER...
echo.
echo 1. Go to https://render.com
echo 2. Click "New +" -> "Web Service"
echo 3. Connect GitHub and select: jonnym69-ai/gamepilot-main
echo 4. Configure:
echo    - Name: gamepilot-api
echo    - Root Directory: apps/api
echo    - Runtime: Docker
echo    - Branch: main
echo    - Plan: Free
echo 5. Add Environment Variables:
echo    - NODE_ENV = production
echo    - PORT = 3001
echo    - JWT_SECRET = your-secret-key-here
echo    - CORS_ORIGIN = https://gamepilot-v2.netlify.app
echo 6. Click "Deploy"
echo.
echo ✅ Your API will be live at: https://gamepilot-api.onrender.com
echo.
echo 📋 After deployment, let me know the URL and I'll update the frontend!
echo.
pause
