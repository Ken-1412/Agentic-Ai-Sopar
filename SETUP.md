# 🚀 Quick Setup Guide

## Prerequisites
- Node.js 18+
- npm or yarn

## Installation Steps

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Configure Environment (Optional)
Copy `.env.example` to `.env` in the backend directory:
```bash
cd backend
cp .env.example .env
```

### 4. Start Backend Server
```bash
cd backend
npm run dev
```
Backend runs on: `http://localhost:3001`

### 5. Start Frontend Server (New Terminal)
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

## Verify Installation

1. Open `http://localhost:5173` in your browser
2. You should see the MealWise dashboard
3. Click "Get Recommendations" to test the API connection
4. Check browser console (F12) for any errors

## Common Issues

### Port Already in Use
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change port in `frontend/vite.config.js`

### CORS Errors
- Ensure backend is running
- Check that `cors()` middleware is enabled in `backend/server.js`

### API Not Responding
- Verify backend is running on port 3001
- Check backend terminal for errors
- Test with: `curl http://localhost:3001/api/health`

## Next Steps

- Read `README.md` for full documentation
- Check API endpoints in `README.md`
- Start rating meals to see learning in action!










