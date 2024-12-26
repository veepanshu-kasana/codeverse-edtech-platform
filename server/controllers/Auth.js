const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// sendOTP
exports.sendOTP = async (request,response) => {
    try {
        // Fetch email from request body
        const {email} = request.body;

        // Check if user already exist
        const checkUserPresent = await User.findOne({email});

        // If user already exist, then return a response
        if(checkUserPresent) {
            return response.status(401).json({
                success: false,
                message: "User Already Registered!",
            })
        }

        // Generate OTP
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP Generated:", otp);

        // Check otp is unique or not
        let result = await OTP.findOne({otp: otp});

        while(result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp: otp});
        }

        const otpPayload = {email, otp};

        // Create an entry for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        // Return response successful
        response.status(200).json({
            success: true,
            message: 'OTP Sent Successfully',
            otp,
        })
    }
    catch(error) {
        console.log(error);
        return response.status(500).json({
            success:false,
            message:error.message,
        })
    }
};


// signUp
exports.signUp = async (request, response) => {
    try {
        // Data fetch from request ki body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber, 
            otp
        } = request.body;

        // Validate karlo
        if(!firstName || !lastName || !email || !password || confirmPassword || !otp) {
            return response.status(403).json({
                success:false,
                message:"All fields are required!",
            })
        }

        // Match both the passwords i.e. password && confirmPassword
        if(password !== confirmPassword) {
            return response.status(400).json({
                success:false,
                message:'Password do not match, please try again!',
            });
        }

        // Check user already exist or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return response.status(400).json({
                success:false,
                message:'User Already Registered!',
            });
        }

        // Find most recent OTP stored for the user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);
        // Validate OTP
        if(recentOtp.length == 0){
            // OTP Not Found
            return response.status(404).json({
                success:false,
                message:'Otp Not Found',
            });
        } else if(otp !== recentOtp.otp){
            // Invalid OTP
            return response.status(400).json({
                success:false,
                message:'Invalid OTP',
            });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password,10);

        // Create entry in Database
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstname} ${lastname}`,
        });

        // Return Response
        return response.status(200).json({
            success:true,
            message:'User is registered successfully',
            user,
        });
    }
    catch(error) {
        console.log(error);
        return response.status(500).json({
            success:false,
            message:'User cannot be registered, please try again!',
        })
    }

}


// Login
exports.login = async (request,response) => {
    try {
        // Get data from request body
        const {email, password} = request.body;

        // Validation of Data
        if(!email || !password){
            return response.status(403).json({
                success:false,
                message:'All fields are required, please try again!',
            });
        }

        // Check user exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user) {
            return response.status(401).json({
                success:false,
                message:'User is not registered, please singup!',
            });
        }

        // Generate JWT, after password matching
        if(await bcrypt.compare(password,user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn:"2h",
            });
            user.token = token;
            user.password = undefined;

            // Create cookie and send response
            const options = {
                expiresIn: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            response.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in successfully",
            })
        }
        else {
            return response.status(401).json({
                success:false,
                message:'Password is incorrect!',
            });
        }
    }
    catch(error) {
        console.log(error);
        return response.status(500).json({
            success:false,
            message:'Loggin failed, please try again!',
        });
    }
};


// changePassword
exports.changePassword = async(request,response) => {
    // Get data from request body
    // Get oldPassword, newPassword, confirmNewPassword
    // Validation

    // Update pwd in DB
    // Send mail - Password updated
    // Return Response
}