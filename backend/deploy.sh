#!/bin/bash

# =====================================================
# IQ Test Platform - Backend Deployment Script
# =====================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NODE_VERSION="18.17.0"
POSTGRES_VERSION="14"
REDIS_VERSION="6"
BACKUP_DIR="./backups"
LOG_FILE="./deploy.log"

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root"
    fi
}

# Check system requirements
check_system() {
    log "Checking system requirements..."
    
    # Check OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        log "OS: Linux detected"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        log "OS: macOS detected"
    else
        error "Unsupported operating system: $OSTYPE"
    fi
    
    # Check available memory
    local mem_total=$(free -m | awk 'NR==2{printf "%.0f", $2/1024}')
    if [ "$mem_total" -lt 2 ]; then
        warn "Low memory detected: ${mem_total}GB. Recommended: 4GB+"
    else
        log "Memory: ${mem_total}GB available"
    fi
    
    # Check disk space
    local disk_free=$(df -BG . | awk 'NR==2{print $4}' | sed 's/G//')
    if [ "$disk_free" -lt 10 ]; then
        warn "Low disk space: ${disk_free}GB. Recommended: 20GB+"
    else
        log "Disk space: ${disk_free}GB available"
    fi
}

# Install Node.js
install_nodejs() {
    log "Installing Node.js $NODE_VERSION..."
    
    if command -v node &> /dev/null; then
        local current_version=$(node --version | sed 's/v//')
        log "Node.js already installed: v$current_version"
        
        if [[ "$current_version" == "$NODE_VERSION" ]]; then
            log "Node.js version matches requirement"
            return 0
        else
            warn "Node.js version mismatch. Current: v$current_version, Required: v$NODE_VERSION"
        fi
    fi
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux installation
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
        
        # Install build tools
        sudo apt-get install -y build-essential python3
        
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS installation
        if command -v brew &> /dev/null; then
            brew install node@18
            brew link node@18 --force
        else
            error "Homebrew not found. Please install Homebrew first: https://brew.sh/"
        fi
    fi
    
    # Verify installation
    if command -v node &> /dev/null; then
        local version=$(node --version)
        log "Node.js installed successfully: $version"
    else
        error "Failed to install Node.js"
    fi
    
    # Install npm if not present
    if ! command -v npm &> /dev/null; then
        error "npm not found after Node.js installation"
    fi
}

# Install PostgreSQL
install_postgresql() {
    log "Installing PostgreSQL $POSTGRES_VERSION..."
    
    if command -v psql &> /dev/null; then
        local current_version=$(psql --version | grep -oP '\d+\.\d+' | head -1)
        log "PostgreSQL already installed: $current_version"
        return 0
    fi
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux installation
        sudo apt-get update
        sudo apt-get install -y postgresql postgresql-contrib
        
        # Start and enable PostgreSQL
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
        
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS installation
        if command -v brew &> /dev/null; then
            brew install postgresql@14
            brew services start postgresql@14
        else
            error "Homebrew not found. Please install Homebrew first: https://brew.sh/"
        fi
    fi
    
    # Verify installation
    if command -v psql &> /dev/null; then
        log "PostgreSQL installed successfully"
    else
        error "Failed to install PostgreSQL"
    fi
}

# Install Redis
install_redis() {
    log "Installing Redis $REDIS_VERSION..."
    
    if command -v redis-server &> /dev/null; then
        log "Redis already installed"
        return 0
    fi
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux installation
        sudo apt-get update
        sudo apt-get install -y redis-server
        
        # Start and enable Redis
        sudo systemctl start redis-server
        sudo systemctl enable redis-server
        
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS installation
        if command -v brew &> /dev/null; then
            brew install redis
            brew services start redis
        else
            error "Homebrew not found. Please install Homebrew first: https://brew.sh/"
        fi
    fi
    
    # Verify installation
    if command -v redis-server &> /dev/null; then
        log "Redis installed successfully"
    else
        error "Failed to install Redis"
    fi
}

# Setup PostgreSQL database
setup_database() {
    log "Setting up PostgreSQL database..."
    
    # Create database user
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo -u postgres psql -c "CREATE USER iqtest_user WITH PASSWORD 'iqtest_password';" 2>/dev/null || true
        sudo -u postgres psql -c "ALTER USER iqtest_user CREATEDB;" 2>/dev/null || true
    else
        psql postgres -c "CREATE USER iqtest_user WITH PASSWORD 'iqtest_password';" 2>/dev/null || true
        psql postgres -c "ALTER USER iqtest_user CREATEDB;" 2>/dev/null || true
    fi
    
    # Create database
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo -u postgres createdb iq_test_platform 2>/dev/null || true
        sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE iq_test_platform TO iqtest_user;" 2>/dev/null || true
    else
        createdb iq_test_platform 2>/dev/null || true
        psql -c "GRANT ALL PRIVILEGES ON DATABASE iq_test_platform TO iqtest_user;" 2>/dev/null || true
    fi
    
    log "Database setup completed"
}

# Install project dependencies
install_dependencies() {
    log "Installing project dependencies..."
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        error "package.json not found. Please run this script from the project root directory."
    fi
    
    # Install dependencies
    npm install
    
    log "Dependencies installed successfully"
}

# Setup environment file
setup_environment() {
    log "Setting up environment configuration..."
    
    if [ -f ".env" ]; then
        warn ".env file already exists. Creating backup..."
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    # Create .env file from template
    if [ -f "env.example" ]; then
        cp env.example .env
        log "Environment file created from template"
        
        # Update with local database credentials
        sed -i.bak 's/DB_USER=postgres/DB_USER=iqtest_user/' .env
        sed -i.bak 's/DB_PASSWORD=your_secure_password/DB_PASSWORD=iqtest_password/' .env
        sed -i.bak 's/DB_NAME=iq_test_platform/DB_NAME=iq_test_platform/' .env
        
        # Generate secure JWT secrets
        local jwt_secret=$(openssl rand -hex 32)
        local jwt_refresh_secret=$(openssl rand -hex 32)
        
        sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$jwt_secret/" .env
        sed -i.bak "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$jwt_refresh_secret/" .env
        
        log "Environment file configured with secure credentials"
    else
        error "env.example template not found"
    fi
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p uploads
    mkdir -p backups
    mkdir -p temp
    
    log "Directories created successfully"
}

# Setup database schema
setup_schema() {
    log "Setting up database schema..."
    
    # Check if schema file exists
    if [ ! -f "../database/schema.sql" ]; then
        warn "Database schema file not found. Skipping schema setup."
        return 0
    fi
    
    # Run schema file
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo -u postgres psql -d iq_test_platform -f ../database/schema.sql
    else
        psql -d iq_test_platform -f ../database/schema.sql
    fi
    
    log "Database schema setup completed"
}

# Test connections
test_connections() {
    log "Testing database and Redis connections..."
    
    # Test PostgreSQL
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo -u postgres psql -d iq_test_platform -c "SELECT version();" > /dev/null 2>&1
    else
        psql -d iq_test_platform -c "SELECT version();" > /dev/null 2>&1
    fi
    
    if [ $? -eq 0 ]; then
        log "PostgreSQL connection: SUCCESS"
    else
        error "PostgreSQL connection: FAILED"
    fi
    
    # Test Redis
    redis-cli ping > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        log "Redis connection: SUCCESS"
    else
        error "Redis connection: FAILED"
    fi
}

# Start application
start_application() {
    log "Starting the application..."
    
    # Check if application is already running
    if pgrep -f "node.*server.js" > /dev/null; then
        warn "Application is already running"
        return 0
    fi
    
    # Start in background
    nohup npm start > logs/app.log 2>&1 &
    local pid=$!
    
    # Wait a moment for startup
    sleep 5
    
    # Check if process is running
    if kill -0 $pid 2>/dev/null; then
        log "Application started successfully (PID: $pid)"
        log "Logs available at: logs/app.log"
        log "Application URL: http://localhost:5000"
        log "Health check: http://localhost:5000/health"
    else
        error "Failed to start application"
    fi
}

# Create systemd service (Linux only)
create_service() {
    if [[ "$OSTYPE" != "linux-gnu"* ]]; then
        return 0
    fi
    
    log "Creating systemd service..."
    
    local service_file="/etc/systemd/system/iq-test-backend.service"
    local current_dir=$(pwd)
    
    sudo tee "$service_file" > /dev/null <<EOF
[Unit]
Description=IQ Test Platform Backend
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$current_dir
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=5000

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd and enable service
    sudo systemctl daemon-reload
    sudo systemctl enable iq-test-backend.service
    
    log "Systemd service created and enabled"
    log "Use 'sudo systemctl start iq-test-backend' to start the service"
    log "Use 'sudo systemctl status iq-test-backend' to check status"
}

# Main deployment function
main() {
    log "Starting IQ Test Platform Backend Deployment..."
    log "================================================"
    
    # Check system requirements
    check_root
    check_system
    
    # Install dependencies
    install_nodejs
    install_postgresql
    install_redis
    
    # Setup project
    setup_database
    install_dependencies
    setup_environment
    create_directories
    setup_schema
    
    # Test and start
    test_connections
    start_application
    
    # Create service (Linux only)
    create_service
    
    log "================================================"
    log "Deployment completed successfully!"
    log ""
    log "Next steps:"
    log "1. Access your application at: http://localhost:5000"
    log "2. Check health status: http://localhost:5000/health"
    log "3. View logs: tail -f logs/app.log"
    log "4. For production, update .env with secure credentials"
    log "5. Consider setting up SSL/TLS certificates"
    log ""
    log "Documentation: README.md"
    log "Support: Check logs and README for troubleshooting"
    
    # Save deployment info
    echo "Deployment completed: $(date)" > "$BACKUP_DIR/deployment.log"
}

# Run main function
main "$@" 