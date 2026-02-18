Write-Host "Starting GamePilot Services..."

# Start Ollama server
Write-Host "Starting Ollama AI Server on port 11435..."
Start-Process -FilePath "node.exe" -ArgumentList "run-services.js" -WindowStyle Hidden -NoNewWindow

# Wait for Ollama to start
Start-Sleep -Seconds 3

# Start GamePilot frontend  
Write-Host "Starting GamePilot Frontend on port 3002..."
Start-Process -FilePath "node.exe" -ArgumentList "npm", "run", "dev" -WindowStyle Hidden -NoNewWindow

# Both services running
Write-Host "Both services are now running!"
Write-Host "Ollama API: http://localhost:11435/api/generate"
Write-Host "GamePilot: http://localhost:3002"
Write-Host ""
Write-Host "Press Ctrl+C to stop all services"

# Keep window open
Start-Sleep -Seconds 3600
