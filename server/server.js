import express from 'express'
import dotenv from 'dotenv'
dotenv.config() 
import mongoose from 'mongoose'
import connectDb from './config/db.js'
import cookieParser from 'cookie-parser'
import authRouter from './routes/authRoutes.js'
import cors from 'cors'
import userRouter from './routes/userRoutes.js'


const app = express()
app.set('trust proxy',1);

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [
            'https://virtual-assistant-teal.vercel.app',
            'https://virtual-assistant-8heq.vercel.app',
            process.env.CLIENT_URL
          ].filter(Boolean) // Remove undefined values
        : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
}))
const PORT=process.env.PORT || 5000
app.use(express.json())
app.use(cookieParser())

// Connect to database on startup (for both local and serverless)
let dbConnected = false;
connectDb()
    .then(() => {
        dbConnected = true;
        console.log("Database connected successfully");
    })
    .catch(err => {
        console.error("Failed to connect to database:", err);
    });

// Middleware to ensure database is connected (before routes)
app.use(async (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        try {
            await connectDb();
            dbConnected = true;
        } catch (error) {
            console.error("Database connection error in middleware:", error);
            return res.status(500).json({
                message: "Database connection failed. Please check MONGODB_URL environment variable.",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    next();
});

app.use("/api/auth",authRouter)
app.use("/api/user", userRouter)

app.get('/', (req, res) => {
  res.send('Virtual Assistant backend is running ✅');
});

// Global error handler middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// For Vercel serverless functions - export as handler
const handler = app;
export default handler;

// For local development
if(process.env.NODE_ENV !== 'production' || !process.env.VERCEL){
    app.listen(PORT,()=>{
        connectDb()
        console.log(`Server is running on port ${PORT}`)
    })
}