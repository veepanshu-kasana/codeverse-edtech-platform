const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (request,response) => {
    try {
        // Fetch Data
        const {sectionName,courseId} = request.body;

        // Data Validation
        if(!sectionName || !courseId) {
            return response.status(401).json({
                success:false,
                message:"Missing Properties",
            });
        }

        // Create Section 
        const newSection = await Section.create({sectionName});

        // Update course with section ObjectId
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id,
                }
            },
            {new:true},
        ).populate(Section.SubSection).exec();

        // Return Response
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


exports.updateSection = async(request,response) => {
    try {
        // Data input
        const {sectionName, sectionId} = request.body;

        // Data validation
        if(!sectionName || !sectionId) {
            return response.status(401).json({
                success:false,
                message:"Missing properties",
            });
        }

        // Update data
        const updateSectionDetails = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});

        //return response
        return response.status(200).json({
            success:true,
            message:"Section updated successfully",
        });
    }
    catch(error) {
        return response.status(500).json({
            success:false,
            message:"Unable to update section, please try again",
            error:error.message,
        });
    }
}


exports.deleteSection = async (request,response) => {
    try {
        // get ID - assuming that we are sending Id in params
        const {sectionId} = request.params;

        // validating Id
        if(!sectionId) {
            return response.status(401).json({
                success:false,
                message:"Didn't get sectionID",
            })
        }

        // use findByIdAndDelete
        await Section.findByIdAndDelete(sectionId);

        // return Response
        return response.status(200).json({
            success:true,
            message:"Section deleted successfully",
            error:error.message,
        });
    }
    catch(error) {
        return response.status(500).json({
            success:false,
            message:"Unable to delete section, please try again",
            error:error.message,
        });
    }
}