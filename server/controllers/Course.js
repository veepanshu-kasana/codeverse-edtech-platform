const Course = require("../models/Course")
const Category = require("../models/Category");
const User = require("../models/User");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
const CourseProgress = require("../models/CourseProgress");
const {convertSecondsToDuration} = require("../utils/secToDuration");

// CreateCourse handler function to create a new course
exports.createCourse = async (request,response) => {
    try {
        // Fetch Data - Get all require fields
        const {courseName, courseDescription, whatYouWillLearn, price, category, tag:_tag, 
            status, instructions: _instructions} = request.body;

        // Get thumbnail image from request files
        const thumbnail = request.files.thumbnailImage;

        // Convert the tag and instructions from stringified Array to Array
        const tag = JSON.parse(_tag);
        const instructions = JSON.parse(_instructions);
        console.log("tag", tag);
        console.log("instructions", instructions);

        // Validation - Check if any of the required fields are missing
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag.length ||
            !thumbnail || !category || !instructions.length) {
            return response.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }
        if(!status || status === undefined) {
            status = "Draft"
        }

        // Check if the user is Instructor
        const userId = request.user.id;
        const instructorDetails = await User.findById(userId,{
            accountType: "Instructor",
        });
        console.log("Instructor Details:", instructorDetails);

        if(!instructorDetails) {
            return response.status(404).json({
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
        const thumbnailImage = await uploadImageToCloudinary(
            thumbnail, process.env.FOLDER_NAME
        );

        // Create a new course with given details
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            price,
            tag,
            category:categoryDetails._id,
            thumbnail:thumbnailImage.secure_url,
            status:status,
            instructions,
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

        // Add the new course to the category schema
        const categoryDetails2 = await Category.findByIdAndUpdate(
            {_id: category},
            {
                $push: {
                    courses: newCourse._id,
                },
            },
            {new:true}
        )
        console.log("New course added to the categories:", categoryDetails2);

        // Return a new course and response
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
        });
    }
}

// GetAllCourses handler function
exports.showAllCourses = async (request,response) => {
    try {
        const allCourses = await Course.find(
            {status: "Published"}, 
            {
                courseName:true,
                courseDescription:true,
                price:true,
                thumbnail:true,
                instructor:true,
                ratingAndReviews:true,
                studentsEnrolled:true,
            }
        ).populate("instructor").exec();

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

// GetCourseDetails handler function
exports.getCourseDetails = async (request,response) => {
    try {
        // Get course Id
        const {courseId} = request.body;
        
        // Find course details
        const courseDetails = await Course.findOne({_id:courseId})
            .populate({path:"instructor", 
                populate:{
                    path:"additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path:"courseContent",
                populate:{
                    path:"subSection",
                    select: "-videoUrl",
                },
            })
            .exec();
        
        // Validation - If course details doesn't exist
        if(!courseDetails) {
            return response.status(400).json({
                success:false,
                message:`Could not find the course with ${courseId}`,
            });
        }

        let totalDurationInSeconds = 0;
        courseDetails.courseContent.forEach((content) => {
            content.SubSection.forEach((SubSection) => {
                const timeDurationInSeconds = parseInt(SubSection.timeDuration);
                totalDurationInSeconds += timeDurationInSeconds;
            });
        })
        const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

        // Return Response
        return response.status(200).json({
            success:true,
            message:'Course details fetched successfully',
            data:{
                courseDetails,
                totalDuration,
            },
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

//Edit course details handler function
exports.editCourse = async (request, response) => {
    try {

    } catch(error) {

    }
}