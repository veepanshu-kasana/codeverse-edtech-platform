import toast from 'react-hot-toast'
import { updatedCompletedLectures } from '../../slices/viewCourseSlice';
// import { setLoading } from '../../slices/profileSlice';
import { apiConnector } from '../apiconnector';
import { courseEndpoints } from '../apis';

const {
    COURSE_DETAILS_API, COURSE_CATEGORIES_API, GET_ALL_COURSE_API, CREATE_COURSE_API, EDIT_COURSE_API,
    CREATE_SECTION_API, CREATE_SUBSECTION_API, UPDATE_SECTION_API, UPDATE_SUBSECTION_API, DELETE_SECTION_API,
    DELETE_SUBSECTION_API, GET_ALL_INSTRUCTOR_COURSES_API, DELETE_COURSE_API, GET_FULL_COURSE_DETAILS_AUTHENTICATED,
    CREATE_RATING_API, LECTURE_COMPLETION_API
} = courseEndpoints;

export const getAllCourses = async () => {
    const toastId = toast.loading("Loading...");
    let result = []
    try {
        const response = await apiConnector("GET", GET_ALL_COURSE_API);
        if(!response?.data?.success) {
            throw new Error("Could Not Fetch Course Categories");
        }
        result = response?.data?.data

    } catch (error) {
        console.log("GET_ALL_COURSE_API API ERROR...........", error);
        toast.error(error.message);
    }
    toast.dismiss(toastId);
    return result;
}

export const fetchCourseDetails = async (courseId) => {
    const toastId = toast.loading("Loading...");
    let result = null
    try {
        const response = await apiConnector("POST", COURSE_DETAILS_API, {
            courseId,
        })
        console.log("COURSE_DETAILS_API API RESPONSE........", response);

        if(!response.data.success) {
            throw new Error(response.data.message);
        }
        result = response.data

    } catch (error) {
        console.log("COURSE_DETAILS_API API ERROR.........", error);
        result = error.response.data
    }
    toast.dismiss(toastId)
    return result
}

// Fetching the available course categories
export const fetchCourseCategories = async () => {
    let result = []
    try {
        const response = await apiConnector("GET", COURSE_CATEGORIES_API)
        console.log("COURSE_CATEGORIES_API API RESPONSE........", response)

        if(!response?.data?.success) {
            throw new Error("Could Not Fetch Course Categories")
        }
        result = response?.data?.data

    } catch (error) {
        console.log("COURSE_CATEGORY_API API ERROR........", error);
        toast.error(error.message)
        // return [];
    }
    return result
}

// Add the course details
export const addCourseDetails = async (data, token) => {
    let result = null
    const toastId = toast.loading("Loading...")

    try {
        // Validate required data
        if (!data || !token) {
            throw new Error("Missing required parameters");
            return null;
        }
    
        // Validate thumbnail presence
        if (!data.get('thumbnailImage')) {
            throw new Error("Thumbnail image is required");
            return null;
        }

        const response = await apiConnector("POST", CREATE_COURSE_API, data, {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
        })
        console.log("CREATE COURSE API RESPONSE........", response);
        if(!response?.data?.success) {
            throw new Error("Could Not Add Course Details")
        }
        toast.success("Course Details Added Successfully")
        result = response?.data?.data

    } catch (error) {
        console.log("CREATE COURSE API ERROR..........", error);
        toast.error(error.message)
        result = null
    }
    toast.dismiss(toastId)
    return result
}

// Edit the course details 
export const editCourseDetails = async (data, token) => {
    let result = null
    const toastId = toast.loading("Loading...")

    try {
        // Log the form data for debugging
        const formEntries = Object.fromEntries(data.entries());
        console.log("Form data being sent:", formEntries);

        // Get courseId and validate it
        const courseId = formEntries.courseId;
        if (!courseId || typeof courseId !== 'string') {
            throw new Error("Invalid Course ID");
        }

        // Create a new FormData with the correct courseId format
        const formData = new FormData();
        formData.append("courseId", courseId);

        // Append other form data
        Object.keys(formEntries).forEach(key => {
            if (key !== 'courseId') {
                formData.append(key, formEntries[key]);
            }
        });

        const response = await apiConnector("POST", EDIT_COURSE_API, formData, {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
        })
        console.log("EDIT COURSE API RESPONSE:", response);
        if(!response?.data?.success) {
            throw new Error(response?.data?.message || "Could Not Update Course Details")
        }
        toast.success("Course Details Updated Successfully")
        result = response?.data?.data

    } catch (error) {
        console.log("EDIT COURSE API ERROR.........", error);
        toast.error(error.message)
    }
    toast.dismiss(toastId)
    return result
}

// Create a Section 
export const createSection = async (formData, token) => {
    try {
        const response = await apiConnector("POST", CREATE_SECTION_API, formData, {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
        })
        console.log("CREATE SECTION API RESPONSE........", response);

        if(!response?.data?.success) {
            throw new Error(response?.data?.message || "Could not create section")
        }
        // toast.success("Course Section Created")
        // result = response?.data?.updatedCourse
        return response.data;

    } catch (error ) {
        console.log("CREATE SECTION API ERROR.........", error);
        // toast.error(error.message);
        throw error;
    }
}

// Create a subsection 
export const createSubSection = async (formData, token) => {
    try {
        const response = await apiConnector("POST", CREATE_SUBSECTION_API, formData, {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
        });

        console.log("CREATE SUB-SECTION API RESPONSE.......", response);
        
        if (!response?.data?.success) {
            throw new Error(response?.data?.message || "Could Not Add Lecture");
        }
        
        return response.data;

    } catch (error) {
        console.log("CREATE SUB-SECTION API ERROR........", error);
        throw error;
    }
}

// Update a Section 
export const updateSection = async (data, token) => {
    try {
        const response = await apiConnector("POST", UPDATE_SECTION_API, data, {
            Authorization: `Bearer ${token}`,
        })
        console.log("UPDATE SECTION API RESPONSE........", response);
        if(!response?.data?.success) {
            throw new Error(response?.data?.message || "Could Not Update Section");
        }
        return {
            success: true,
            updatedCourseDetails: response.data.data
        };

    } catch (error) {
        console.log("UPDATE SECTION API ERROR........", error);
        throw error;
    }
}

// Update a subsection 
export const updateSubSection = async (data, token) => {
    try {
        const response = await apiConnector("POST", UPDATE_SUBSECTION_API, data, {
            Authorization: `Bearer ${token}`,
        })

        if(!response?.data?.success) {
            throw new Error(response?.data?.message || "Could Not Update Lecture")
        }
        return response.data;

    } catch (error) {
        console.log("UPDATE SUB-SECTION API ERROR..........", error);
        throw error;
    }
}

// Delete a Section 
export const deleteSection = async (data, token) => {
    let result = null
    const toastId = toast.loading("Loading...")
    try {
        const response = await apiConnector("POST", DELETE_SECTION_API, data, {
            Authorization: `Bearer ${token}`,
        })
        console.log("DELETE SECTION API RESPONSE.........", response);
        if(!response?.data?.data) {
            throw new Error("Could Not Delete Section")
        }
        toast.success("Course Section Deleted")
        result = response?.data?.data

    } catch (error) {
        console.log("DELETE SECTION API ERROR.........", error);
        toast.error(error.message)
    }
    toast.dismiss(toastId)
    return result
}

// Delete a SubSection 
export const deleteSubSection = async (data, token) => {
    let result = null
    const toastId = toast.loading("Loading...")
    try {
        const response = await apiConnector("POST", DELETE_SUBSECTION_API, data, {
            Authorization: `Bearer ${token}`,
        })
        console.log("DELETE SUB-SECTION API RESPONSE.........", response);
        if(!response?.data?.success) {
            throw new Error("Could Not Delete Lecture")
        }
        toast.success("Lecture Deleted")
        result = response?.data?.data

    } catch (error) {
        console.log("DELETE SUB-SECTION API ERROR.........", error);
        toast.error(error.message)
    }
    toast.dismiss(toastId)
    return result
}

// Fetching all courses under a specific instructor 
export const fetchInstructorCourses = async (token) => {
    let result = []
    const toastId = toast.loading("Loading...")
    try {
        const response = await apiConnector("GET", GET_ALL_INSTRUCTOR_COURSES_API, null, {
            Authorization: `Bearer ${token}`,
        })
        console.log("INSTRUCTOR COURSES API RESPONSE..........", response);
        if(!response?.data?.success) {
            throw new Error("Could Not Fetch Instructor Courses")
        }
        result = response?.data?.data

    } catch (error) {
        console.log("INSTRUCTOR COURSES API ERROR.........", error);
        toast.error(error.message);
    }
    toast.dismiss(toastId)
    return result
}

// Delete a Course 
export const deleteCourse = async (data, token) => {
    const toastId = toast.loading("Loading...")
    try {
        const response = await apiConnector("DELETE", DELETE_COURSE_API, data, {
            Authorization: `Bearer ${token}`,
        })
        console.log("DELETE COURSE API RESPONSE.........", response);
        if(!response?.data?.success) {
            throw new Error("Could Not Delete Course")
        }
        toast.success("Course Deleted")

    } catch (error) {
        console.log("DELETE COURSE API ERROR.......", error);
        toast.error(error.message)
    }
    toast.dismiss(toastId)
}

// Get Full Details of a Course 
export const getFullDetailsOfCourse = async (courseId, token) => {
    const toastId = toast.loading("Loading...")
    let result = null
    try {
        const response = await apiConnector("POST", GET_FULL_COURSE_DETAILS_AUTHENTICATED, {courseId},
            {
                Authorization: `Bearer ${token}`,
            }
        )
        console.log("COURSE_FULL_DETAILS_API API RESPONSE........", response);

        if(!response.data.success) {
            throw new Error(response.data.message)
        }
        result = response?.data?.data

    } catch (error) {
        console.log("COURSE_FULL_DETAILS_API API ERROR.........", error);
        result = error.response.data
    }
    toast.dismiss(toastId)
    return result
}

// Mark a Lecture as complete 
export const markLectureAsComplete = async (data, token) => {
    let result = null
    console.log("Mark complete data", data);
    const toastId = toast.loading("Loading...")
    try {
        const response = await apiConnector("POST", LECTURE_COMPLETION_API, data, {
            Authorization: `Bearer ${token}`,
        })
        console.log("MARK_LECTURE_AS_COMPLETE_API API RESPONSE.........", response);
        if(!response.data.message) {
            throw new Error(response.data.error)
        }
        toast.success("Lecture Completed")
        result = true

    } catch (error) {
        console.log("MARK_LECTURE_AS_COMPLETE_API API ERROR.........", error);
        toast.error(error.message);
        result = false
    }
    toast.dismiss(toastId)
    return result
}

// Create a rating for course 
export const createRating = async (data, token) => {
    const toastId = toast.loading("Loading...")
    let success = false
    try {
        const response = await apiConnector("POST", CREATE_RATING_API, data, {
            Authorization: `Bearer ${token}`,
        })
        console.log("CREATE RATING API RESPONSE........", response);
        if(!response?.data?.success) {
            throw new Error("Could Not Create Rating")
        }
        toast.success("Rating Created")
        success = true

    } catch (error) {
        success = false
        console.log("CREATE RATING API ERROR........", error);
        toast.error(error.message)
    }
    toast.dismiss(toastId)
    return success
}