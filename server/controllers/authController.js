import User from "../models/userModel.js";
import bcrypt from "bcryptjs"
import genToken from '../config/token.js'
import mongoose from 'mongoose'

const signUp = async(req, res)=>{
    try {
        // Check database connection before operations
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({
                message: "Database not connected. Please try again in a moment."
            });
        }

        const {name,email, password} = req.body;

        const existEmail = await User.findOne({email})
        if(existEmail){
            return res.status(400).json({message:'email is already exists'})
        }

        if(password.length < 6){
            return res.status(400).json({message:"password must be at least 6 characters !"})
        }

        const hashedPassword = await bcrypt.hash(password,10)
        
        const user = await User.create({
            name,password:hashedPassword,email
        })

        const token = genToken(user._id)

        const isProd = process.env.NODE_ENV === "production";

        res.cookie("token",token,{
            httpOnly:true,
            maxAge:7*24*60*60*1000,
            sameSite:isProd ? "none" : "lax",
            secure:isProd,
        })

        return res.status(201).json(user)

    } catch (error) {
        console.error("Sign up error:", error);
        const errorMessage = error.message || String(error);
        console.error("Error details:", {
            message: errorMessage,
            stack: error.stack,
            name: error.name
        });
        return res.status(500).json({
            message: `sign up error: ${errorMessage}`,
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        })
    }
}

const Login = async(req, res)=>{
    try {
        // Check database connection before operations
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({
                message: "Database not connected. Please try again in a moment."
            });
        }

        const {email, password} = req.body;
        console.log("Login request for:", email);

        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message:'email does not exists'})
        }

        const isMatch = await bcrypt.compare(password,user.password)

        if(!isMatch){
            return res.status(400).json({message:"incorrect password"})
        }

        const token = genToken(user._id)

        const isProd = process.env.NODE_ENV === "production";

        res.cookie("token",token,{
            httpOnly:true,
            maxAge:7*24*60*60*1000,
            sameSite:isProd ? "none" : "lax",
            secure:isProd,
        });

        return res.status(200).json(user)

    } catch (error) {
        console.error("Login error:", error);
        const errorMessage = error.message || String(error);
        console.error("Error details:", {
            message: errorMessage,
            stack: error.stack,
            name: error.name
        });
        return res.status(500).json({
            message: `login error: ${errorMessage}`,
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        })
    }
}

const LogOut = async (req,res)=>{
    try {
        res.clearCookie("token")
        return res.status(200).json({message:"logout successfully"})
    } catch (error) {
        return res.status(500).json({message:`logout error ${error}`})
    }
}

export {signUp, Login, LogOut}