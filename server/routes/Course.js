//Import the required modules
const express = require("express");
const router = express.Router();

//Import the controllers
//Import Course Controllers
const {
    createCourse,
    getAllCourses,
    getCourseDetails,
    getFullCourseDetails,
    editCourse,
    getInstructorCourses,
    deleteCourse
} = require("../controllers/Course");

//Import Categories Controller
const {
    showAllCategories, 
    createCategory, 
    categoryPageDetails
} = require("../controllers/Category");

//Import Section Controller
const {
    createSection,
    updateSection,
    deleteSection
} = require("../controllers/Section");

//Import Sub-Sections controller
const {
    createSubSection,
    updateSubSection,
    deleteSubSection
} = require("../controllers/SubSection");

//Import Rating Controller
const {
    createRating,
    getAverageRating,
    getAllRatingReview
} = require("../controllers/RatingAndReview");

//Import CourseProgress Controller
const {
    updateCourseProgress,
    getProgressPercentage
} = require("../controllers/CourseProgress");

//Import Middlewares
const {auth, isStudent, isInstructor, isAdmin} = require("../middlewares/auth");

// ****************************************************************************************
//                                   Course routes
// ****************************************************************************************

//Courses can only be created by Instructors
router.post("/createCourse", auth, isInstructor, createCourse);
//Edit Course Routes
router.post("/editCourse", auth, isInstructor, editCourse);
//Add a section to course
router.post("/addSection", auth, isInstructor, createSection);
//Update a section
router.post("/updateSection", auth, isInstructor, updateSection);
//Delete a section
router.post("/deleteSection", auth, isInstructor, deleteSection);
//Edit sub section
router.post("/updateSubSection", auth, isInstructor, updateSubSection);
//Delete sub section
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);
//Add a sub section to a section
router.post("/addSubSection", auth, isInstructor, createSubSection);
//Get all courses under a specific instructor
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses);
//Get all registered courses
router.get("/getAllCourses", getAllCourses);
//Get details for a specific course
router.get("/getCourseDetails/:courseId", getCourseDetails);
//Get details for specific courses
router.post("/getFullCourseDetails", auth, getFullCourseDetails);
//To update course progress
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);
//To get course progress
// router.post("/getProgressPercentage", auth, isStudent, getProgressPercentage);
//Delete a course
router.delete("/deleteCourse", deleteCourse);

// ***************************************************************************************
//                           Category routes (Only by Admin)
// ***************************************************************************************

//Category can only be created by Admin
//TODO: Put isAdmin middleware here
router.post("/createCategory", auth, isInstructor, createCategory); // isAdmin
router.get("/showAllCategories", showAllCategories);
router.post("/getCategoryPageDetails", categoryPageDetails);

// ***************************************************************************************
//                                 Rating and Review
// ***************************************************************************************

router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRatingReview);

module.exports = router;