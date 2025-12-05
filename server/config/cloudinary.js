import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

const uplaodOnCloudinary = async(filePath)=>{
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

    try {
        // Upload an image
        const uploadResult = await cloudinary.uploader
        .upload(filePath)
        fs.unlinkSync(filePath) // Remove file from server after upload
        return uploadResult.secure_url
    } catch (error) {
        fs.unlinkSync(filePath) // Remove file from server if upload fails
        return res.status(500).json({message:"cloudinary error"})
    }
}

export default uplaodOnCloudinary;