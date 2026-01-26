const multerErrorHandler = (err, req, res, next) => {
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      error: "Image size must be less than 10MB",
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  next();
};

export default multerErrorHandler;