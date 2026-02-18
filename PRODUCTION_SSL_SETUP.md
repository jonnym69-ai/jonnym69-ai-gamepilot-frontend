# GamePilot Production SSL Setup Guide

## 🔒 SSL Certificate Setup

### Option 1: Let's Encrypt (Free, Recommended)
```bash
# Install Certbot
sudo apt update
sudo apt install certbot

# Get SSL certificate for your domain
sudo certbot certonly --standalone -d yourdomain.com

# Certificates will be saved to:
# - Certificate: /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# - Private Key: /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### Option 2: Custom SSL Certificate
If you have a custom SSL certificate from a CA:

```bash
# Place your certificate files in standard locations
sudo mkdir -p /etc/ssl/private
sudo mkdir -p /etc/ssl/certs

# Copy your certificate files
sudo cp yourdomain.crt /etc/ssl/certs/gamepilot.crt
sudo cp yourdomain.key /etc/ssl/private/gamepilot.key
sudo cp ca-bundle.crt /etc/ssl/certs/gamepilot-ca-bundle.crt  # Optional

# Set proper permissions
sudo chmod 600 /etc/ssl/private/gamepilot.key
sudo chown root:root /etc/ssl/private/gamepilot.key
```

### Environment Variables
Update your `.env.production` file:

```env
# HTTPS Configuration
HTTPS_ENABLED=true
SSL_KEY_PATH=/etc/ssl/private/gamepilot.key
SSL_CERT_PATH=/etc/ssl/certs/gamepilot.crt
SSL_CA_BUNDLE_PATH=/etc/ssl/certs/gamepilot-ca-bundle.crt
HTTP_REDIRECT_PORT=80
```

### SSL Certificate Renewal (Let's Encrypt)
```bash
# Test renewal
sudo certbot renew --dry-run

# Set up automatic renewal (runs twice daily)
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Production Security Checklist

### 1. Environment Variables
- [ ] `JWT_SECRET`: Minimum 32 characters, randomly generated
- [ ] `STEAM_API_KEY`: Valid Steam API key from https://steamcommunity.com/dev/apikey
- [ ] `DATABASE_URL`: Production PostgreSQL connection string
- [ ] `ALLOWED_ORIGINS`: Your actual domain(s)

### 2. Database
- [ ] PostgreSQL database created and accessible
- [ ] Database user with proper permissions
- [ ] Connection pooling configured (`DB_POOL_MAX`, `DB_POOL_MIN`)
- [ ] SSL enabled for database connections (`DB_SSL_MODE=require`)

### 3. SSL/HTTPS
- [ ] SSL certificates installed and accessible
- [ ] HTTPS enabled (`HTTPS_ENABLED=true`)
- [ ] HTTP to HTTPS redirect configured (`HTTP_REDIRECT_PORT=80`)
- [ ] Mixed content warnings resolved

### 4. Firewall & Security
- [ ] Only necessary ports open (80, 443 for web, database port for DB)
- [ ] SSH hardened (key-based auth, no root login)
- [ ] Fail2Ban or similar intrusion prevention installed
- [ ] Regular security updates enabled

### 5. Monitoring & Backups
- [ ] Database backups scheduled
- [ ] Log aggregation configured
- [ ] Error monitoring (Sentry) set up
- [ ] Performance monitoring (DataDog) configured

## 🚀 Production Deployment Steps

1. **Set up server infrastructure**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade

   # Install Node.js, PostgreSQL, Nginx
   # Configure firewall, SSL certificates
   ```

2. **Clone and configure application**
   ```bash
   git clone https://github.com/yourorg/gamepilot.git
   cd gamepilot
   cp .env.production.example .env.production
   # Edit .env.production with real values
   ```

3. **Database setup**
   ```bash
   # Create PostgreSQL database and user
   sudo -u postgres createdb gamepilot_prod
   sudo -u postgres createuser gamepilot_user
   # Set permissions and password
   ```

4. **SSL certificate setup** (see above)

5. **Build and deploy**
   ```bash
   npm run build
   npm start
   ```

6. **Configure reverse proxy** (Nginx recommended)
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name yourdomain.com;

       ssl_certificate /etc/ssl/certs/gamepilot.crt;
       ssl_certificate_key /etc/ssl/private/gamepilot.key;

       location / {
           proxy_pass http://localhost:3001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

7. **Test deployment**
   - HTTPS working
   - API endpoints accessible
   - Database connections working
   - Steam integration functional
