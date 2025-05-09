const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

// Create a new sub-section for a given section
exports.createSubSection = async (request,response) => {
    try {
        // Fetch data from request body
        const {sectionId, title, description} = request.body;
        // Extract file/video
        const video = request.files.video;

        // Data Validation - check if all necessary fields are provided
        if(!sectionId || !title || !description || !video) {
            return response.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }

        // Upload the video file to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        // Create a new sub-section with the necessary information
        const subSectionDetails = await SubSection.create({
            title:title,
            timeDuration:`${uploadDetails.duration}`,
            description:description,
            videoUrl:uploadDetails.secure_url,
        });

        // Update the corresponding section with the newly created sub-section
        const updatedSection = await Section.findByIdAndUpdate(
            {_id:sectionId},
            {
                $push: {
                    subSection:subSectionDetails._id,
                }
            },
            {new:true}
        )
        .populate({
            path: "subSection",
            select: "title description videoUrl timeDuration"
        });

        // Return the updated section in the response
        return response.status(200).json({
            success:true,
            message:"Sub-Section Created Successfully",
            data:updatedSection,
        });

    }
    catch(error) {
        console.error("Error creating new sub-section:", error);
        return response.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message,
        });
    }
};


exports.updateSubSection = async (request,response) => {
    try {
        const {sectionId, subSectionId, title, description} = request.body;
        const subSection = await SubSection.findById(subSectionId);

        if(!subSection) {
            return response.status(404).json({
                success:false,
                message:"Sub-section not found",
            })
        }
        
        if(title !== undefined) {
            subSection.title = title;
        }

        if(description !== undefined) {
            subSection.description = description;
        }

        // Only handle video upload if a new video file is provided
        if(request.files && request.files.video) {
            const video = request.files.video;
            const uploadDetails = await uploadImageToCloudinary(
                video,
                process.env.FOLDER_NAME
            )
            subSection.videoUrl = uploadDetails.secure_url;
            subSection.timeDuration = `${uploadDetails.duration}`;
        }
        await subSection.save();

        //Find updated section and return it
        const updatedSection = await Section.findById(sectionId)
            .populate({
                path: "subSection",
                select: "title description videoUrl timeDuration"
            });
        

        return response.status(200).json({
            success:true,
            message:"Section updated successfully",
            data: updatedSection,
        });

    } catch(error) {
        console.error(error);
        return response.status(500).json({
            success:false,
            message:"An error occurred while updating this section",
        });
    }
}

exports.deleteSubSection = async (request,response) => {
    try {
        const {subSectionId, sectionId} = request.body;
        await Section.findByIdAndUpdate(
            {_id:sectionId},
            {
                $pull: {
                    subSection: subSectionId,
                },
            }
        )
        const subSection = await SubSection.findByIdAndDelete({_id:subSectionId});

        if(!subSection) {
            return response.status(404).json({
                success:false,
                message:"Sub-Section not found"
            });
        }

        //Find updated section and return it
        const updatedSection = await Section.findById(sectionId)
        .populate("subSection");

        return response.status(200).json({
            success:true,
            message:"SubSection deleted successfully",
            data: updatedSection,
        })

    } catch(error) {
        console.error(error);
        return response.status(500).json({
            success:false,
            message:"An error occurred while deleting the SubSection",
        })
    }
}