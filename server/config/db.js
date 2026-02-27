<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
<<<<<<< Updated upstream
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
=======
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB Connected: ${conn.connection.name}`);

  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
>>>>>>> Stashed changes
    process.exit(1);
  }
};

module.exports = connectDB;