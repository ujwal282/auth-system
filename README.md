<h1 align="center">🔐 Auth System API</h1>

<h3 align="center">
A secure authentication backend built with Node.js, Express, and MongoDB
</h3>

---

# 🚀 Live API
https://your-backend.onrender.com

---

# 🧠 About

This is a REST API for authentication with JWT, refresh tokens, and role-based access control.

---

# ⚙️ Features

- User Register / Login
- JWT Authentication (Access + Refresh Token)
- Forgot / Reset Password
- Role-based Access (User/Admin)
- Secure Password Hashing (bcrypt)
- Rate Limiting Protection
- Helmet Security Middleware
- CORS Configuration

---

# 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT
- bcrypt
- cookie-parser
- cors
- helmet
- express-rate-limit

---

# 📡 API Routes

## Auth

- POST `/api/v1/auth/register`
- POST `/api/v1/auth/login`
- POST `/api/v1/auth/refresh-token`
- POST `/api/v1/auth/forgot-password`
- POST `/api/v1/auth/reset-password`

## User

- GET `/api/v1/user`

---

# ⚙️ Environment Variables

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
REFRESH_SECRET=your_refresh_secret
FRONTEND_URL=https://your-frontend.vercel.app

🚀 Run Locally

npm install
npm run dev

👨‍💻 Author
Ujwal Paudel
