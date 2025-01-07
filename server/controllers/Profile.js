const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
const {convertSecondsToDuration} = require("../utils/secToDuration");
const mongoose = require("mongoose");

//Method for updating a profile
exports.updateProfile = async (request,response) => {
    try {
        // Get Data
        const {firstName = "", lastName = "", dateOfBirth = "", about = "", 
            contactNumber = "", gender = ""} = request.body;

        // Get userId
        const id = request.user.id;

        // Validation
        if(!firstName || !lastName || !dateOfBirth || !about || 
                !contactNumber || !gender) {
            return response.status(401).json({
                success:false,
                message:"All fields are required",
            });
        }

        // Find Profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        const user = await User.findByIdAndUpdate(id, {
            firstName,
            lastName,
        })
        await user.save();

        // Update the Profile fields
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;

        // Save the updated profile
        await profileDetails.save();

        // Find the updated user details
        const updatedUserDetails = await User.findById(id)
        .populate("additionalDetails")
        .exec();

        // Return response
        return response.status(200).json({
            success:true,
            message:"Profile updated successfully",
            updatedUserDetails,
        });
    }
    catch(error) {
        console.log(error);
        return response.status(500).json({
            success:false,
            error:error.message,
            message:"Internal Server Error",
        });
    }
}


// Delete Account
exports.deleteAccount = async (request,response) => {
    try {
        const id = request.user.id;

        // Validation
        const UserDetails = await User.findById({_id: id});
        if(!UserDetails) {
            return response.status(404).json({
                success:false,
                message:'User Not Found',
            });
        }

        // Delete Associated Profile with the User
        await Profile.findByIdAndDelete({
            _id: new mongoose.Types.ObjectId(UserDetails.additionalDetails)
        });

        // Unenroll user from the all enrolled courses
        for (const courseId of UserDetails.courses) {
            await Course.findByIdAndUpdate(
                courseId,
                {$pull:{studentsEnrolled: id}},
                {new:true}
            )
        }

        // Now Delete User
        await User.findByIdAndDelete({_id:id});

        // Return Response
        return response.status(200).json({
            success:true,
            message:'User Deleted Successfully',
        });

        await CourseProgress.deleteMany({userId: id});

    } catch(error) {
        console.error(error);
        return response.status(500).json({
            success:false,
            message:'User cannot be deleted successfully',
        });
    }
};


exports.getAllUserDetails = async (request,response) => {
    try {
        const id = request.user.id;

        // Get User Details and Validate them
        const userDetails = await User.findById(id)
            .populate("additionalDetails")
            .exec();
        console.log(userDetails);

        if(!userDetails) {
            return response.status(401).json({
                success:false,
                message:'Error getting user details while fetching data',
            })
        }

        // Return Response
        return response.status(200).json({
            success:true,
            message:'User Data Fetched Successfully',
            data:userDetails
        });

    }
    catch(error) {
        console.error(error);
        return response.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.updateDisplayPicture = async (request,response) => {
    try {
        const displayPicture = request.files.displayPicture;
        const userId = request.user.id;
        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        )
        console.log(image);

        const updatedProfile = await User.findByIdAndUpdate(
            {_id: userId},
            {image: image.secure_url},
            {new:true}
        )

        response.send({
            success:true,
            message: `Image Updated Successfully`,
            data: updatedProfile
        })

    } catch(error) {
        console.error(error);
        return response.status(500).json({
            success:false,
            message:error.message
        });
    }
}


exports.getEnrolledCourses = async (request,response) => {
    try {
        const userId = request.user.id;
        let userDetails = await User.findOne({
            _id:userId
        })
            .populate({
                path: "courses",
                populate: {
                    path: "courseContent",
                    populate: {
                        path: "subSection",
                    },
                },
            })
            .exec();
        
        userDetails = userDetails.toObject();
        var SubsectionLength = 0;
        for (var i=0; i<userDetails.courses.length; i++) {
            let totalDurationInSeconds = 0;
            SubsectionLength = 0;
            for (var j=0; j < userDetails.courses[i].courseContent.length; j++) {
                totalDurationInSeconds += userDetails.courses[i].courseContent[j]
                .subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
                userDetails.courses[i].totalDuration = convertSecondsToDuration(
                    totalDurationInSeconds
                )
                SubsectionLength += userDetails.courses[i].courseContent[j].subSection.length
            }

            let courseProgressCount = await CourseProgress.findOne({
                courseID: userDetails.courses[i]._id,
                userId: userId
            })
            courseProgressCount = courseProgressCount?.completedVideos.length
            if(SubsectionLength === 0) {
                userDetails.courses[i].progressPercentage = 100;

            } else {
                // To make it up to 2 decimal point
                const multiplier = Math.pow(10,2);
                userDetails.courses[i].progressPercentage = 
                    Math.round((courseProgressCount / SubsectionLength) * 100 * multiplier) / multiplier;
            }
        }

        if(!userDetails) {
            return response.status(400).json({
                success:false,
                message:`Could not find user with id: ${userDetails}`,
            })
        }

        return response.status(200).json({
            success:true,
            data:userDetails.courses
        })

    } catch(error) {
        return response.status(500).json({
            success:false,
            message:error.message
        });
    }
}


exports.instructorDashboard = async (request,response) => {
    try {
        const courseDetails = await Course.find({instructor: request.user.id});

        const courseData = courseDetails.map((course) => {
            const totalStudentsEnrolled = course.studentsEnrolled.length;
            const totalAmountGenerated = totalStudentsEnrolled * course.price;

            //Create a new object with the additional fields
            const courseDataWithStats = {
                _id: course._id,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                //Include other course properties as needed
                totalStudentsEnrolled,
                totalAmountGenerated,
            }

            return courseDataWithStats
        });

        return response.status(200).json({
            success:true,
            courses:courseData
        });

    } catch(error) {
        console.error(error);
        return response.status(500).json({
            success:false,
            message:"Server Error",
        });
    }
}