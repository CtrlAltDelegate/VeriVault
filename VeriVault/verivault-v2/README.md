# VeriVault v2 - AI-Powered Security Intelligence Platform

## 🛡️ Modern Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript  
- **Real-time Communication**: REST API (WebSocket support coming soon)
- **Styling**: Tailwind CSS with custom components
- **Development**: Hot reload for both client and server

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone and install all dependencies:**
```bash
npm run install:all
```

2. **Start both client and server in development mode:**
```bash
npm run dev
```

This will start:
- **Server** on `http://localhost:5000`
- **Client** on `http://localhost:3000`

### Individual Commands

**Server only:**
```bash
npm run server:dev    # Development mode with hot reload
npm run server:build  # Build for production
npm run server:start  # Start production server
```

**Client only:**
```bash
npm run client:dev    # Development mode
npm run client:build  # Build for production
npm run client:start  # Start production build
```

## 📁 Project Structure

```
verivault-v2/
├── client/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── tailwind.config.js  # Tailwind CSS config
│   └── package.json
├── server/                 # Node.js TypeScript backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   │   ├── auth.ts     # Authentication
│   │   │   ├── logs.ts     # Security logs
│   │   │   └── reports.ts  # Report generation
│   │   └── server.ts       # Main server file
│   ├── tsconfig.json       # TypeScript config
│   └── package.json
└── package.json            # Root package.json
```

## 🔧 Features

### ✅ Implemented
- **Modern Landing Page** - React version with Tailwind CSS
- **Authentication System** - Login/logout with demo credentials
- **Daily Log System** - Create, view, and manage security logs
- **Real-time UI Updates** - Instant log updates
- **TypeScript Support** - Full type safety across the stack
- **Responsive Design** - Mobile-friendly interface

### 🚧 Coming Soon
- **AI Report Generation** - OpenAI integration for intelligent reports
- **Database Integration** - Replace in-memory storage
- **JWT Authentication** - Secure token-based auth
- **WebSocket Support** - Real-time updates
- **File Upload** - CSV import/export
- **Advanced Analytics** - Charts and metrics

## 🎮 Demo Credentials

- **Username**: `admin`
- **Password**: `password`

## 🛠️ Development

### Environment Variables

Create `.env` files in the server directory:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
# JWT_SECRET=your-jwt-secret
# OPENAI_API_KEY=your-openai-key
```

### API Endpoints

**Authentication:**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

**Security Logs:**
- `GET /api/logs` - Get all logs
- `POST /api/logs` - Create new log
- `GET /api/logs/:id` - Get specific log
- `PUT /api/logs/:id` - Update log
- `DELETE /api/logs/:id` - Delete log

**Reports:**
- `POST /api/reports/generate` - Generate AI report

## 🎯 Migration from v1

This v2 rewrite provides:
1. **Better Developer Experience** - Hot reload, TypeScript, modern tooling
2. **Scalable Architecture** - Separate client/server with clear API boundaries  
3. **Modern UI/UX** - React components with Tailwind CSS
4. **Type Safety** - Full TypeScript coverage
5. **Production Ready** - Proper build pipeline and deployment setup

## 📦 Build & Deploy

**Development:**
```bash
npm run dev
```

**Production Build:**
```bash
npm run server:build
npm run client:build
```

**Production Start:**
```bash
npm run server:start
# Serve client build files through Express or CDN
```

---

Built with ❤️ using TypeScript + React + Node.js 