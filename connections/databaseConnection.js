const mongoose = require("mongoose");
const dbConfig = require("../config/databaseConfig");

const uri = dbConfig.uri;

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

async function connectDb() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.log(error.message);
  }
  // finally {
  //   // Ensures that the client will close when you finish/error
  //   await mongoose.disconnect();
  // }
}
//connectDb().catch(console.dir);
module.exports = connectDb;
