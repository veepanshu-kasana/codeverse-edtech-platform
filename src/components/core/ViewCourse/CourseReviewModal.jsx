import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useForm } from 'react-hook-form';
import ReactStars from "react-rating-stars-component";
import { FaRegStar } from "react-icons/fa";
import { IconBtn } from '../../common/IconBtn';
import { createRating } from '../../../services/operations/courseDetailsAPI';
import { RxCross2 } from 'react-icons/rx';
import { FaStar } from 'react-icons/fa';

export const CourseReviewModal = ({setReviewModal}) => {

    const { user } = useSelector((state) => state.profile);
    const { token } = useSelector((state) => state.auth);
    const { courseEntireData } = useSelector((state) => state.viewCourse);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {errors},
    } = useForm();

    useEffect(() => {
        setValue('courseExperience', "");
        setValue('courseRating', 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[setValue])

    const ratingChanged = (newRating) => {
        setValue('courseRating', newRating);
    }

    const onSubmit = async(data) => {
        await createRating(
            {
                courseId: courseEntireData._id,
                rating: data.courseRating,
                review: data.courseExperience,
            },
            token
        );
        setReviewModal(false);
    }

    // Watch the current rating value from the form
    const courseRating = watch('courseRating', 0);

  return (
    <div className='fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center
     overflow-auto bg-white bg-opacity-10 backdrop-blur-sm'>
        <div className='my-10 w-11/12 max-w-[700px] rounded-lg border border-richblack-400 bg-richblack-800'>
            {/* Modal Header */}
            <div className='flex items-center justify-between rounded-t-lg bg-richblack-700 p-5'>
                <p className='text-xl font-semibold text-richblack-5'>Add Review</p>
                <button onClick={() => setReviewModal(false)}>
                    <RxCross2 className="text-2xl text-richblack-5"/>
                </button>
            </div>

            {/* Modal Body */}
            <div className='p-6'>
                <div className='flex items-center justify-center gap-x-4'>
                    <img
                        src={user?.image}
                        alt={user?.firstName + "profile"}
                        className='aspect-square w-[50px] rounded-full object-cover'
                    />
                    <div>
                        <p className='font-semibold text-richblack-5'>
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className='text-sm text-richblack-5'>Posting Publicly</p>
                    </div>
                </div>

                <form
                 onSubmit={handleSubmit(onSubmit)}
                 className='mt-6 flex flex-col items-center'
                >

                    <ReactStars
                      count={5}
                      value={courseRating || 0}
                      onChange={ratingChanged}
                      size={24}
                      activeColor="#FFD700"
                      color="#94A3B8" // Inactive star color
                      emptyIcon={<FaRegStar className="inline-block" />}
                      filledIcon={<FaStar className="inline-block" />}
                      // isHalf={false}
                      edit={true}
                      classNames="flex gap-1"
                    />

                    <div className='flex w-11/12 flex-col space-y-2'>
                        <label htmlFor='courseExperience' className='text-sm text-richblack-5'>
                            Add Your Experience <sup className='text-pink-200'>*</sup>
                        </label>
                        <textarea
                            id='courseExperience'
                            placeholder='Add Your Experience Here'
                            {...register("courseExperience", {required:true})}
                            className='form-style resize-x-none min-h-[130px] w-full'
                        />
                        {
                            errors.courseExperience && (
                                <span className='ml-2 text-xs tracking-wide text-pink-200'>
                                    Please Add Your Experience
                                </span>
                            )
                        }
                    </div>

                    {/* Cancel & Save Button */}
                    <div className='mt-6 flex w-11/12 justify-end gap-x-2'>
                        <button onClick={() => setReviewModal(false)}
                        className={`flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300
                         py-[8px] px-[20px] font-semibold text-richblack-900`}
                        >
                            Cancel
                        </button>
                        <IconBtn
                            text='Save'
                        />
                    </div>
                </form>
            </div>
        </div>
    </div>
  )
}