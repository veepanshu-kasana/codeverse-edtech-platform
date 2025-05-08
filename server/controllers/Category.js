const Category = require("../models/Category");

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

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
exports.showAllCategories = async (request,response) => {
    try {
        const allCategory = await Category.find({}, {name:true,description:true});
        return response.status(200).json({
            success:true,
            message:'All category returned successfully',
            data: allCategory,
        })
    }
    catch(error) {
        return response.status(500).json({
            success:false,
            message:error.message,
        });
    }
}


// categoryPageDetails Handler Function
exports.categoryPageDetails = async (request,response) => {
    try {
        // Get categoryId
        const {categoryId} = request.body;

        // Get courses for the specified category
        const selectedCategory = await Category.findById(categoryId)
            .populate({
                path: "course",
                match: {status: "Published"},
                populate: "ratingAndReviews",
            })
            .exec();
        console.log("SELECTED COURSE", selectedCategory);

        // Validation - when category is not found
        if(!selectedCategory) {
            console.log("Category not found.");
            return response.status(404).json({
                success:false,
                message:'Data not found for selected category',
            });
        }

        // Handle the case the when there are no courses
        if(!selectedCategory.courses.length === 0) {
            console.log("No courses found for the selected category");
            return response.status(404).json({
                success:false,
                message: 'No courses found for the selected category',
            });
        }

        // Get courses for different categories
        const categoriesExceptSelected = await Category.find({
                _id:{$ne: categoryId},
            })
            let differentCategories = await Category.findOne(
                categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]._id
            )
            .populate({path: "course", match: {status:"Published"}}).exec();

        // Get top-selling courses across all categories
        const allCategories = await Category.find()
        .populate({
            path: "course",
            match: {status: "Published"},
        }).exec();

        const allCourses = allCategories.flatMap((category) => category.course);
        const mostSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10)

        // Return response
        return response.status(200).json({
            success:true,
            data: {
                selectedCategory,
                differentCategories,
                mostSellingCourses,
            },
        });

    }catch(error) {
        console.log(error);
        return response.status(500).json({
            success:false,
            message:'Internal Server Error',  
            message:error.message,
        });
    }
}