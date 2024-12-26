const Course = require("../models/Course")
const Category = require("../models/Category");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

// createCourse handler function
exports.createCourse = async (request,response) => {
    try {
        // Fetch Data
        const {courseName, courseDescription, whatYouWillLearn, price, category} = request.body;

        // Get thumbnail
        const thumbnail = request.files.thumbnailImage;

        // Validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category) {
            return response.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }

        // Check for Instructor
        const userId = request.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details:", instructorDetails);

        if(!instructorDetails) {
            return response.status(400).json({
                success:false,
                message:'Instructor details not found',
            });
        }

        // Check given category is valid or not
        const categoryDetails = await Category.findById(category);
        if(!categoryDetails) {
            return response.status(404).json({
                success:false,
                message:'Category details not found',
            });
        }

        // Upload image to Cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // Create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn,
            price,
            category:categoryDetails._id,
            thumbnail:thumbnailImage.secure_url,
        });

        // Add the new course to the user schema of Instructor
        await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {new:true},
        );

        // Update the category ka schema

        // Return response
        return response.status(200).json({
            success:true,
            message:'Course Created Successfully',
            data:newCourse,
        });
    }
    catch(error) {
        console.log(error);
        return response.status(500).json({
            success:false,
            message:'Failed to create new course!',
            error:error.message,
        })
    }
}

// getAllCourses handler function
exports.showAllCourses = async (request,response) => {
    try {
        const allCourses = await Course.find({}, {
            courseName:true,
            courseDescription:true,
            thumbnail:true,
            instructor:true,
            ratingAndReviews:true,
            studentsEnrolled:true,
        }).populate("instructor").exec();

        return response.status(200).json({
            success:true,
            message:'All courses are fetched successfully',
            data:allCourses,
        })
    }
    catch(error) {
        console.log(error);
        return response.status(500).json({
            success:false,
            message:'Cannot fetch courses data!',
            error:error.message,
        });
    }
}