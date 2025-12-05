import express from 'express'
import { Login, LogOut, signUp } from '../controllers/authController.js';

const authRouter = express.Router()

authRouter.post("/signup", signUp);
authRouter.post('/login',Login)
authRouter.get('/logout',LogOut)

export default authRouter;