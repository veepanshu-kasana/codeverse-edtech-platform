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


// showAllCategory Handler Function
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


// categoryPageDetails
exports.categoryPageDetails = async (request,response) => {
    try {
        // Get categoryId
        const {categoryId} = request.body;

        // Get courses for the specified category
        const selectedCategory = await Category.findById(categoryId)
            .populate("course").exec();

        // Validation
        if(!selectedCategory) {
            return response.status(404).json({
                success:false,
                message:'Data not found for selected category',
            });
        }

        // Get courses for different categories
        const differentCategories = await Category.find({
                _id:{$ne: categoryId},
            }).populate("course").exec();

        // Get top selling courses - Incompleted

        // Return response
        return response.status(200).json({
            success:true,
            data: {
                selectedCategory,
                differentCategories,
            },
        })

    }catch(error) {
        console.log(error);
        return response.status(500).json({
            success:false,
            message:error.message,
        });
    }
}