const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");

// Create a new section
exports.createSection = async (request,response) => {
    try {
        // Extract the required properties from the request body
        const {sectionName,courseId} = request.body;

        // Data Validation given as Input
        if(!sectionName || !courseId) {
            return response.status(401).json({
                success:false,
                message:"Missing required properties",
            });
        }

        // Create a new section the given name
        const newSection = await Section.create({sectionName});

        // Add the new section to the course's content array
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id,
                },
            },
            {new:true},
        ).populate({
            path:"courseContent",
            populate: {
                path:"subSection",
            },
        })
        .exec();

        // Return the updated course object in the response
        return response.status(200).json({
            success:true,
            message:"Section created successfully",
            updatedCourseDetails,
        });
    }
    catch(error) {
        return response.status(500).json({
            success:false,
            message:"Unable to create section, please try again",
            error:error.message,
        });
    }
}

// Update the course section
exports.updateSection = async(request,response) => {
    try {
        // Data input
        const {sectionName, sectionId, courseId} = request.body;

        // Data validation
        if(!sectionName || !sectionId || !courseId) {
            return response.status(401).json({
                success:false,
                message:"Missing required properties",
            });
        }

        // Update data
        const updateSectionDetails = await Section.findByIdAndUpdate(
            sectionId, 
            {sectionName}, 
            {new:true}
        );

        const course = await Course.findById(courseId)
        .populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        })
        .exec();
        console.log(course);

        //return response
        return response.status(200).json({
            success:true,
            message: updateSectionDetails,
            data: course,
        });
    }
    catch(error) {
        console.error("Error updating section:", error);
        return response.status(500).json({
            success:false,
            message:"Unable to update section, please try again",
            error:error.message,
        });
    }
}

// Delete a section from course
exports.deleteSection = async (request,response) => {
    try {
        // get data from request body
        const {sectionId, courseId} = request.body;

        // validating Id we get
        if(!sectionId || !courseId) {
            return response.status(401).json({
                success:false,
                message:"Didn't get data from request body",
            })
        }

        await Course.findByIdAndUpdate(courseId, {
            $pull: {
                courseContent: sectionId,
            },
        })

        const section = await Section.findById(sectionId);
        console.log(sectionId, courseId);

        if(!section) {
            return response.status(404).json({
                success:false,
                message:"Section not found",
            });
        }

        //Delete the associated subsections
        await SubSection.deleteMany({_id: {$in: section.subSection}});

        await Section.findByIdAndDelete(sectionId);

        const course = await Course.findById(courseId)
        .populate({
            path:"courseContent",
            populate: {
                path: "subSection",
            },
        })
        .exec();

        // return Response
        return response.status(200).json({
            success:true,
            message:"Section deleted successfully",
            data: course
        });
    }
    catch(error) {
        console.error("Error deleting section:", error);
        return response.status(500).json({
            success:false,
            message:"Unable to delete section, please try again",
            error:error.message,
        });
    }
}