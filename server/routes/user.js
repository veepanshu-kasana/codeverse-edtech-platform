//Import the required modules
const express = require("express");
const router = express.Router();

//Import the required controllers and middleware functions
const {login, signup, sendotp, changePassword} = required("../controllers/Auth");

const {resetPasswordToken, resetPassword} = require("../controllers/ResetPassword");

const {auth} = require("../middlewares/auth");

//Routes for Login, Signup, and Authentication
// *************************************************************************
//                          Authentication routes
// *************************************************************************

//Routes for user login
router.post("/login", login);
//Routes for user signup
router.post("/signup", signup);
//Routes for sending OTP to the user's email
router.post("/sendotp", sendotp);
//Routes for changing the password
router.post("/changepassword", auth, changePassword);

// *************************************************************************
//                            Reset Password
// *************************************************************************

// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken);
//Route for resetting user's password after verification
router.post("/reset-password", resetPassword);

//Export the router for use in the main application
module.exports = router; 