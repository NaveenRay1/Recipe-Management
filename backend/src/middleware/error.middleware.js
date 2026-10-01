const ApiError = require("../utils/ApiError");

const notFound = (req, res, next) =>
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));

const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || "Server error";
  let errors = err.errors;

  if (err.name === "SequelizeUniqueConstraintError") {
    status = 409;
    message = "Already exists";
    errors = err.errors.map((e) => e.message);
  } else if (err.name === "SequelizeValidationError") {
    status = 400;
    message = "Validation failed";
    errors = err.errors.map((e) => e.message);
  } else if (
    err.name === "SequelizeDatabaseError" &&
    /invalid input syntax/i.test(err.message)
  ) {
    status = 400;
    message = "Invalid id or parameter";
    errors = undefined;
  } else if (err.name === "MulterError") {
    status = 400;
  }

  if (status === 500) {
    console.error(err);
    if (process.env.NODE_ENV === "production") message = "Internal server error";
  }

  res.status(status).json({ success: false, message, errors });
};

module.exports = { notFound, errorHandler };