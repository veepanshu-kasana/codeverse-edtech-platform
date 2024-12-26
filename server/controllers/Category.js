const Category = require("../models/Category");

// Create category handler function
exports.createCategory = async (request,response) => {
    try {
        // Fetch Data
        const {name, description} = request.body;

        // Validation
        if(!name || !description) {
            return response.status(401).json({
                success:false,
                message:'All fields are required',
            });
        }

        // Create entry in DB
        const categoryDetails = await Category.create({
            name:name,
            description:description,
        });
        console.log(categoryDetails);

        // Return Response
        return response.status(200).json({
            success:true,
            message:'Category created successfully',
        });
    }
    catch(error) {
        return response.status(500).json({
            success:false,
            message:error.message,
        })
    }
}


// getAllCategory Handler Function
exports.showAllCategory = async (request,response) => {
    try {
        const allCategory = await Category.find({}, {name:true,description:true});
        return response.status(200).json({
            success:true,
            message:'All category returned successfully',
            allCategory,
        })
    }
    catch(error) {
        return response.status(500).json({
            success:false,
            message:error.message,
        });
    }
}