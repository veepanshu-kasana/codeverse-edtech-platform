const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const otpTemplate = require("../mail/templates/emailVerificationTemplate");
const {passwordUpdated} = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();

// Send OTP for Email Verification
exports.sendOTP = async (request,response) => {
    try {
        // Fetch email from request body
        const {email} = request.body;

        // Check if user already exist with that email
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
        // console.log("OTP Generated:", otp);

        // Check otp is unique or not
        let result = await OTP.findOne({otp: otp});
        // console.log("Result:", result);

        while(result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp: otp});
        }

        // Save OTP in database
        const otpPayload = {email, otp};

        // Create an entry for OTP
        const otpBody = await OTP.create(otpPayload);
        // console.log("OTP Body:", otpBody);

        // Send notification email - OTP Verification
        try {
            const emailResponse = await mailSender(
                email,
                "CodeVerse: Your OTP Verification Code",
                otpTemplate(otp)
            );
            // console.log("Email sent successfully:", emailResponse.response);
            
        }catch(error) {
            // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
            console.error("Error occured while sending email:", error);
            return response.status(500).json({
                success:false, 
                message:"Error occurred while sending email",
                error:error.message,
            });
        }

        // Return response successful
        response.status(200).json({
            success: true,
            message: 'OTP Sent Successfully',
            otp,
        })
    }
    catch(error) {
        console.log(error.message);
        return response.status(500).json({
            success:false,
            message:error.message,
        });
    }
};


//Signup controller for Registering Users
exports.signUp = async (request, response) => {
    try {
        // Destructure fields from the request body
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

        // Check if all details are valid
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
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
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1)
        // console.log(recentOtp)

        // Validate OTP
        recentOtpEntry = recentOtp[0];
        if(recentOtp.length === 0){
            // OTP Not Found for the Email
            return response.status(400).json({
                success:false,
                message:'Otp Not Found',
            });

        } else if(otp !== recentOtpEntry.otp){
            // Invalid OTP
            return response.status(400).json({
                success:false,
                message:'Invalid OTP',
            });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password,10);

        // Create the user
        const approved = accountType === "Instructor" ? false : true;

        // Create the Additional Profile entry in Database
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
            accountType:accountType,
            approved: approved,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        // Return Response
        return response.status(200).json({
            success:true,
            message:'User is registered successfully',
            user,
        });
    }
    catch(error) {
        console.error("Error during signup:", error);
        return response.status(500).json({
            success:false,
            message:'User cannot be registered, please try again!',
        });
    }
};


// Login controller for authenticating users
exports.login = async (request,response) => {
    try {
        // Get email and password data from request body
        const {email, password} = request.body;

        // Validation of Data - Check if email and password is missing!
        if(!email || !password){
            return response.status(400).json({
                success:false,
                message:'All fields are required, please try again!',
            });
        }

        // Check user exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user) {
            return response.status(401).json({
                success:false,
                message:'User is not registered, please singup to continue!',
            });
        }

        // Generate JWT token and compare password
        if(await bcrypt.compare(password,user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn:"24h",
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
        console.error(error);
        return response.status(500).json({
            success:false,
            message:'Loggin failed, please try again!',
        });
    }
};


// Controller for Changing Password
exports.changePassword = async(request,response) => {
    try {
        // Get user data from request user
        const userDetails = await User.findById(request.user.id);
    
        // Get oldPassword, newPassword, confirmNewPassword from request body
        const {oldPassword, newPassword} = request.body;
    
        // Valide Old Password
        const isPasswordMatch = await bcrypt.compare(oldPassword, userDetails.password);
        if(!isPasswordMatch) {
            // If old password does not match, return a 401 (Unauthorized) error
            return response.status(401).json({
                success:false,
                message:"The password is incorrect"
            });
        }
    
        // Update password in DB
        const encryptedPassword = await bcrypt.hash(newPassword,10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            request.user.id,
            {password:encryptedPassword},
            {new:true}
        );
    
        // Send notification email - Password updated
        try {
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                "Password for your account has been updated",
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            );
            // console.log("Email sent successfully:", emailResponse.response);
            
        }catch(error) {
            // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
            console.error("Error occured while sending email:", error);
            return response.status(500).json({
                success:false, 
                message:"Error occurred while sending email",
                error:error.message,
            });
        }
    
        // Return Response
        return response.status(200).json({
            success:true,
            message:"Password updated successfully",
        });

    }catch(error) {
        // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
        console.error("Error occurred while updating password:", error);
        return response.status(500).json({
            success:false,
            message:"Error occurred while updating password",
            error:error.message,
        });
    }
}