const logger = require("../logger");

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message} | ${req.method} ${req.originalUrl}`);
  const status = err.statusCode || 500;
  const response = {
    message: err.message || "Internal Server Error",
  };

  if (err.details) {
    response.details = err.details;
  }

  res.status(status).json(response);
};

module.exports = errorHandler;
