import jwt from "jsonwebtoken"

const isAuth = async(req,res,next)=>{
    try {
        const token = req.cookies.token
        if(!token){
            return res.status(401).json({message:"token not found"})
        }

        const verifyToken = await jwt.verify(token,process.env.JWT_SECRET)
        req.userId = verifyToken.userId
        next()

    } catch (error) {
        console.log(error)
        // JWT verification errors (expired, invalid) should return 401
        if(error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError'){
            return res.status(401).json({message:"Invalid or expired token"})
        }
        return res.status(500).json({message:"is Auth error"})
    }
}

export default isAuth