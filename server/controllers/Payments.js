const mongoose = require("mongoose");
const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = required("../mail/templates/courseEnrollmentEmail");

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (request,response) => {
    // Get courseId and userId
    const {course_id} = request.body;
    const userId = request.user.id;
    // Validation
    // Valid courseId
    if(!course_id) {
        return response.status(401).json({
            success:false,
            message:'Please provide valid course ID',
        });
    }
    // Valid courseDetails
    let course;
    try {
        course = await Course.findById(course_id);
        if(!course) {
            return response.status(404).json({
                success:false,
                message:'Could not find the course',
            });
        }

        // User already pay for the same course
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)) {
            return response.status(400).json({
                success:false,
                message:'Student is already enrolled in this course',
            });
        }
    }catch(error) {
        console.error(error);
        return response.status(500).json({
            success:false,
            message:error.message,
        });
    }

    // Order Create
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes: {
            courseId: course_id,
            userId,
        }
    };

    try {
        // Initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);
        // Return Response
        return response.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail:course.thumbnail,
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount,
        });

    }catch(error) {
        console.log(error);
        return response.status(403).json({
            success:false,
            message:'Could not initiate the order',
        });
    }
};

// Verify the Signature of Razorpay and Server
exports.verifySignature = async (request,response) => {
    const webhookSecret = "12345678";
    const signature = request.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(request.body));
    const digest = shasum.digest("hex");

    if(signature === digest) {
        console.log("Payment is Authorised");
        const {courseId, userId} = request.body.payload.payment.entity.notes;

        try {
            // FullFill the action
            
            // Find the course and enroll the student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                {_id:courseId},
                {$push:{studentsEnrolled:userId}},
                {new:true},
            );
            if(!enrolledCourse) {
                return response.status(500).json({
                    success:false,
                    message:'Course not found',
                });
            }
            console.log(enrolledCourse);
    
            // Find the student and add the course to their list in enrolled courses
            const enrolledStudent = await User.findOneAndUpdate(
                {_id:userId},
                {$push:{courses:courseId}},
                {new:true},
            );
            console.log(enrolledStudent);
    
            // Confirmation Mail Send
            const emailResponse = await mailSender(
                enrolledStudent.email,
                "Congratulations from CodeVerse",
                "Congratulations, you are onboarded into new CodeVerse Course",
            );
            console.log(emailResponse);
            return response.status(200).json({
                success:true,
                message:"Signature verified and Course enrolled",
            });

        }catch(error) {
            console.log(error);
            return response.status(500).json({
                success:false,
                message:error.message,
            });
        }
    }
    else {
        return response.status(404).json({
            success:false,
            message:'Invalid request, please try again',
        });
    }
}