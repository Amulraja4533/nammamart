
const mongoose = require('mongoose');

/**
 * Establishing connection to MongoDB Atlas
 * Uses MONGO_URI from environment variables for security
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`NammaMart Database Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
