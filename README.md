# 🔐 Complete Auth System (MERN Stack)

A full-featured authentication system built with the MERN stack, designed to follow modern security standards. This project supports secure user login, registration, access and refresh tokens using HTTP-only cookies, logout, token refresh, and more.

---

## 🚀 Tech Stack

- **Frontend**: React, Axios, Zustand
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB
- **Auth**: JWT (Access & Refresh Tokens), Cookies (HTTP-only)
- **Validation**: express-validator
- **Security**: bcrypt, cookie-parser, secure JWT handling, helmet, schema check, cors, express rate limitter
- **Other Tools**: Nodemon, dotenv

---

## 📁 MVC Folder Structure

---

## ✨ Features

- ✅ User Registration & Login
- ✅ Advance Access + Refresh Token-based Authentication
- ✅ Tokens stored securely in HTTP-only cookies
- ✅ Auto Refresh Token Rotation(RTR) mechanism on protected routes
- ✅ Logout (Single Device)
- ✅ Logout From All Device
- ✅ Sign in with google, One Tap Google Login, Automataic Google Login
- ✅ Email Verification via OTP
- ✅ Clean folder structure following separation of concerns
- ✅ Input validation & sanitization
- ✅ Centralized Error handling
- ✅ Project image on Docker **(https://hub.docker.com/u/yashsingh330)**
- ✅ Industry Level Code Base
- ✅ Apply schemas check on every request in Backend
- ✅ Secure Database with encrypted data
- ✅ CORS Settings
- ✅ Use Helmet for extra security
- ✅ Use Express Rate Limiter for bulk request
- ✅ Use Winston for logging 
- ✅ Optimized React Frontend with zustand
- ✅ Axios Intercepters

---

## 🧪 Setup Instructions

### 1. Clone the Repository

```
git clone https://github.com/your-username/complete-auth-system.git
cd complete-auth
```

### 2. Backend Setup

```
cd Backend
npm install
```

Don't forget to setup .env file from .env.example

### 3. Frontend Setup

```
cd Frontend
npm install
```

Don't forget to setup .env file from .env.example

### 4. Run the App

#### Terminal 1 (Backend)

```
cd Backend
npm run dev
```

#### Terminal 2 (Frontend)

```
cd Frontend
npm run dev
```
