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

**👉 https://tinyurl.com/No-Fap-Tracker**

The Android application is distributed as an APK and can be installed directly on compatible Android devices.

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
```

---

# ⚙️ Local Setup

## Prerequisites

Install the following:

- Node.js
- npm
- Git
- MongoDB Atlas account or local MongoDB

For mobile development:

- Expo
- Expo Go or Android development environment
- EAS CLI for cloud builds

---

# 🔧 Backend Setup

### 1. Navigate to backend

```bash
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env`

Create a `.env` file inside the `backend` directory:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
PORT=5000

RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=NoFap Tracker Pro <your_verified_email>
FRONTEND_URL=http://localhost:5173
```

> Never commit `.env` files or API keys to GitHub.

### 4. Start backend

```bash
npm run dev
```

Backend will run on:

```text
http://localhost:5000
```

---

# 💻 Frontend Setup

### 1. Navigate to frontend

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env`

```env
VITE_API_BASE=http://localhost:5000/api
```

### 4. Start development server

```bash
npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```

---

# 📱 Mobile App Setup

The mobile application is located inside:

```text
mobile/
```

### 1. Navigate to mobile

```bash
cd mobile
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start Expo

```bash
npx expo start
```

You can then run the application using:

- Expo Go
- Android emulator
- Physical Android device

---

# 🔐 Authentication

The application uses JWT-based authentication.

### Authentication flow

```text
Signup
   ↓
Account created
   ↓
JWT token generated
   ↓
Token stored securely
   ↓
Authenticated API requests
```

### Web

JWT credentials are stored in browser storage.

### Mobile

JWT credentials are stored using **Expo Secure Store**.

---

# 🔑 Forgot Password

The application supports password recovery.

### Flow

```text
Login
  ↓
Forgot Password
  ↓
Enter email
  ↓
Password reset email
  ↓
Reset password page
  ↓
Enter new password
  ↓
Password updated
  ↓
Login
```

Password reset tokens are:

- Cryptographically generated
- Stored as hashes
- Time-limited
- Invalidated after successful password reset

The reset link is valid for **15 minutes**.

The password recovery flow is supported from both the web and mobile applications.

---

# 📌 Main Features

## ✅ Clean Day Tracking

Users can mark individual dates as clean.

- Select a date from the calendar
- Choose **Mark Clean**
- Activity is saved to MongoDB
- Clean days are reflected in statistics and heatmap

---

## ❌ Relapse Logging

Users can record relapse events.

Each relapse can contain:

- Date
- Actress/trigger
- Optional note

---

## 🗓️ Calendar

The calendar provides an overview of daily activity.

Color coding:

- 🟢 **Green** → Clean day
- 🔴 **Red** → Relapse
- ⚫ **Dark/empty** → No activity

Clicking a date opens the activity management interface.

---

## 🔥 365-Day Heatmap

The application includes a GitHub-style contribution heatmap.

The heatmap displays activity over the previous 365 days.

- 🟢 **Lime** → Clean day
- 🩷 **Pink** → Relapse
- ⚫ **Dark** → No activity

The heatmap is horizontally scrollable.

---

## 📊 Monthly Analytics

Monthly relapse statistics are displayed using charts.

The charts help users identify:

- Monthly relapse frequency
- Trends over time
- Periods of improvement or decline

---

## 🧠 Actress-Wise Statistics

The application provides statistics based on the actress/trigger entered during relapse logging.

It displays:

- Actress/trigger name
- Number of associated relapses
- Relative frequency

This helps users identify recurring triggers.

---

## 🔁 Reset Streak

Users can manually reset their streak.

The application supports:

- Manual streak reset
- Automatic streak calculation
- Latest relapse-based streak calculation
- Reset-date based streak calculation

---

## 📥 Export CSV

Users can export their relapse records as CSV.

This can be used for:

- Personal backups
- Data analysis
- External spreadsheets
- Record keeping

---

# 🗄️ Database

The project uses **MongoDB Atlas** for cloud-based persistence.

### Collections

```text
users
relapses
cleandays
```

### Users

Stores account information and authentication-related data.

### Relapses

Stores relapse records including:

- User
- Date
- Actress/trigger
- Optional note

### Clean Days

Stores clean-day records associated with users.

---

# 🚀 Production Deployment

## Backend — Render

The backend is deployed on Render.

### Configuration

```text
Root Directory:
backend

Build Command:
npm install

Start Command:
npm start
```

### Production Environment Variables

```env
MONGO_URI=...
JWT_SECRET=...
RESEND_API_KEY=...
EMAIL_FROM=...
FRONTEND_URL=...
```

Production backend:

```text
https://habit-tracker-w4eu.onrender.com
```

API:

```text
https://habit-tracker-w4eu.onrender.com/api
```

---

## Frontend — Vercel

The frontend is deployed on Vercel.

### Root Directory

```text
frontend
```

### Environment Variable

```env
VITE_API_BASE=https://habit-tracker-w4eu.onrender.com/api
```

Production frontend:

```text
https://habit-tracker-8z8z.vercel.app/
```

The project also uses a Vercel rewrite configuration for SPA routes such as password reset URLs.

---

# 📱 Android APK Deployment

The mobile application uses **Expo Application Services (EAS)** for Android builds.

### Android package

```text
com.vishal.nofaptrackerpro
```

### Preview build

The project uses an internal distribution profile:

```json
{
  "preview": {
    "distribution": "internal"
  }
}
```

### Build APK

From the `mobile` directory:

```bash
npx eas-cli build --platform android --profile preview
```

After the build completes, EAS provides an APK download URL.

The APK can then be distributed through a file-hosting service.

### Current Android Download Link

**https://tinyurl.com/No-Fap-Tracker**

---

# 🧪 Testing

Before production deployment, test:

### Authentication

- Signup
- Login
- Logout
- Invalid credentials
- Forgot password
- Reset password

### Tracking

- Add clean day
- Add relapse
- Delete relapse
- Reset streak
- Calendar updates

### Analytics

- Monthly charts
- Actress statistics
- Heatmap
- Streak calculations

### Data

- CSV export
- MongoDB persistence
- Cross-device synchronization

### Mobile

- Login
- Signup
- Dashboard
- Calendar
- Add relapse
- Delete relapse
- Reset streak
- Statistics
- Heatmap
- CSV export
- Forgot password
- Network error handling

---

# 🛠️ Troubleshooting

## ❌ Dashboard fails to load

Possible causes:

- Incorrect `VITE_API_BASE`
- Backend unavailable
- CORS configuration
- Network connectivity

Verify:

```text
https://habit-tracker-w4eu.onrender.com/api
```

---

## ❌ 401 Unauthorized

Possible causes:

- Expired JWT
- Missing token
- Invalid authentication state

### Solution

1. Logout
2. Login again
3. Retry the operation

---

## ❌ CORS Error

Check:

- Backend CORS configuration
- Frontend URL
- `FRONTEND_URL`
- `VITE_API_BASE`

---

## ❌ Forgot Password Email Not Received

Check:

- `RESEND_API_KEY`
- `EMAIL_FROM`
- Resend account/domain configuration
- Spam folder
- Backend Render logs

---

## ❌ Android APK Installation Problem

Make sure:

- The APK has finished downloading
- Android allows installation from the download source
- The downloaded file ends with `.apk`
- The APK isn't corrupted

---

# 🔮 Future Enhancements

Possible future improvements:

- 🔔 Push notifications
- 📈 Advanced weekly/monthly insights
- 🔍 Advanced filtering and search
- 💾 Backup and restore
- ☁️ Automatic cloud backup
- 📊 More detailed analytics
- 🏆 Achievement/badge system
- 🔐 Additional account security
- 📱 Google Play Store release
- 🍎 iOS application release
- 🔄 OTA mobile updates using EAS Update

---

# 📜 License

This project is open source and available under the **MIT License**.

---

# 👨‍💻 Author

**Built by Vishal Kumar** 🚀

GitHub:

https://github.com/VK128000/habit-tracker
