import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom';
import { RenderSteps } from '../AddCourse/RenderSteps';
import { fetchCourseDetails } from '../../../../services/operations/courseDetailsAPI';
import { setCourse, setEditCourse } from '../../../../slices/courseSlice';

export const EditCourse = () => {

    const dispatch = useDispatch();
    const { courseId } = useParams();
    const { course } = useSelector((state) => state.course);
    const [loading, setLoading] = useState(false);
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        const populateCourseDetails = async() => {
            setLoading(true);
            const result = await fetchCourseDetails(courseId, token);
            if(result && result.data && result.data.courseDetails) {
                dispatch(setEditCourse(true));
                dispatch(setCourse(result.data.courseDetails));
            }
            setLoading(false);
        }
        populateCourseDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if(loading) {
        return (
            <div className='grid flex-1 place-items-center'>
                <div className='spinner'></div>
            </div>
        )
    }

  return (
    <div>
        <h1 className='mb-14 text-3xl font-medium text-richblack-5'>
            Edit Course: {course ? course.courseName : ""}
        </h1>
        <div className='mx-auto max-w-[600px]'>
            {
                course ? (
                    <RenderSteps/>
                ) : (
                    <p className='mt-14 text-center text-3xl font-semibold text-richblack-100'>
                        Course not found
                    </p>
                )
            }
        </div>
    </div>
  )
}