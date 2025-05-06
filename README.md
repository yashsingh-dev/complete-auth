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
- ✅ Access + Refresh Token-based Authentication
- ✅ Tokens stored securely in HTTP-only cookies
- ✅ Token refresh mechanism on protected routes
- ✅ Logout (Single Device)
- ✅ Email Verification via OTP
- ✅ Clean folder structure following separation of concerns
- ✅ Input validation & sanitization
- ✅ Error handling (to be centralized)

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

Create a .env file
PORT = 3000
ORIGIN = http://localhost:5173
DB_URL = mongodb://localhost:27017
DB_NAME = secure_auth

NODE_ENV = development
JWT_ACCESS_KEY = 'dbnf47334h%#*(&%FG^$)^%^&(&%^$&^*G)'
JWT_REFRESH_KEY = 'G^&$&(TY*&(TY*$%^G&(*)*HIH&%RT^&T*))'

EMAIL_HOST =
EMAIL_PORT =
EMAIL_USER =
EMAIL_ADDRESS =
EMAIL_PASS =
```

### 3. Frontend Setup

```
cd Frontend
npm install

Create a .env file
VITE_BACKEND_URL=http://localhost:5000
```

### 4. Run the App

# Terminal 1 (Backend)

cd Backend
npm run dev

# Terminal 2 (Frontend)

cd Frontend
npm run dev
