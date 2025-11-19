const ROLES = Object.freeze({
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
});

module.exports = {
  ROLES,
  ALLOWED_ROLES: Object.values(ROLES),
};
