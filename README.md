# 📖 NoFap Tracker Pro

A full-stack habit tracker application designed to help users track clean streaks, manage relapses, and understand their habits through detailed analytics and insights.

The project includes:

- 🌐 Full-stack web application
- 📱 React Native / Expo Android application
- 🔐 JWT-based authentication
- 🔑 Forgot password & password reset
- 📊 Relapse analytics
- 🗓️ Calendar tracking
- 🔥 GitHub-style activity heatmap
- 📥 CSV export
- ☁️ MongoDB Atlas cloud persistence

---

## 🚀 Project Overview

NoFap Tracker Pro helps users track and analyze their progress with:

- ✅ **Clean days** — day-wise clean-day tracking
- ❌ **Relapse logs** — date, actress/trigger and optional note
- 📊 **Monthly relapse charts**
- 🧠 **Actress-wise relapse statistics**
- 🗓️ **Calendar view** — click a date to manage activity
- 🔥 **GitHub-style heatmap** — last 365 days
- 🔁 **Reset streak logic**
- 📥 **Export relapse logs to CSV**
- 🔐 **Signup/Login authentication**
- 🔑 **Forgot password & reset password**
- 📱 **Android mobile application**

---

## 🌐 Live Deployment

### Web Application

| Component | Link |
|-----------|------|
| **Frontend** | https://habit-tracker-8z8z.vercel.app/ |
| **Backend** | https://habit-tracker-w4eu.onrender.com/ |
| **API Base** | https://habit-tracker-w4eu.onrender.com/api |

### 📱 Android Application

The latest Android APK can be downloaded here:

**👉 https://tinyurl.com/No-Fap-Tracker-1**

The Android application is distributed as an APK and can be installed directly on Android devices.

---

## 🛠️ Tech Stack

### Frontend — Web

- **React**
- **Vite**
- **TailwindCSS**
- **Chart.js**
- **Axios**
- **React Router**

### Backend

- **Node.js**
- **Express.js**
- **MongoDB Atlas**
- **Mongoose**
- **JWT**
- **bcryptjs**
- **Resend**
- **REST APIs**

### Mobile

- **React Native**
- **Expo**
- **Expo Router**
- **TypeScript**
- **Axios**
- **Expo Secure Store**
- **React Native Calendars**
- **React Native NetInfo**
- **EAS Build**

---

## 📂 Project Structure

```text
habit-tracker/
│
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── routes/
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── api.js
│   ├── vercel.json
│   ├── package.json
│   └── index.html
│
├── mobile/
│   ├── src/
│   │   ├── app/
│   │   └── services/
│   ├── assets/
│   ├── app.json
│   ├── eas.json
│   ├── package.json
│   └── tsconfig.json
│
└── README.md