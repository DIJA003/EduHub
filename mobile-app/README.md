# EduHub Mobile (Native React Native + Expo Go)

This app now uses native React Native screens with role-based navigation (student, mentor, admin), Firebase auth, and your existing backend/database APIs.

## 1) Prerequisites

- Node.js 18+
- npm
- MongoDB (local service if using local DB)
- Expo Go app on your Android/iOS phone
- Phone and computer connected to the same Wi-Fi network

## 2) Run database + backend + web frontend

Open 3 terminals from project root (`EduHub-Merger`):

### Terminal 1 - Database (MongoDB local)

If you use local MongoDB:

```powershell
mongod
```

If MongoDB runs as a Windows service, ensure service is started instead.

### Terminal 2 - Backend API

```powershell
cd server
npm install
npm run dev
```

The backend will run on `http://localhost:8000`.

### Terminal 3 - Web Frontend

```powershell
cd client
npm install
npm start
```

The frontend will run on `http://localhost:3000`.

## 3) Configure mobile environment

Inside `mobile-app`, create `.env`:

```powershell
cd mobile-app
copy .env.example .env
```

Edit `.env` and set your PC Wi-Fi IP + Firebase config:

```env
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:8000/api
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

Example:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api
```

To find your IP on Windows:

```powershell
ipconfig
```

Use the `IPv4 Address` of your active Wi-Fi adapter.

## 4) Run Expo app for Expo Go

In terminal from `mobile-app`:

```powershell
cd mobile-app
npm install
npm start
```

Then:

- Press `s` in terminal to switch Expo to **LAN** mode if needed.
- Scan QR code with Expo Go.
- App opens your full EduHub website in mobile.

## 5) If app cannot run

- Ensure backend terminal is still running.
- Ensure phone and PC are on same Wi-Fi.
- Verify `.env` API URL and Firebase keys are correct.
- Confirm Windows firewall allows Node.js incoming connections.
- Reopen Expo app and press `r` in Expo terminal to reload.
