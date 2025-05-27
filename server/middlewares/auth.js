// Importing required modules
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");
// Configuring dotenv to load environment variables from .env file
// dotenv.config();

// This function is used as middleware to authenticate user requests
exports.auth = async (request,response,next) => {
    try {
        // Extract token
        const token = request.cookies.token || request.body.token || request.header("Authorization").replace("Bearer ","");

        // If JWT token is missing, then return 401 Unauthorized response
        if(!token) {
            return response.status(401).json({
                success:false,
                message:'Token is missing',
            });
        }

        // Verifying the JWT using the secret key stored in environment variables
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            // console.log(decode);
            request.user = decode;
        }
        catch(error) {
            // If JWT verification fails, return 401 Unauthorized response
            return response.status(401).json({
                success:false,
                message:'Token is invalid!',
            });
        }
        next();

    }
    catch(error) {
        // If there is an error during the authentication process, return 401 Unauthorized response
        return response.status(401).json({
            success:false,
            message:'Something went wrong, while validating the token',
        })
    }
}


// isStudent
exports.isStudent = async (request,response,next) => {
    try {
        if(request.user.accountType !== "Student") {
            return response.status(401).json({
                success:false,
                message:'This is a protected route for Students only',
            });
        }
        next();
    }
    catch(error) {
        return response.status(500).json({
            success:false,
            message:'User role cannot be verified, please try again',
        });
    }
};

// isInstructor
exports.isInstructor = async (request,response,next) => {
    try {
        if(request.user.accountType !== "Instructor") {
            return response.status(401).json({
                success:false,
                message:'This is a protected route for Instructor only',
            });
        }
        next();
    }
    catch(error) {
        return response.status(500).json({
            success:false,
            message:'User role cannot be verified, please try again',
        });
    }
};


// isAdmin
exports.isAdmin = async (request,response,next) => {
    try {
        if(request.user.accountType !== "Admin") {
            return response.status(401).json({
                success:false,
                message:'This is a protected route for Admin only',
            });
        }
        next();
    }
    catch(error) {
        return response.status(500).json({
            success:false,
            message:'User role cannot be verified, please try again',
        });
    }
};