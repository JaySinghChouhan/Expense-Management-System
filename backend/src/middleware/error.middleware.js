exports.notFound = (req, res, _next) => res.status(404).json({ success:false, message:`Route not found: ${req.originalUrl}` });
exports.errorHandler = (err, _req, res, _next) => {
  console.error(err);
  if (err.name === "ValidationError") return res.status(400).json({ success:false, message:err.message });
  if (err.code === 11000) return res.status(409).json({ success:false, message:"Email already exists" });
  if (err.name === "CastError") return res.status(400).json({ success:false, message:"Invalid resource ID" });
  const status = err.status || 500;
  const message = status >= 500 && process.env.NODE_ENV === "production"
    ? "Internal server error"
    : (err.message || "Internal server error");
  res.status(status).json({ success:false, message });
};
