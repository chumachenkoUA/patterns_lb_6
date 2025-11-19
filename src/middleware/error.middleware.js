const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

const notFoundHandler = (req, res, next) =>
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });

module.exports = {
  errorHandler,
  notFoundHandler,
};
