class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (process.env.NODE_ENV === "development") {
    console.error("Error:", err);
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = new ErrorResponse(message, 400);
  }

  // JWT invalid token
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please login again";
    error = new ErrorResponse(message, 401);
  }

  // JWT expired token
  if (err.name === "TokenExpiredError") {
    const message = "Session expired. Please login again";
    error = new ErrorResponse(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// ─────────────────────────────────────────────
// 404 Not Found Handler
// ─────────────────────────────────────────────
const notFound = (req, res, next) => {
  const error = new ErrorResponse(`Route not found: ${req.originalUrl}`, 404);
  next(error);
};

module.exports = { ErrorResponse, errorHandler, notFound };