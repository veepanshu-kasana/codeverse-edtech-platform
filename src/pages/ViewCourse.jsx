import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useParams } from 'react-router-dom';
import { getFullDetailsOfCourse } from '../services/operations/courseDetailsAPI';
import { setCompletedLectures, setCourseSectionData, setEntireCourseData, setTotalNoOfLectures } from '../slices/viewCourseSlice';
import { CourseReviewModal } from '../components/core/ViewCourse/CourseReviewModal';
import { VideoDetailsSidebar } from '../components/core/ViewCourse/VideoDetailsSidebar';

export const ViewCourse = () => {

    const [reviewModal, setReviewModal] = useState(false);
    const { courseId } = useParams();
    const { token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        const setCourseSpecificDetails = async() => {
            try {
                // console.log("Fetching course details for:", courseId);
                const courseData = await getFullDetailsOfCourse(courseId, token);
                // console.log("getFullDetailsOfCourse", courseData);
    
                if (!courseData) {
                    console.error("No course data received");
                    return;
                }
    
                // Safely handle the courseContent array
                const courseContent = courseData?.data?.courseDetails?.courseContent || [];
                console.log("Course Content:", courseContent);
    
                dispatch(setCourseSectionData(courseContent));
                dispatch(setEntireCourseData(courseData.data.courseDetails));
                dispatch(setCompletedLectures(courseData.data.completedVideos));
    
                let lectures = 0;
                courseContent.forEach((sec) => {
                    lectures += sec.subSection.length || 0;
                })
                dispatch(setTotalNoOfLectures(lectures));
            }
            catch (error) {
                console.error("Error fetching course details:", error);
            }
        }
        if (courseId && token) {
            setCourseSpecificDetails();
        }
    },[courseId, token, dispatch]);

  return (
    <>
        <div className='relative flex min-h-[calc(100vh-3.5rem)]'>
            <VideoDetailsSidebar setReviewModal={setReviewModal}/>
            <div className='h-[calc(100vh-3.5rem)] flex-1 overflow-auto'>
                <div className='mx-6'>
                    <Outlet/>
                </div>
            </div>
        </div>
        { reviewModal && (<CourseReviewModal setReviewModal={setReviewModal}/>)}
    </>
  )
}