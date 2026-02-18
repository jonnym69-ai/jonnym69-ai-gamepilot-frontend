#!/usr/bin/env node

/**
 * GamePilot Isolated Development Script
 * Ensures each app runs on its dedicated port with proper isolation
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const APPS = {
  web: {
    name: 'GamePilot Web',
    port: 3002,
    command: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(__dirname, '../apps/web'),
    color: '\x1b[36m' // Cyan
  },
  api: {
    name: 'GamePilot API', 
    port: 3001,
    command: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(__dirname, '../apps/api'),
    color: '\x1b[32m' // Green
  }
};

// Check if port is in use
function checkPort(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    
    server.on('error', () => resolve(false));
  });
}

// Start an app
function startApp(appKey, app) {
  return new Promise((resolve, reject) => {
    console.log(`${app.color}🚀 Starting ${app.name} on port ${app.port}...\x1b[0m`);
    
    const child = spawn(app.command, app.args, {
      cwd: app.cwd,
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: app.port.toString(),
        FORCE_COLOR: '1'
      }
    });
    
    child.on('error', (error) => {
      console.error(`${app.color}❌ Failed to start ${app.name}:\x1b[0m`, error);
      reject(error);
    });
    
    child.on('close', (code) => {
      if (code !== 0) {
        console.error(`${app.color}❌ ${app.name} exited with code ${code}\x1b[0m`);
      } else {
        console.log(`${app.color}✅ ${app.name} stopped\x1b[0m`);
      }
    });
    
    resolve(child);
  });
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const appToStart = args[0];
  
  console.log('\x1b[35m🎮 GamePilot Development Environment\x1b[0m');
  console.log('=====================================\n');
  
  if (appToStart && APPS[appToStart]) {
    // Start specific app
    try {
      const portAvailable = await checkPort(APPS[appToStart].port);
      if (!portAvailable) {
        console.error(`\x1b[31m❌ Port ${APPS[appToStart].port} is already in use!\x1b[0m`);
        console.error(`Please stop the process using port ${APPS[appToStart].port} and try again.`);
        process.exit(1);
      }
      
      await startApp(appToStart, APPS[appToStart]);
    } catch (error) {
      console.error('\x1b[31m❌ Failed to start app\x1b[0m');
      process.exit(1);
    }
  } else if (appToStart === 'all') {
    // Start all apps
    const portChecks = await Promise.all(
      Object.entries(APPS).map(async ([key, app]) => {
        const available = await checkPort(app.port);
        return { key, available, port: app.port };
      })
    );
    
    const blockedPorts = portChecks.filter(check => !check.available);
    if (blockedPorts.length > 0) {
      console.error('\x1b[31m❌ The following ports are already in use:\x1b[0m');
      blockedPorts.forEach(({ key, port }) => {
        console.error(`  - Port ${port} (${APPS[key].name})`);
      });
      console.error('\nPlease stop these processes and try again.');
      process.exit(1);
    }
    
    // Start all apps
    for (const [key, app] of Object.entries(APPS)) {
      try {
        await startApp(key, app);
        // Small delay between starts
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to start ${app.name}`);
      }
    }
  } else {
    // Show usage
    console.log('Usage: node scripts/dev-isolated.js [app|all]');
    console.log('');
    console.log('Available apps:');
    Object.entries(APPS).forEach(([key, app]) => {
      console.log(`  ${key.padEnd(4)} - ${app.name} (port ${app.port})`);
    });
    console.log('  all   - Start all apps');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/dev-isolated.js web');
    console.log('  node scripts/dev-isolated.js api');
    console.log('  node scripts/dev-isolated.js all');
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\x1b[33m🛑 Shutting down GamePilot development servers...\x1b[0m');
  process.exit(0);
});

main().catch(console.error);
