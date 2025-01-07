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
        console.error(error);
        return response.status(500).json({
            success:false,
            message:'Failed to create new course!',
            error:error.message,
        });
    }
}


// GetAllCourses handler function
exports.getAllCourses = async (request,response) => {
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
        const {courseId} = request.body;
        const updates = request.body;
        const course = await Course.findById(courseId);

        if(!course){
            return response.status(404).json({error: "Course not found"});
        }

        //If Thumbnail Image is found, update it
        if(request.files) {
            console.log("Thumbnail Update");
            const thumbnail = request.files.thumbnailImage;
            const thumbnailImage = await uploadImageToCloudinary(
                thumbnail, 
                process.env.FOLDER_NAME
            )
            course.thumbnail = thumbnailImage.secure_url;
        }

        //Update only the fields that are present in the request body
        for(const key in updates) {
            if(updates.hasOwnProperty(key)) {
                if(key == "tag" || key == "instructions") {
                    course[key] = JSON.parse(updates[key]);
                }
                else{
                    course[key] = updates[key];
                }
            }
        }

        await course.save();

        const updatedCourse = await Course.findOne({
            _id:courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec();

        response.status(200).json({
            success:true,
            message:"Course updated successfully",
            data: updatedCourse,
        });

    } catch(error) {
        console.error(error);
        response.status(500).json({
            success:false,
            message:"Internal server error",
            error: error.message,
        });
    }
}


exports.getFullCourseDetails = async (request,response) => {
    try {
        const {courseId} = request.body;
        const userId = request.user.id;

        const courseDetails = await Course.findOne({
            _id: courseId,
        })
        .populate({
            path:"instructor",
            populate: {
                path:"additionalDetails",
            },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
            path:"courseContent",
            populate: {
                path: "subSection",
            },
        })
        .exec();

        let courseProgressCount = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        });
        console.log("Course Progress Count: ", courseProgressCount);

        if(!courseDetails) {
            return response.status(400).json({
                success:false,
                message: `Could not find course with id: ${courseId}`,
            });
        }

        let totalDurationInSeconds = 0;
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration);
                totalDurationInSeconds += timeDurationInSeconds;
            })
        });
        const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

        return response.status(200).json({
            success:true,
            data: {
                courseDetails,
                totalDuration,
                completedVideos: courseProgressCount?.completedVideos
                ? courseProgressCount?.completedVideos : [],
            },
        });

    } catch(error) {
        return response.status(500).json({
            success:false,
            message:error.message,
        });
    }
}


//Get a list of Courses for a given Instructor
exports.getInstructorCourses = async(request,response) => {
    try {
        //Get the instructor ID from the authenticated user or request body
        const instructorId = request.user.id;

        //Find all the courses belonging to the instructor
        const instructorCourses = await Course.find({
            instructor:instructorId,
        }).sort({createdAt: -1});

        //Return the instructor's course
        return response.status(200).json({
            success:true,
            data: instructorCourses,
        });

    } catch(error) {
        console.error(error);
        return response.status(500).json({
            success:false,
            message:"Failed to retrieve instructor courses",
            error:error.message,
        });
    }
}


//Delete the Course
exports.deleteCourse = async (request,response) => {
    try {
        const {courseId} = request.body;

        //Find the course
        const course = await Course.findById(courseId);
        if(!course) {
            return response.status(404).json({message:"Course not found"});
        }

        //Unenroll students from the course
        const studentsEnrolled = course.studentsEnrolled;
        for(const studentId of studentsEnrolled) {
            await User.findByIdAndUpdate(studentId, {
                $pull: {courses: courseId},
            })
        }

        //Delete sections and sub-sections
        const courseSections = course.courseContent;
        for(const sectionId of courseSections) {
            //Delete sub-sections of the section
            const section = await Section.findById(sectionId);
            if(section) {
                const subSections = section.subSection;
                for(const subSectionId of subSections) {
                    await SubSection.findByIdAndDelete(subSectionId);
                }
            }
            //Delete the section
            await Section.findByIdAndDelete(sectionId);
        }

        //Delete the course
        await Course.findByIdAndDelete(courseId);

        return response.status(200).json({
            success:true,
            message:"Course deleted successfully",
        });

    } catch(error) {
        console.error(error);
        return response.status(500).json({
            success:false,
            message:"Server Error",
            error:error.message,
        });
    }
}