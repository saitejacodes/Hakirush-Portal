import mongoose from "mongoose";

const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("MongoDB Connected");
        
    } catch (error) {
        console.log(error);
    }
}

export default connectToDatabase