# VeriVault Frontend Environment Setup

## For Netlify Deployment

Set these environment variables in your Netlify dashboard:

**Site Settings > Environment Variables**

| Variable | Value | Description |
|----------|-------|-------------|
| `REACT_APP_API_URL` | `https://your-railway-app.up.railway.app` | Your Railway backend URL |
| `REACT_APP_ENV` | `production` | Environment indicator |

## For Local Development

Create a `.env.local` file in the client directory with:

```
REACT_APP_API_URL=http://localhost:8080
REACT_APP_ENV=development
```

## How to Find Your URLs

**Railway Backend URL:**
1. Go to your Railway dashboard
2. Click on your VeriVault backend project
3. Go to "Settings" > "Domains"
4. Copy the generated domain (e.g., `https://verivault-backend-production-abcd.up.railway.app`)

**Netlify Frontend URL:**
1. Go to your Netlify dashboard
2. Click on your VeriVault site
3. The URL is shown at the top (e.g., `https://amazing-site-name-123456.netlify.app`)

## Updating the Environment Variables

After deployment, update both:
- Netlify: Set `REACT_APP_API_URL` to your Railway URL
- Railway: Set `CLIENT_URL` to your Netlify URL 