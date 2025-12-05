import express from 'express'
import { askToAssistant, getCurrentUser, updateAssistant } from '../controllers/userController.js';
import isAuth from '../middlewares/isAuth.js';
import upload from '../middlewares/multer.js';

const userRouter = express.Router()

userRouter.get("/current", isAuth, getCurrentUser)
userRouter.post("/update", isAuth, upload.single('AssistantImage'), updateAssistant)
userRouter.post('/askToAssistant',isAuth, askToAssistant)

export default userRouter;  