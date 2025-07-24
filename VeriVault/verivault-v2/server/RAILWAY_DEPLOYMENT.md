# VeriVault Backend - Railway Deployment Guide

## 🚀 Quick Deploy to Railway

### Prerequisites
- [Railway CLI](https://docs.railway.app/develop/cli) installed
- Git repository initialized
- Railway account ([railway.app](https://railway.app))

### 1. Install Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login
```

### 2. Deploy from VeriVault Server Directory
```bash
# Navigate to server directory
cd VeriVault/verivault-v2/server

# Initialize Railway project
railway project create verivault-backend

# Deploy to Railway
railway up
```

### 3. Set Environment Variables
```bash
# Set production environment
railway variables set NODE_ENV=production

# CRITICAL: Set client URL to match your Netlify frontend URL
railway variables set CLIENT_URL=https://your-netlify-site-name.netlify.app

# Optional: Set custom admin credentials
railway variables set DEFAULT_ADMIN_USERNAME=admin
railway variables set DEFAULT_ADMIN_PASSWORD=password
railway variables set DEFAULT_ADMIN_PIN=1234
```

**Important:** Replace `your-netlify-site-name.netlify.app` with your actual Netlify URL!

### 4. Generate Domain
```bash
# Generate a Railway domain
railway domain
```

## 🔧 Manual Deployment via Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your VeriVault repository
5. Set the root directory to `/VeriVault/verivault-v2/server`
6. Railway will auto-detect and deploy!

## 📋 Environment Variables to Set

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `production` | ✅ |
| `PORT` | Server port | `8080` | Auto-set |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` | ✅ |
| `DEFAULT_ADMIN_USERNAME` | Admin username | `admin` | ❌ |
| `DEFAULT_ADMIN_PASSWORD` | Admin password | `password` | ❌ |
| `DEFAULT_ADMIN_PIN` | Admin PIN | `1234` | ❌ |

## 🔗 API Endpoints

Once deployed, your API will be available at:
- Health Check: `https://your-app.railway.app/api/health`
- Authentication: `https://your-app.railway.app/api/auth/*`
- Logs: `https://your-app.railway.app/api/logs/*`
- Reports: `https://your-app.railway.app/api/reports/*`

## 🛠 Local Development
```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📊 Monitoring

Railway provides built-in monitoring:
- View logs: `railway logs`
- Check metrics in Railway dashboard
- Health check endpoint: `/api/health`

## 🔮 Future Enhancements

This backend is ready for:
- Database integration (PostgreSQL, MongoDB)
- Redis for caching and sessions
- Multi-LLM review pipeline (GPT-4o + Claude 3 + Command R+)
- Real JWT authentication
- File upload and processing

## 🆘 Troubleshooting

### Connection Issues Between Frontend and Backend

**1. CORS Errors:**
```bash
# Check your environment variables
railway variables

# Ensure CLIENT_URL matches your Netlify URL exactly
railway variables set CLIENT_URL=https://your-actual-netlify-url.netlify.app
```

**2. Frontend Can't Reach Backend:**
- Check that `REACT_APP_API_URL` is set in Netlify dashboard
- Verify Railway backend is running: visit `https://your-railway-app.up.railway.app/api/health`
- Check browser network tab for actual error messages

**3. Environment Variable Issues:**
```bash
# List all variables
railway variables

# Check specific variable
railway variables get CLIENT_URL
railway variables get NODE_ENV
```

**4. Build Issues:**
```bash
# Clear build cache and rebuild
railway run npm run build

# Check build logs
railway logs --tail
```

**5. URL Verification:**
- Railway URL: Check your Railway project settings > Domains
- Netlify URL: Check your Netlify site overview page
- Make sure both URLs use HTTPS in production

### Quick Connection Test

1. **Test Backend Health:**
   ```
   curl https://your-railway-app.up.railway.app/api/health
   ```

2. **Test CORS from Frontend:**
   Open browser console on your Netlify site and run:
   ```javascript
   fetch('https://your-railway-app.up.railway.app/api/health')
     .then(r => r.json())
     .then(console.log)
     .catch(console.error)
   ```

### Common Fixes

- **Wrong URLs:** Update environment variables with correct URLs
- **Missing HTTPS:** Ensure production URLs use HTTPS
- **Typos:** Double-check spelling in environment variable names
- **Case Sensitivity:** Environment variables are case-sensitive 