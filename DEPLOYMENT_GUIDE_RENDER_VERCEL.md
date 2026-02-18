# 🚀 GamePilot Deployment Guide
## Render + Vercel Setup (Updated)

---

## 📋 DEPLOYMENT OVERVIEW

**Frontend**: Vercel (React SPA)  
**Backend**: Render (Node.js API + SQLite)  
**Database**: Built-in Render SQLite (free tier)  
**Timeline**: 10-15 minutes total  
**Cost**: $0 (free tiers)

---

## 🌐 STEP 1: DEPLOY BACKEND TO RENDER

### 1.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Verify email

### 1.2 Create New Web Service
1. Dashboard → "New +" → "Web Service"
2. Connect GitHub repository
3. Select your GamePilot repo

### 1.3 Configure Render Service

**Basic Configuration:**
- **Name**: `gamepilot-api`
- **Root Directory**: `apps/api`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Advanced Configuration:**
- **Instance Type**: `Free` (to start)
- **Health Check Path**: `/api/health`
- **Auto-Deploy**: Yes (on git push)

### 1.4 Environment Variables (Render)
```bash
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
SESSION_SECRET=your-session-secret-change-in-production
```

### 1.5 Deploy
1. Click "Create Web Service"
2. Wait 2-3 minutes for build
3. Get your Render URL: `https://gamepilot-api.onrender.com`

---

## 🌐 STEP 2: DEPLOY FRONTEND TO VERCEL

### 2.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Verify email

### 2.2 Import Project
1. Click "Add New..." → "Project"
2. Select your GitHub repository
3. **Set Root Directory**: `apps/web`

### 2.3 Vercel Configuration
1. **Framework Preset**: Vite
2. **Build Command**: `npm install && npm run build`
3. **Output Directory**: `dist`
4. **Install Command**: `npm install`

### 2.4 Environment Variables (Vercel)
```bash
VITE_API_URL=https://gamepilot-api.onrender.com
VITE_ENABLE_STEAM_INTEGRATION=true
VITE_ENABLE_DISCORD_INTEGRATION=true
VITE_ENABLE_YOUTUBE_INTEGRATION=true
VITE_ENABLE_MOOD_ANALYSIS=true
NODE_ENV=production
```

### 2.5 Deploy
1. Click "Deploy"
2. Wait 1-2 minutes
3. Get your Vercel URL: `https://your-app-name.vercel.app`

---

## 🔧 STEP 3: FINAL CONFIGURATION

### 3.1 Update CORS Settings
In your Render service, add the Vercel URL to environment variables:

```bash
ALLOWED_ORIGINS=https://your-app-name.vercel.app
```

### 3.2 Test Integration
1. Visit your Vercel URL
2. Check browser console for errors
3. Test API calls in Network tab
4. Verify authentication flow

---

## 🚨 RENDER-SPECIFIC NOTES

### Free Tier Limitations:
- **Sleep after 15 minutes** of inactivity
- **Cold start** ~30 seconds on first request
- **750 hours/month** (plenty for development)

### Database:
- **SQLite** works out of the box
- **PostgreSQL** available if you upgrade
- **Auto-backups** on paid plans

### Performance:
- **Good for hobby projects**
- **Upgrade anytime** for better performance
- **Global CDN** with Vercel frontend

---

## 🔄 AUTO-DEPLOY SETUP

### Git Workflow:
```bash
# Push changes → Auto-deploy to both platforms
git add .
git commit -m "Update production"
git push origin main
```

### What Happens:
1. **Render**: Auto-builds and deploys backend
2. **Vercel**: Auto-builds and deploys frontend
3. **Both**: Update within 2-3 minutes

---

## 📊 DEPLOYMENT CHECKLIST

### Render (Backend)
- [ ] Account created
- [ ] Repository connected
- [ ] Environment variables set
- [ ] Build successful
- [ ] Health endpoint responding
- [ ] API accessible

### Vercel (Frontend)
- [ ] Account created
- [ ] Repository imported
- [ ] Environment variables set
- [ ] Build successful
- [ ] Site loading
- [ ] API calls working

### Integration
- [ ] CORS configured
- [ ] API proxy working
- [ ] Authentication flow
- [ ] All features functional

---

## 🎯 SUCCESS METRICS

✅ **Backend**: Render URL responds to `/api/health`  
✅ **Frontend**: Vercel URL loads React app  
✅ **Integration**: Frontend can call backend API  
✅ **Database**: SQLite database operational  
✅ **Authentication**: Login/logout working  

---

## 🔄 POST-DEPLOYMENT

### Monitor Your Apps:
- **Render**: Dashboard shows logs and metrics
- **Vercel**: Analytics and performance data
- **Both**: Set up error monitoring

### Upgrade Options:
- **Render**: $7/month for better performance
- **Vercel**: Pro plan for advanced features
- **Database**: PostgreSQL for production

---

## 🎉 DEPLOYMENT COMPLETE!

Your GamePilot application is now live:
- **Frontend**: `https://your-app-name.vercel.app`
- **Backend**: `https://gamepilot-api.onrender.com`

**Total Cost**: $0/month (free tiers)  
**Total Time**: 10-15 minutes  
**Status**: Production Ready 🚀

---

## 📞 SUPPORT

If you encounter issues:
1. Check Render and Vercel logs
2. Review environment variables
3. Verify CORS configuration
4. Test with the deployment checklist

**Happy deploying!** 🎮
