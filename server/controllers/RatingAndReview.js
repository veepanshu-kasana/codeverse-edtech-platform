const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const mongoose = require("mongoose");

// Create Rating and Review
exports.createRating = async (request,response) => {
    try {
        // get user id
        const userId = request.user.id;

        // fetch data from request body
        const {rating, review, courseId} = request.body;

        // check if user is enrolled or not
        const courseDetails = await Course.findOne({
            _id:courseId,
            studentsEnrolled: {$elemMatch: {$eq: userId}},
        });
        if(!courseDetails) {
            return response.status(404).json({
                success:false,
                message:'You are not enrolled in this course',
            });
        }

        // check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
            user:userId,
            course:courseId,
        });
        if(alreadyReviewed) {
            return response.status(403).json({
                success:false,
                message:'You have already reviewed the course!',
            });
        }

        // create rating and review
        const ratingReview = await RatingAndReview.create({
            rating, review,
            course:courseId,
            user:userId,
        });

        // update this course with rating/review
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId}, {
            $push: {
                ratingAndReviews:ratingReview._id,
            }
        },
        {new:true});
        console.log(updatedCourseDetails);

        // return response
        return response.status(200).json({
            success:true,
            message:'Rating and Review created successfully',
            ratingReview,
        });
    }
    catch(error) {
        console.log(error);
        return response.status(500).json({
            success:false,
            message:error.message,
        });
    }
}


// getAverageRating
exports.getAverageRating = async (request,response) => {
    try {
        // Get Course ID
        const courseId = request.body.courseId;

        // Calculate average rating
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating: {$avg: "$rating"},
                }
            }
        ])

        // Return Rating 
        if(result.length > 0) {
            return response.status(200).json({
                success:true,
                averageRating: result[0].averageRating,
            })
        }

        // If no rating/review exist
        return response.status(200).json({
            success:true,
            message:'Average rating is 0, No ratings given till now',
            averageRating:0,
        });

    }catch(error) {
        console.log(error);
        return response.status(500).json({
            success:false,
            message:error.message,
        });
    }
}


// getAllRatingAndReviews
exports.getAllRating = async (request,response) => {
    try {
        const allReviews = await RatingAndReview.find({})
            .sort({rating: "desc"})
            .populate({
                path:"user",
                select:"firstName lastName email image",
            })
            .populate({
                path:"course",
                select:"courseName",
            })
            .exec();
            
        return response.status(200).json({
            success:true,
            message:'All reviews fetched successfully',
            data:allReviews,
        });

    }catch(error) {
        console.log(error);
        return response.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

