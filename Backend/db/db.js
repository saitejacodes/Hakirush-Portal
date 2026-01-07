import mongoose from "mongoose";

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log("MongoDB Error:", error.message);
    process.exit(1);
  }
};

export default connectToDatabase;
