import mongoose from 'mongoose';

const connectDb = async()=>{
    try {
        if(!process.env.MONGODB_URL){
            throw new Error("MONGODB_URL is not defined in environment variables")
        }
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Database connect successfully")
    } catch (error) {
        console.error("Database connection error:", error);
        // Don't throw here to allow server to start, but log the error
        // The actual operations will fail if DB is not connected
    }
}

export default connectDb;