const dbConfig = {
  uri: process.env.MONGODB_URI.replace("<username>", process.env.MONGODB_USER)
    .replace("<password>", process.env.MONGODB_PASSWORD)
    .replace("<db_name>", process.env.MONGODB_DB_NAME),
};

module.exports = dbConfig;
