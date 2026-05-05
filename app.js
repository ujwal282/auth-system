const express = require("express");
const authRouter = require("./routes/auth.routes.js");
const userRouter = require("./routes/user.routes.js");
const adminRoutes = require("./routes/admin.routes.js");
const cookieParser = require("cookie-parser");
const { notFound, errorHandler } = require("./middleware/error.middleware.js");
const helmet = require("helmet");
const cors = require("cors");
const rateLimiter = require("express-rate-limit");

const app = express();
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:5173"
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

const limiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: "Too many request, please try again later"
    }
});



app.use("/api/", limiter);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());


// ---------------- DEFAULT ROUTES ----------------

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running 🚀"
  });
});



// ---------------- API ROUTES ----------------
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRoutes);



// ---------------- ERROR HANDLERS ----------------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
