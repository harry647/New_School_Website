// ==================================================
// errorHandler.js – Robust Error Handling Middleware
// ==================================================

// This middleware catches errors thrown in routes or other middleware
// and sends a structured JSON response without breaking the app.

export const errorHandler = (err, req, res, next) => {
// Log the full error stack in the server console for debugging
console.error(err.stack);

// -------------------------
// 1. If headers are already sent, delegate to default Express error handler
// This prevents ERR_HTTP_HEADERS_SENT
// -------------------------
if (res.headersSent) {
return next(err);
}

// -------------------------
// 2. Handle validation errors (e.g., from express-validator)
// -------------------------
if (err?.errors) {
return res.status(400).json({
success: false,
message: 'Validation Error',
errors: err.errors.map(e => e.msg || e)
});
}

// -------------------------
// 3. Generic server error (500)
// -------------------------
res.status(500).json({
success: false,
message: 'Server Error',
error: err.message || 'Internal Server Error'
});
};

// ==================================================
// 4. 404 Not Found Handler
// Use this after all routes are defined in server.js
// ==================================================
export const notFoundHandler = (req, res, next) => {
res.status(404).json({
success: false,
message: `Route ${req.originalUrl} not found`
});
};



