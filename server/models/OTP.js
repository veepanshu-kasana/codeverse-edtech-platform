const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5*60, // The document will be automatically deleted after 5 minutes of its creation time
    },
});

// Define a function to send a verification email
async function sendVerificationEmail(email,otp) {
    try {
        const mailResponse = await mailSender(email,"Verification Email from CodeVerse", emailTemplate(otp));
        console.log("Email Sent Successfully:", mailResponse.response); 
    }
    catch(error) {
        console.log("Error occured while sending mails", error);
        throw error;
    }
}

// Define a save hook to send email
OTPSchema.pre("save", async function(next){
    console.log("New document saved to database");
    
    // Only send email when a new document is created
    if(this.isNew) {
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
});

module.exports = mongoose.model("OTP", OTPSchema);