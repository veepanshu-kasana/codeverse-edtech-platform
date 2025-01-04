const mongoose = require("mongoose");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");

exports.updateCourseProgress = async (request,response) => {
    const {courseId, subsectionId} = request.body;
    const userId = request.user.id;

    try {
        //Check if the subsection is valid
        const subsection = await SubSection.findById(subsectionId);
        if(!subsection) {
            return response.status(404).json({
                error:"Invalid subsection"
            });
        }

        //Find the course progress document for the user and course
        let courseProgress = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        })

        if(!courseProgress) {
            //If course progress doesn't exist, create a new one
            return response.status(404).json({
                success:false,
                message:"Course progress does not exist",
            });

        } else {
            // If course progress exists, check if the subsection is already completed
            if(courseProgress.completedVideos.includes(subsectionId)) {
                return response.status(400).json({error: "SubSection already completed"});
            }

            // Push the subsection into the completedVideos array
            courseProgress.completedVideos.push(subsectionId);
        }

        //Save the updated course progress
        await courseProgress.save();

        return response.status(200).json({
            message:"Course progress updated",
        });

    } catch(error) {
        console.error(error);
        return response.status(500).json({
            error:"Internal server error",
        })
    }
}