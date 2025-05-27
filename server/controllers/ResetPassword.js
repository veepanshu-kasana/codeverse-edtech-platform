const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

//resetPasswordToken
exports.resetPasswordToken = async (request,response) => {
    try {
        // Get email from request body
        const {email} = request.body;

        // Check user exist for this email, email verification
        const user = await User.findOne({email:email});
        if(!user) {
            return response.status(402).json({
                success:false,
                message:`This Email: ${email} is not Registered With Us Enter a Valid Email`,
            });
        }

        // Generate Token
        const token = crypto.randomBytes(20).toString("hex");

        // Update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
            {email:email},
            {
                token:token,
                resetPasswordExpires:Date.now() + 3600000,
            },       
            {new:true});
        // console.log("DETAILS", updatedDetails);

        // Create URL
        // const url = `http://localhost:3000/update-password/${token}`
        const url = `https://codeverse-edtech-platform.vercel.app/update-password/${token}`

        // Send mail containing the url
        await mailSender(
            email,
            "Password Reset",
            `Your Link for email verification is ${url}. Please click this url to reset your password.`
        );

        // Return Response
        return response.status(200).json({
            success:true,
            message:'Email Sent Successfully, Please Check Your Email to Continue Further',
        });
    }
    catch(error) {
        console.log(error);
        return response.status(500).json({
            success:false,
            error:error.message,
            message:'Something went wrong, while sending password reset mail.'
        })
    }
}

// resetPassword
exports.resetPassword = async (request,response) => {
    try {
        //Data fetch
        const {password,confirmPassword,token} = request.body;

        // Validation
        if(password !== confirmPassword) {
            return response.status(401).json({
                success:false,
                message:"Both the Passwords do not Match",
            });
        }

        // Get userDetails from DB using token
        const userDetails = await User.findOne({token:token});

        // If no entry - invalid token
        if(!userDetails) {
            return response.status(403).json({
                success:false,
                message:'Token is invalid',
            });
        }

        // Token time check
        if(userDetails.resetPasswordExpires < Date.now()) {
            return response.status(401).json({
                success:false,
                message:'Token is Expired, Please Regenerate Your Token',
            });
        }

        // Hashed Password
        const hashedPassword = await bcrypt.hash(password,10);

        // Password Update
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true},
        );

        // Return Response
        return response.status(200).json({
            success:true,
            message:'Password reset successful',
        });
        
    } catch(error) {
        console.log(error);
        return response.status(500).json({
            success:false,
            message:'Something went wrong, while resetting password!',
            error:error.message
        });
    }
}