const mongoose = require("mongoose");
const dbConfig = require("../config/databaseConfig");
const logger = require("../logger");

const uri = dbConfig.uri;
const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
};

async function connectDb() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    logger.info("Database successfully connected");
  } catch (error) {
    logger.error("Database connection error:", error);
  }
  // finally {
  //   // Ensures that the client will close when you finish/error
  //   await mongoose.disconnect();
  // }

  mongoose.connection.on("disconnected", () => {
    logger.warn("Mongoose disconnected from the database");
  });

  // Optional: Log any other Mongoose events you are interested in
  mongoose.connection.on("reconnected", () => {
    logger.info("Mongoose reconnected to the database");
  });

  mongoose.connection.on("close", () => {
    logger.info("Mongoose connection closed");
  });
}

module.exports = connectDb;
