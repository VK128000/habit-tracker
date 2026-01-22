# 📘 NoFap Tracker Pro

A full-stack habit tracker application designed to help users track clean streaks and manage relapses with detailed analytics and insights.

---

## 🚀 Project Overview

NoFap Tracker Pro is a full-stack habit tracker app that helps you track:

- ✅ **Clean days** (day-wise tracking)
- ❌ **Relapse logs** (date + actress + optional note)
- 📊 **Monthly relapse charts**
- 🧠 **Actress-wise relapse counts** (trigger stats)
- 🗓️ **Calendar view** (click a date → modal to update)
- 🔥 **GitHub-style heatmap** (last 365 days)
- 🔁 **Reset streak logic**
- 📥 **Export relapse logs** to CSV
- 🔐 **Auth system** (Signup/Login) with JWT

---

## 🌐 Live Deployment

| Component | Link |
|-----------|------|
| **Frontend** (Vercel) | https://habit-tracker-8z8z.vercel.app/ |
| **Backend** (Render) | https://habit-tracker-w4eu.onrender.com/ |
| **API Base** | https://habit-tracker-w4eu.onrender.com/api |

---

## 🛠 Tech Stack

### Frontend
- **React** + **Vite** - Fast development environment
- **TailwindCSS** - Utility-first CSS framework
- **Chart.js** - Data visualization
- **Axios** - HTTP client
- **React Router** - Client-side routing

### Backend
- **Node.js** + **Express** - Server framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM for MongoDB
- **JWT** - Secure authentication
- **bcryptjs** - Password hashing

---

## 📂 Project Structure

```
habit-tracker/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── routes/
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── api.js
    ├── package.json
    └── index.html
```

---

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB Atlas account (or local MongoDB)
- Git

### ✅ Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file** with the following variables:
   ```env
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secret_key
   PORT=5000
   ```

4. **Run the server:**
   ```bash
   npm run dev
   ```

   Backend will run on: `http://localhost:5000`

### ✅ Frontend Setup

1. **Navigate to frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```env
   VITE_API_BASE=http://localhost:5000/api
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   Frontend will run on: `http://localhost:5173`

---

## 🔐 Authentication Flow

1. **Signup** → User account created, JWT token returned
2. **Login** → Credentials verified, JWT token returned
3. **Token Storage** → JWT stored in `localStorage`
4. **Auto-attach** → Axios interceptor automatically attaches token to all API requests

---

## 📌 Main Features

### ✅ Clean Day Tracking
- Click on any calendar date
- Select "Mark Clean" option
- Day is saved in database and highlighted on calendar

### ❌ Relapse Logging
- Click on any calendar date
- Select "Add Relapse" option
- Enter actress name + optional note
- Relapse is logged and tracked

### 📅 Calendar View
Shows all activities with color coding:
- 🟢 **Green** = Clean days
- 🔴 **Red** = Relapse days
- Click any day to open modal with options

### 🔥 Heatmap (Last 365 Days)
- GitHub-style contribution grid
- **Lime color** = Clean days
- **Pink color** = Relapse days
- **Dark** = No activity
- Horizontally scrollable

### 📊 Monthly Chart
- Bar chart visualization
- Shows total relapses per month
- Easy trend analysis

### 📈 Actress-wise Statistics
- Table of actresses
- Relapse count per actress
- Helps identify triggers

### 🔁 Reset Streak Feature
- Manually reset streak base date
- Automatic streak calculation based on latest relapse or reset date

### 📥 Export CSV
- Download all relapse logs as CSV
- Easy data backup and analysis

---

## 🗄 Database

### MongoDB Atlas (Cloud Database)
This project uses MongoDB Atlas for cloud-based data persistence, allowing data access across all devices.

**Collections:**
- `users` - User account information
- `relapses` - All relapse records
- `cleandays` - All clean day records

---

## 🚀 Deployment

### Backend Deployment (Render)
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `MONGO_URI` - MongoDB Atlas connection string
  - `JWT_SECRET` - JWT signing secret

### Frontend Deployment (Vercel)
- **Root Directory:** `frontend`
- **Environment Variables:**
  - `VITE_API_BASE=https://habit-tracker-w4eu.onrender.com/api`

---

## 🔧 Troubleshooting

### ❌ Tailwind CSS not working

**Issue:** `@tailwind` directives not processing

**Solution:**
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm run dev
```

### ❌ Failed to load dashboard

**Common Causes:**
- `VITE_API_BASE` not set correctly in Vercel
- Backend CORS not allowing frontend domain
- Backend server not running

**Solution:**
- Verify API base: `https://habit-tracker-w4eu.onrender.com/api`
- Check CORS configuration in backend
- Ensure backend is deployed and running

### ❌ 401 Unauthorized / No token

**Issue:** Token missing or expired

**Solution:**
1. Logout and login again
2. Verify token in browser console:
   ```javascript
   localStorage.getItem("token")
   ```

### ❌ CORS Errors

**Issue:** Frontend cannot communicate with backend

**Solution:**
- Check backend `.env` file has correct values
- Verify frontend API base URL points to correct backend URL
- Ensure backend CORS middleware allows frontend origin

---

## 📌 Future Enhancements

- 📱 **React Native Mobile App** - Native mobile support
- 🔔 **Push Notifications** - Reminders and alerts
- 📈 **Analytics** - Weekly insights and patterns
- 🔍 **Advanced Filtering** - Search and filter actress logs
- 💾 **Backup/Restore** - Export and import functionality
- 🌙 **Dark Mode** - Theme toggle

---

## ✅ Author

**Built by Vishal Kumar** 🚀

---

## 📝 License

This project is open source and available under the MIT License.