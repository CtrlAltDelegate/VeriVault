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

# Set client URL (update with your frontend URL)
railway variables set CLIENT_URL=https://your-frontend-domain.com

# Optional: Set custom admin credentials
railway variables set DEFAULT_ADMIN_USERNAME=your_admin_username
railway variables set DEFAULT_ADMIN_PASSWORD=your_secure_password
railway variables set DEFAULT_ADMIN_PIN=your_4_digit_pin
```

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

### Build Issues
```bash
# Clear build cache
railway run npm run build

# Check build logs
railway logs --tail
```

### Environment Issues
```bash
# List all variables
railway variables

# Check specific variable
railway variables get NODE_ENV
```

### Connection Issues
- Ensure `CLIENT_URL` matches your frontend domain
- Check CORS settings in server.ts
- Verify health check responds: `/api/health` 