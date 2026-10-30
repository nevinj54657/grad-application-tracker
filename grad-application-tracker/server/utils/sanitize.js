// Strips server-only fields from a User record before it is sent to the client.
function toSafeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

module.exports = { toSafeUser };
