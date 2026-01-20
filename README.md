# 📘 NoFap Tracker Pro

## 🚀 Project Overview

NoFap Tracker Pro is a full-stack habit tracker app that helps you track:

- ✅ Clean days (day-wise tracking)
- ❌ Relapse logs (date + actress + optional note)
- 📊 Monthly relapse charts
- 🧠 Actress-wise relapse counts (trigger stats)
- 🗓️ Calendar view (click a date → modal to update)
- 🔥 GitHub-style heatmap (last 365 days)
- 🔁 Reset streak logic
- 📥 Export relapse logs to CSV
- 🔐 Auth system (Signup/Login) with JWT

## 🛠 Tech Stack

### Frontend
- React + Vite
- TailwindCSS
- Chart.js
- Axios
- React Router

### Backend
- Node.js + Express
- MongoDB (Local)
- Mongoose
- JWT Authentication
- bcryptjs

## 📂 Folder Structure

```
nofap-tracker-pro/
├── backend/
└── frontend/
```

## ⚙️ Setup Instructions (Local)

### ✅ 1) Start MongoDB (Windows)

Make sure MongoDB service is running:
```powershell
net start | findstr Mongo
```

You should see:
```
MongoDB Server (MongoDB)
```

### ✅ 2) Backend Setup

1. Go to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run backend server:
   ```bash
   npm run dev
   ```

Backend runs on: `http://localhost:5000`

### ✅ 3) Frontend Setup

1. Go to frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start frontend:
   ```bash
   npm run dev
   ```

Frontend runs on: `http://localhost:5173`

## 🔐 Authentication Flow

- Signup creates user and returns JWT token
- Login returns JWT token
- Token is stored in localStorage
- Axios interceptor attaches token automatically in every request

## 📌 Main Features

### ✅ Clean Day Tracking
- Click on calendar date
- Select Mark Clean
- Saves clean day in DB

### ❌ Relapse Logging
- Click on calendar date
- Select Add Relapse
- Enter actress + note
- Saves relapse log in DB

### 📅 Calendar View
- 🟢 Clean days
- 🔴 Relapse days
- Click a day → opens modal

### 🔥 Heatmap (Last 365 days)
- GitHub style grid
- Colors:
  - Lime = Clean
  - Pink = Relapse
  - Dark = Empty
- Scrollable horizontally

### 📊 Monthly Chart
- Bar chart showing relapses per month

### 📈 Actress-wise Count
- Table showing actress name and relapse count

### 🔁 Reset Streak
- Resets streak base date
- Streak calculation uses latest of last relapse date OR reset date

### 📥 Export CSV
- Downloads relapse logs in CSV format

## 🗄 Database Info (Local MongoDB)

**Connection String:** `mongodb://127.0.0.1:27017/nofap_pro`

### Database: `nofap_pro`

**Collections:**
- users
- relapses
- cleandays

### 👀 View Database (GUI)

Install MongoDB Compass and connect to:
```
mongodb://127.0.0.1:27017
```

### 🧪 CLI Database Access (mongosh)

Start shell:
```bash
mongosh
```

**Commands:**
```bash
show dbs
use nofap_pro
show collections

db.users.find()
db.relapses.find()
db.cleandays.find()

exit
```

## 🔧 Environment Variables (Frontend)

Create this file: `frontend/.env`

```
VITE_API_BASE=http://localhost:5000/api
```

## 🔧 Troubleshooting

### ❌ Tailwind @tailwind not working

Run inside frontend:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Then restart:
```bash
npm run dev
```

### ❌ 401 Unauthorized / No token

This happens when token is missing.

**Fix:**
1. Login again
2. Ensure token exists: `localStorage.getItem("token")`

## 📌 Future Enhancements (Optional)
- Mobile App (React Native / Flutter)
- Cloud DB (MongoDB Atlas)

## ✅ Author

Built by Vishal Kumar 🚀
  Cloud DB (MongoDB Atlas)


✅ Author
Built by Vishal Kumar 🚀
