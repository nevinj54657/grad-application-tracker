// Protects routes that require an authenticated user.
// Reads req.session.userId, set by the auth controller on login/register.
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'You must be logged in to do that.' });
  }
  req.userId = req.session.userId;
  next();
}

module.exports = requireAuth;
