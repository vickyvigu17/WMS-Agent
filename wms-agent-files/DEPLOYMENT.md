# WMS Consultant Agent - Deployment Guide

## 🚀 Deployment Options

Choose from multiple deployment methods based on your needs:

### 1. 🐳 **Docker Deployment (Recommended)**

#### Local Docker
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t wms-agent .
docker run -p 5000:5000 wms-agent
```

#### Production Docker
```bash
# Build production image
docker build -t wms-consultant-agent:latest .

# Run with environment variables
docker run -d \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  --name wms-agent \
  wms-consultant-agent:latest
```

**Access:** http://localhost:5000

---

### 2. ☁️ **Cloud Platform Deployment**

#### **Railway (Easiest)**
1. Fork this repository to your GitHub
2. Go to [Railway.app](https://railway.app)
3. Connect your GitHub account
4. Deploy from GitHub repository
5. Railway will automatically detect and use `railway.json`

#### **Render**
1. Fork this repository to your GitHub
2. Go to [Render.com](https://render.com)
3. Create new Web Service from GitHub
4. Use these settings:
   - **Build Command:** `npm run install-all && cd client && npm run build`
   - **Start Command:** `cd server && node server.js`
   - **Environment:** `NODE_ENV=production`

#### **Heroku**
```bash
# Install Heroku CLI, then:
heroku create your-wms-agent-app
heroku config:set NODE_ENV=production
git push heroku main
```

#### **DigitalOcean App Platform**
1. Fork repository to GitHub
2. Create new App in DigitalOcean
3. Connect GitHub repository
4. Use provided configuration

---

### 3. 🖥️ **VPS/Server Deployment**

#### **Ubuntu/Debian Server**
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone your-repo-url wms-agent
cd wms-agent
npm run install-all

# Build frontend
cd client && npm run build
cd ..

# Install PM2 for process management
sudo npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'wms-agent',
    script: 'server/server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### **Nginx Reverse Proxy** (Optional)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### 4. 🔨 **Manual Production Build**

```bash
# Install dependencies
npm run install-all

# Build React frontend
cd client
npm run build
cd ..

# Copy build files to server
cp -r client/build/* server/public/

# Set production environment
export NODE_ENV=production
export PORT=5000

# Start server
cd server
node server.js
```

---

## 🔧 **Environment Configuration**

### Required Environment Variables
```bash
NODE_ENV=production
PORT=5000  # or your preferred port
```

### Optional Environment Variables
```bash
# For enhanced features (optional)
OPENAI_API_KEY=your_openai_key
SERPAPI_KEY=your_serpapi_key
NEWS_API_KEY=your_news_api_key
```

---

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌──────────────────┐
│   React Build   │────│   Express API    │
│  (Static Files) │    │   (Port 5000)    │
└─────────────────┘    └──────────────────┘
                              │
                       ┌──────────────┐
                       │   SQLite DB  │
                       │  (Persistent) │
                       └──────────────┘
```

- **Frontend:** React SPA served as static files
- **Backend:** Express.js API with SQLite database
- **Database:** Persistent SQLite with Docker volumes
- **Port:** Single port (5000) serves both frontend and API

---

## ✅ **Deployment Checklist**

### Pre-Deployment
- [ ] Repository forked/cloned
- [ ] Environment variables configured
- [ ] Dependencies installed locally and tested

### Post-Deployment
- [ ] Health check responds: `GET /api/health`
- [ ] Frontend loads correctly
- [ ] Database initialized with WMS processes
- [ ] Can create clients and projects
- [ ] Question generation works

### Health Check Endpoints
- **Health:** `GET /api/health`
- **Dashboard:** `GET /api/dashboard`
- **WMS Processes:** `GET /api/wms-processes`

---

## 🔍 **Troubleshooting**

### Common Issues

**Build Failures:**
- Ensure Node.js 16+ is installed
- Check for sufficient memory (>2GB recommended)
- Verify all dependencies install successfully

**Database Issues:**
- SQLite file permissions in Docker
- Volume mounting for data persistence
- Check logs: `docker logs container-name`

**Port Conflicts:**
- Change PORT environment variable
- Update Dockerfile EXPOSE directive
- Check firewall settings

**Static File Serving:**
- React build files copied to `server/public/`
- NODE_ENV set to 'production'
- Express static middleware configured

### Logs and Debugging
```bash
# Docker logs
docker logs wms-agent

# PM2 logs
pm2 logs wms-agent

# Direct logs
cd server && NODE_ENV=production node server.js
```

---

## 🚀 **Quick Deploy Commands**

### Railway (Fastest)
```bash
# One-click deploy
# 1. Fork repo → 2. Connect to Railway → 3. Deploy
```

### Docker Local
```bash
docker-compose up -d
# Access: http://localhost:5000
```

### Manual VPS
```bash
git clone repo && cd wms-agent
npm run install-all
cd client && npm run build && cd ..
cd server && NODE_ENV=production node server.js
```

---

## 📊 **Performance & Scaling**

- **Memory:** ~150MB baseline
- **CPU:** Minimal (mostly I/O bound)
- **Storage:** ~50MB + database growth
- **Concurrent Users:** 50-100 (single instance)
- **Scaling:** Add load balancer + multiple instances

---

**🎉 Your WMS Consultant Agent is ready for production!**

Choose your preferred deployment method and start managing WMS implementations efficiently.