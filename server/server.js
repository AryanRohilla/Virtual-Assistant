import express from 'express'
import dotenv from 'dotenv'
dotenv.config() 
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
app.use("/api/auth",authRouter)
app.use("/api/user", userRouter)

app.get('/', (req, res) => {
  res.send('Virtual Assistant backend is running ✅');
});

app.listen(PORT,()=>{
    connectDb()
    console.log(`Server is running on port ${PORT}`)
})