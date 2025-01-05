const mongoose = require("mongoose");
const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const crypto = require("crypto");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const {paymentSuccessEmail} = require("../models/CourseProgress");
const CourseProgress = require("../models/CourseProgress");

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (request,response) => {
    // Get courses and userId
    const {courses} = request.body;
    const userId = request.user.id;

    // Validate courses
    if(courses.length === 0) {
        return response.status(401).json({
            success:false,
            message:'Please provide valid course ID',
        });
    }

    let total_amount = 0;
    for(const course_id of courses) {
        let course;
        try {
            // Find the course by its ID
            course = await Course.findById(course_id);
            // If the course is not found, return an error
            if(!course) {
                return response.status(404).json({
                    success:false,
                    message:'Could not find the course',
                });
            }
    
            // Check if the user is already enrolled in the course
            const uid = new mongoose.Types.ObjectId(userId);
            if(course.studentsEnrolled.includes(uid)) {
                return response.status(400).json({
                    success:false,
                    message:'Student is already enrolled in this course',
                });
            }

            // Add the price of the course to the total amount
            total_amount += course.price;

        }catch(error) {
            console.error(error);
            return response.status(500).json({
                success:false,
                message:error.message,
            });
        }
    }

    const options = {
        amount: total_amount * 100,
        currency: "INR",
        receipt: Math.random(Date.now()).toString()
    };

    try {
        // Initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);
        // Return Response
        return response.status(200).json({
            success:true,
            data: paymentResponse
        });

    }catch(error) {
        console.log(error);
        return response.status(500).json({
            success:false,
            message:'Could not initiate the order',
        });
    }
};


// Verify the payment
exports.verifyPayment = async (request,response) => {
    const razorpay_order_id = request.body?.razorpay_order_id;
    const razorpay_payment_id = request.body?.razorpay_payment_id;
    const razorpay_signature = request.body?.razorpay_signature;
    const courses = request.body?.courses;

    const userId = request.user.id;

    if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userId) {
        return response.status(400).json({
            success:false,
            message:"Payment Failed",
        });
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex")

    if(expectedSignature === razorpay_signature) {
        await enrollStudents(courses, userId, response)
        return response.status(200).json({
            success:true,
            message:"Payment Verified"
        });
    }

    return response.status(400).json({
        success:false,
        message:"Payment Failed"
    });
};


// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (request,response) => {
    const {orderId, paymentId, amount} = request.body;
    const userId = request.user.id;

    if(!orderId || !paymentId || !amount || !userId) {
        return response.status(400).json({
            success:false,
            message:"Please provide all the details"
        });
    }

    try {
        const enrolledStudent = await User.findById(userId);
        await mailSender(
            enrolledStudent.email,
            `Payment Received`,
            paymentSuccessEmail(
                `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
                amount / 100,
                orderId,
                paymentId
            )
        )

    } catch(error) {
        console.log("Error in sending mail", error);
        return response.status(400).json({
            success:false,
            message:"Could not send email",
        });
    }
}


//Enroll the student in the courses
const enrollStudents = async (courses, userId, response) => {
    if(!courses || !userId) {
        return response.status(400).json({
            success:false,
            message:"Please provide courseId and userId"
        });
    }

    for(const courseId of courses) {
        try {
            //Find the course and enroll the student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                {_id: courseId},
                {$push: {studentsEnrolled: userId}},
                {new:true}
            )

            if(!enrolledCourse) {
                return response.status(500).json({
                    success:false,
                    error:"Course not found"
                })
            }
            console.log("Updated course: ", enrolledCourse);

            const courseProgress = await CourseProgress.create({
                courseID:courseId,
                userId:userId,
                completedVideos:[]
            })

            //Find the student and add the course to their list of enrolled courses
            const enrolledStudent = await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        courses:courseId,
                        courseProgress:courseProgress._id,
                    },
                },
                {new:true}
            )

            console.log("Enrolled Student: ", enrolledStudent);

            //Send an email notification to the enrolled student
            const emailResponse = await mailSender(
                enrolledStudent.email,
                `Successfully Enrolled into ${enrolledCourse.courseName}`,
                courseEnrollmentEmail(
                    enrolledCourse.courseName,
                    `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
                )
            )

            console.log("Email sent successfully: ", emailResponse.response);

        } catch(error) {
            console.log(error);
            return response.status(400).json({
                success:false,
                error:error.message
            });
        }
    }
}