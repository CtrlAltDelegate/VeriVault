# VeriVault Backend Environment Setup

## For Railway Deployment

Set these environment variables in your Railway dashboard:

**Project Settings > Environment**

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `CLIENT_URL` | `https://your-netlify-site.netlify.app` | Your Netlify frontend URL |
| `DEFAULT_ADMIN_USERNAME` | `admin` | Admin username (optional) |
| `DEFAULT_ADMIN_PASSWORD` | `password` | Admin password (optional) |
| `DEFAULT_ADMIN_PIN` | `1234` | Admin PIN (optional) |

**Note:** Railway automatically sets the `PORT` variable, so you don't need to set it manually.

## For Local Development

Create a `.env` file in the server directory with:

```
NODE_ENV=development
CLIENT_URL=http://localhost:3000
PORT=8080
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=password
DEFAULT_ADMIN_PIN=1234
```

## Railway CLI Commands

To set environment variables via Railway CLI:

```bash
# Navigate to server directory
cd VeriVault/verivault-v2/server

# Set environment variables
railway variables set NODE_ENV=production
railway variables set CLIENT_URL=https://your-netlify-site.netlify.app
railway variables set DEFAULT_ADMIN_USERNAME=admin
railway variables set DEFAULT_ADMIN_PASSWORD=password
railway variables set DEFAULT_ADMIN_PIN=1234

# Check variables
railway variables
```

## Health Check

After setting variables, check if your backend is running:
- Visit: `https://your-railway-app.up.railway.app/api/health`
- Should return: `{"status":"OK","message":"VeriVault Server is running",...}` 