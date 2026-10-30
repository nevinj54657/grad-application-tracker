// Centralised error handler. Keeps internal error details out of API responses.
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;

  // Only log unexpected server errors - 4xx responses (validation, not found,
  // ownership checks) are expected application flow, not bugs.
  if (status >= 500) {
    console.error(err);
  }

  const message = status === 500 ? 'Something went wrong. Please try again.' : err.message;

  res.status(status).json({ error: message });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

module.exports = { errorHandler, notFoundHandler };
