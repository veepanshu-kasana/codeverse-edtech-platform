const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

// Create SubSection
exports.createSubSection = async (request,response) => {
    try {
        // Fetch data from request body
        const {sectionId, title, timeDuration, description} = request.body;

        // Extract file/video
        const video = request.files.videoFile;

        // Data Validation
        if(!sectionId || !title || !timeDuration || !description || !video) {
            return response.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }

        // Upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        // Create a sub-section
        const subSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,
        });

        // Update Section with this sub section ObjectsId
        const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
            {
                $push: {
                    subSection:subSectionDetails._id,
                }
            },
            {new:true}
        );
        // HW: log updated section here, after adding populate query
        // Return Response
        return response.status(200).json({
            success:true,
            message:"Sub Section Created Successfully",
            updatedSection,
        });

    }
    catch(error) {
        return response.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message,
        });
    }
};

// HW: Update SubSection

// HW: Delete SubSection