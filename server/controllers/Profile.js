const Profile = require("../models/Profile");
const User = require("../models/User");

exports.createProfile = async (request,response) => {
    try {
        // Get Data
        const {dateOfBirth="", about="", contactNumber, gender} = request.body;

        // Get userId
        const id = request.user.id;

        // Validation
        if(!contactNumber || !gender || !id) {
            return response.status(401).json({
                success:false,
                message:"All fields are required",
            });
        }

        // Find Profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        // Update Profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();

        // Return response
        return response.status(200).json({
            success:true,
            message:"Profile updated successfully",
            profileDetails,
        });
    }
    catch(error) {
        return response.status(500).json({
            success:false,
            error:error.message,
            message:"Internal Server Error",
        });
    }
}


// Delete Account- How can we schedule this task
exports.deleteAccount = async (request,response) => {
    try {
        // Get ID
        const id = request.user.id;

        // Validation
        const UserDetails = await User.findById(id);
        if(!UserDetails) {
            return response.status(404).json({
                success:false,
                message:'User Not Found',
            });
        }

        // Delete Profile
        await Profile.findByIdAndDelete({_id:UserDetails.additionalDetails});

        // Todo: HW - Unenroll user from the all enrolled courses
        // Delete User
        await User.findByIdAndDelete({_id:id});

        // Return Response
        return response.status(200).json({
            success:true,
            message:'User Deleted Successfully',
        });
    }
    catch(error) {
        return response.status(500).json({
            success:false,
            message:'User cannot be deleted successfully',
        });
    }
};

exports.getAllUserDetails = async (request,response) => {
    try {
        // Get ID
        const id = request.user.id;

        // Validation and Get User Details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
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
        });
    }
    catch(error) {
        return response.status(500).json({
            success:false,
            message:error.message,
        });
    }
}