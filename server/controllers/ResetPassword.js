const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

//resetPasswordToken
exports.resetPasswordToken = async (request,response) => {
    try {
        // Get email from request body
        const {email} = request.body;

        // Check user exist for this email, email verification
        const user = await User.findOne({email:email});
        if(!user) {
            return response.status(403).json({
                success:false,
                message:'User does not exist, Please signup first!',
            });
        }

        // Generate Token
        const token = crypto.randomUUID();

        // Update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate({email:email},
                {token:token,resetPasswordExpires:Date.now() + 5*60*1000},
                    {new:true});

        // Create URL
        const url = `http://localhost:3000/update-password/${token}`

        // Send mail containing the url
        await mailSender(email,"Password Reset",`Password Reset Link: ${url}`);

        // Return Response
        return response.status(200).json({
            success:true,
            message:'Email sent successfully, please check your email!',
        });
    }
    catch(error) {
        console.log(error);
        return response.status(500).json({
            success:false,
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
                message:"Password do not match",
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
                message:'Token is expired, please regenerate your token',
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
    }
    catch(error) {
        console.log(error);
        return response.status(500).json({
            success:false,
            message:'Something went wrong, while resetting password!',
        });
    }
}