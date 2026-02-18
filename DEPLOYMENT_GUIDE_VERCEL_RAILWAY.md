# 🚀 GamePilot Deployment Guide
## Vercel + Railway Setup

---

## 📋 DEPLOYMENT OVERVIEW

**Frontend**: Vercel (React SPA)  
**Backend**: Railway (Node.js API + SQLite)  
**Database**: Built-in Railway SQLite  
**Timeline**: 10-15 minutes total

---

## 🌐 STEP 1: DEPLOY BACKEND TO RAILWAY

### 1.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub/GitLab
3. Verify email

### 1.2 Create New Project
1. Click "New Project" → "Deploy from GitHub repo"
2. **OR** click "New Project" → "Empty Project"

### 1.3 Configure Railway Project

**Option A: From GitHub (Recommended)**
```bash
# Push your code to GitHub first
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

**Option B: Manual Upload**
1. Click "New Project" → "Empty Project"
2. Upload your project files

### 1.4 Railway Configuration
1. **Set Root Directory**: `apps/api`
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm start`
4. **Port**: `3001`

### 1.5 Environment Variables (Railway)
```bash
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
SESSION_SECRET=your-session-secret-change-in-production
```

### 1.6 Deploy
1. Click "Deploy" 
2. Wait 2-3 minutes
3. Get your Railway URL: `https://your-app-name.up.railway.app`

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
VITE_API_URL=https://your-railway-app.up.railway.app
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
In your Railway project, add the Vercel URL to allowed origins:

```bash
ALLOWED_ORIGINS=https://your-app-name.vercel.app
```

### 3.2 Test Integration
1. Visit your Vercel URL
2. Check browser console for errors
3. Test API calls in Network tab
4. Verify authentication flow

---

## 🚨 TROUBLESHOOTING

### Common Issues:

**API Not Responding**
- Check Railway logs
- Verify environment variables
- Ensure port is 3001

**CORS Errors**
- Add Vercel URL to Railway CORS
- Check environment variable spelling

**Build Failures**
- Verify Node.js version (18.x)
- Check package.json scripts
- Review build logs

**Database Issues**
- Railway SQLite should auto-create
- Check file permissions
- Review database initialization

---

## 📊 DEPLOYMENT CHECKLIST

### Railway (Backend)
- [ ] Project created
- [ ] Environment variables set
- [ ] Build successful
- [ ] Health endpoint responding
- [ ] API accessible

### Vercel (Frontend)
- [ ] Project imported
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

✅ **Backend**: Railway URL responds to `/api/health`  
✅ **Frontend**: Vercel URL loads React app  
✅ **Integration**: Frontend can call backend API  
✅ **Database**: SQLite database operational  
✅ **Authentication**: Login/logout working  

---

## 🔄 POST-DEPLOYMENT

### Monitor Your Apps:
- **Railway**: Dashboard shows logs and metrics
- **Vercel**: Analytics and performance data
- **Both**: Set up error monitoring

### Update DNS (Optional):
- Point custom domain to Vercel
- Configure SSL certificates
- Set up analytics

---

## 🎉 DEPLOYMENT COMPLETE!

Your GamePilot application is now live:
- **Frontend**: `https://your-app-name.vercel.app`
- **Backend**: `https://your-app-name.up.railway.app`

**Total Time**: 10-15 minutes  
**Status**: Production Ready 🚀

---

## 📞 SUPPORT

If you encounter issues:
1. Check Railway and Vercel logs
2. Review environment variables
3. Verify CORS configuration
4. Test with the deployment checklist

**Happy deploying!** 🎮
