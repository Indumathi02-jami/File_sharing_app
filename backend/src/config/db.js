const mongoose = require("mongoose");

const connectDatabase = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error("MONGO_URI is missing from environment variables.");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
};

module.exports = connectDatabase;
