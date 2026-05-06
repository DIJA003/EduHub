# EduHub Mobile Native - Final Delivery

This folder contains the native React Native (Expo Go) implementation connected to your existing backend/database and Firebase auth.

## Implemented

- Native app architecture with modular structure:
  - `src/services/firebase.js`
  - `src/services/api.js`
  - `src/context/AuthContext.js`
  - `src/navigation/AppNavigator.js`
  - `src/screens/AuthScreens.js`
  - `src/screens/RoleScreens.js`
  - `src/components/ui.js`
- Firebase authentication flow:
  - Login
  - Register
  - Forgot password
  - Logout
- Role-based app routing:
  - Student
  - Mentor
  - Admin
- Backend API integration:
  - Admin: dashboard stats/activity, colleges, courses, materials, users
  - Mentor: pending materials, my materials, upload, approve/reject/delete
  - Student: dashboard courses
  - Academic years list
- Advanced interaction patterns:
  - Native data table
  - Native form modal (add/edit)
  - Native confirm modal (delete/critical action)

## Environment setup

Create `.env` inside `mobile-app` from `.env.example`:

```powershell
cd C:\yousab\EduHub-Merger\mobile-app
copy .env.example .env
```

Fill values:

```env
EXPO_PUBLIC_API_URL=http://YOUR_PC_WIFI_IP:8000/api
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

## Run project

## 1) Database

```powershell
mongod
```

## 2) Backend

```powershell
cd C:\yousab\EduHub-Merger\server
npm install
npm run dev
```

## 3) Optional web frontend (for parity reference)

```powershell
cd C:\yousab\EduHub-Merger\client
npm install
npm start
```

## 4) Mobile app (Expo Go)

```powershell
cd C:\yousab\EduHub-Merger\mobile-app
npm install
npm start
```

Scan the QR code using Expo Go on your phone.

## Notes

- Phone and computer must be on the same Wi-Fi.
- Ensure firewall allows Node.js.
- Keep backend running while mobile app is testing.
- If API calls fail, re-check `EXPO_PUBLIC_API_URL` and Firebase env values.
