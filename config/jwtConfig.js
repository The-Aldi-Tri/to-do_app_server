const jwtConfig = {
  secret_key: process.env.JWT_SECRET_KEY,
  access_key: process.env.JWT_ACCESS_KEY,
  refresh_key: process.env.JWT_REFRESH_KEY,
};

module.exports = jwtConfig;
