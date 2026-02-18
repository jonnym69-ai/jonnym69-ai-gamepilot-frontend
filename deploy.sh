#!/bin/bash

# ===========================================
# GAMEPILOT PRODUCTION DEPLOYMENT SCRIPT
# ===========================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="$PROJECT_ROOT/apps/api"
WEB_DIR="$PROJECT_ROOT/apps/web"
BACKUP_DIR="$PROJECT_ROOT/backups"
LOG_FILE="$PROJECT_ROOT/deploy.log"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    echo -e "${RED}❌ ERROR: $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

# Success message
success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

# Warning message
warning() {
    echo -e "${YELLOW}⚠️ $1${NC}" | tee -a "$LOG_FILE"
}

# Info message
info() {
    echo -e "${BLUE}ℹ️ $1${NC}" | tee -a "$LOG_FILE"
}

# Check if running in production environment
check_production_env() {
    if [ "$NODE_ENV" != "production" ]; then
        error_exit "This script must be run in production environment. Set NODE_ENV=production"
    fi
}

# Create backup directory
create_backup_dir() {
    info "Creating backup directory..."
    mkdir -p "$BACKUP_DIR"
    success "Backup directory created: $BACKUP_DIR"
}

# Backup current deployment
backup_current() {
    info "Creating backup of current deployment..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_name="gamepilot_backup_$timestamp"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    mkdir -p "$backup_path"
    
    # Backup API
    if [ -d "$API_DIR" ]; then
        cp -r "$API_DIR" "$backup_path/api"
        info "API directory backed up"
    fi
    
    # Backup Web
    if [ -d "$WEB_DIR" ]; then
        cp -r "$WEB_DIR" "$backup_path/web"
        info "Web directory backed up"
    fi
    
    # Backup database
    if [ -f "$PROJECT_ROOT/gamepilot.db" ]; then
        cp "$PROJECT_ROOT/gamepilot.db" "$backup_path/"
        info "Database backed up"
    fi
    
    success "Backup created: $backup_path"
}

# Install dependencies
install_dependencies() {
    info "Installing production dependencies..."
    
    # Root level installation handles workspaces correctly
    npm install --production
    success "Dependencies installed via workspaces"
    
    cd "$PROJECT_ROOT"
}

# Build applications
build_applications() {
    info "Building applications for production..."
    
    # Use workspace build commands from root
    npm run build:api
    success "API built successfully"
    
    npm run build:web
    success "Web built successfully"
    
    cd "$PROJECT_ROOT"
}

# Run database migrations
run_migrations() {
    info "Running database migrations..."
    
    cd "$API_DIR"
    npm run migrate:prod
    success "Database migrations completed"
    
    cd "$PROJECT_ROOT"
}

# Health check
health_check() {
    info "Performing health checks..."
    
    # Check API health
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        success "API health check passed"
    else
        error_exit "API health check failed"
    fi
    
    # Check Web health
    if curl -f http://localhost:3002 > /dev/null 2>&1; then
        success "Web health check passed"
    else
        warning "Web health check failed (may be starting up)"
    fi
}

# Restart services
restart_services() {
    info "Restarting production services..."
    
    # Stop existing services
    pkill -f "npm run" || true
    sleep 2
    
    # Start API server
    cd "$API_DIR"
    NODE_ENV=production npm run start:prod > "$PROJECT_ROOT/api.log" 2>&1 &
    API_PID=$!
    info "API server started (PID: $API_PID)"
    
    # Start Web server
    cd "$WEB_DIR"
    NODE_ENV=production npm run start:prod > "$PROJECT_ROOT/web.log" 2>&1 &
    WEB_PID=$!
    info "Web server started (PID: $WEB_PID)"
    
    cd "$PROJECT_ROOT"
    
    # Save PIDs for later
    echo "$API_PID" > "$PROJECT_ROOT/api.pid"
    echo "$WEB_PID" > "$PROJECT_ROOT/web.pid"
    
    success "Services restarted successfully"
}

# Cleanup old processes
cleanup() {
    info "Cleaning up old processes..."
    
    # Kill processes by PID if they exist
    if [ -f "$PROJECT_ROOT/api.pid" ]; then
        local api_pid=$(cat "$PROJECT_ROOT/api.pid")
        if kill -0 "$api_pid" 2>/dev/null; then
            kill "$api_pid"
            info "Stopped API server (PID: $api_pid)"
        fi
        rm "$PROJECT_ROOT/api.pid"
    fi
    
    if [ -f "$PROJECT_ROOT/web.pid" ]; then
        local web_pid=$(cat "$PROJECT_ROOT/web.pid")
        if kill -0 "$web_pid" 2>/dev/null; then
            kill "$web_pid"
            info "Stopped Web server (PID: $web_pid)"
        fi
        rm "$PROJECT_ROOT/web.pid"
    fi
    
    # Kill any remaining node processes
    pkill -f "node.*gamepilot" || true
    
    success "Cleanup completed"
}

# Main deployment function
deploy() {
    log "🚀 Starting GamePilot Production Deployment"
    log "=========================================="
    
    check_production_env
    create_backup_dir
    backup_current
    cleanup
    install_dependencies
    build_applications
    run_migrations
    restart_services
    
    # Wait for services to start
    info "Waiting for services to start..."
    sleep 10
    
    health_check
    
    log "=========================================="
    success "🎮 GamePilot Production Deployment Completed Successfully!"
    log "🌐 API Server: http://localhost:3001"
    log "🌐 Web Server: http://localhost:3002"
    log "📊 Logs: $PROJECT_ROOT/api.log, $PROJECT_ROOT/web.log"
}

# Rollback function
rollback() {
    local backup_name=$1
    
    if [ -z "$backup_name" ]; then
        error_exit "Usage: $0 rollback <backup_name>"
    fi
    
    local backup_path="$BACKUP_DIR/$backup_name"
    
    if [ ! -d "$backup_path" ]; then
        error_exit "Backup not found: $backup_path"
    fi
    
    log "🔄 Rolling back to backup: $backup_name"
    
    cleanup
    
    # Restore from backup
    if [ -d "$backup_path/api" ]; then
        rm -rf "$API_DIR"
        cp -r "$backup_path/api" "$API_DIR"
        info "API restored from backup"
    fi
    
    if [ -d "$backup_path/web" ]; then
        rm -rf "$WEB_DIR"
        cp -r "$backup_path/web" "$WEB_DIR"
        info "Web restored from backup"
    fi
    
    if [ -f "$backup_path/gamepilot.db" ]; then
        cp "$backup_path/gamepilot.db" "$PROJECT_ROOT/"
        info "Database restored from backup"
    fi
    
    restart_services
    
    sleep 10
    health_check
    
    success "Rollback completed successfully"
}

# List available backups
list_backups() {
    info "Available backups:"
    ls -la "$BACKUP_DIR" | grep "gamepilot_backup_" | awk '{print $9}' | sort -r
}

# Show deployment status
status() {
    info "GamePilot Deployment Status"
    info "========================="
    
    # Check if services are running
    if [ -f "$PROJECT_ROOT/api.pid" ]; then
        local api_pid=$(cat "$PROJECT_ROOT/api.pid")
        if kill -0 "$api_pid" 2>/dev/null; then
            success "API Server: Running (PID: $api_pid)"
        else
            warning "API Server: Not running"
        fi
    else
        warning "API Server: Not running"
    fi
    
    if [ -f "$PROJECT_ROOT/web.pid" ]; then
        local web_pid=$(cat "$PROJECT_ROOT/web.pid")
        if kill -0 "$web_pid" 2>/dev/null; then
            success "Web Server: Running (PID: $web_pid)"
        else
            warning "Web Server: Not running"
        fi
    else
        warning "Web Server: Not running"
    fi
    
    # Show recent logs
    info "Recent API Logs:"
    tail -10 "$PROJECT_ROOT/api.log" 2>/dev/null || echo "No API logs found"
    
    info "Recent Web Logs:"
    tail -10 "$PROJECT_ROOT/web.log" 2>/dev/null || echo "No web logs found"
}

# Main script logic
case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    rollback)
        rollback "$2"
        ;;
    list)
        list_backups
        ;;
    status)
        status
        ;;
    cleanup)
        cleanup
        ;;
    health)
        health_check
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|list|status|cleanup|health}"
        echo "  deploy  - Deploy to production"
        echo "  rollback <backup> - Rollback to specified backup"
        echo "  list    - List available backups"
        echo "  status  - Show deployment status"
        echo "  cleanup - Stop all services"
        echo "  health  - Run health checks"
        exit 1
        ;;
esac
