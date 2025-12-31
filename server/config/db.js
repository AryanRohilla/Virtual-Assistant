import mongoose from 'mongoose';

// Cache the connection to reuse in serverless
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDb = async()=>{
    try {
        if(!process.env.MONGODB_URL){
            throw new Error("MONGODB_URL is not defined in environment variables")
        }

        // If already connected, return the existing connection
        if (cached.conn) {
            return cached.conn;
        }

        // If connection is in progress, wait for it
        if (!cached.promise) {
            const opts = {
                bufferCommands: false,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            };

            cached.promise = mongoose.connect(process.env.MONGODB_URL, opts).then((mongoose) => {
                console.log("Database connected successfully");
                return mongoose;
            });
        }

        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        cached.promise = null; // Reset promise on error
        console.error("Database connection error:", error);
        throw error; // Re-throw to handle in middleware
    }
}

export default connectDb;