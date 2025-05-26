import React, { useEffect, useState } from 'react';
import ReactStars from "react-rating-stars-component";

//Import Swiper React Components
import {Swiper, SwiperSlide} from "swiper/react";

//Import Swiper Styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import "../../App.css";

//Icons
import { FaStar, FaRegStar } from 'react-icons/fa'

//Import required modules 
import {Autoplay, FreeMode, Pagination} from "swiper/modules";

//Get apiFunction and the endpoint
import {apiConnector} from "../../services/apiconnector";
import {ratingsEndpoints} from "../../services/apis";


export const ReviewSlider = () => {

  const [reviews, setReviews] = useState([]);
  const truncateWords = 15;

  useEffect(() => {
    (async () => {
      try {
        const {data} = await apiConnector("GET", ratingsEndpoints.REVIEWS_DETAILS_API);
        // console.log("Full API response:", data);
        if (data?.success) {
          setReviews(data?.data || []);
        } else {
          setReviews(data || []);
        }
      } catch (error) {
        console.error("Could not fetch reviews:", error);
      }
    })();
  }, []);
  // console.log("Reviews:",reviews);

  return (
    <div className='text-white w-full'>
      <div className='my-3 sm:my-5 md:my-8 lg:my-[40px] w-full'>
        <Swiper 
          // Responsive breakpoints for different screen sizes
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 15 }, 
            480: { slidesPerView: 1, spaceBetween: 18 }, 
            640: { slidesPerView: 2, spaceBetween: 20 }, 
            768: { slidesPerView: 3, spaceBetween: 22 }, 
            1024: { slidesPerView: 4, spaceBetween: 25 }, 
          }}
          loop={true}
          freeMode={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          modules={[FreeMode, Pagination, Autoplay]}
          className='w-full review-swiper'
          allowTouchMove={true}
          grabCursor={true}
          watchSlidesProgress={true}
          observer={true}
          observeParents={true}
        >
          {
            reviews.map((review, i) => {
              return (
                <SwiperSlide key={i} className="review-slide">
                  <div className='flex flex-col gap-2 sm:gap-3 bg-richblack-800 p-3 sm:p-4 text-[13px] sm:text-[14px] text-richblack-25 rounded-lg h-full min-h-[160px] sm:min-h-[180px] lg:min-h-[200px] shadow-lg'>
                    <div className='flex items-center gap-3 sm:gap-4'>

                      <img src={review?.user?.image 
                        ? review?.user?.image
                        : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                        } alt='' className='h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-full object-cover flex-shrink-0 ring-2 ring-richblack-700'
                      />

                      <div className='flex flex-col min-w-0 flex-1'>

                        <h1 className='font-semibold text-richblack-5 text-xs sm:text-sm truncate'>
                          {`${review?.user?.firstName} ${review?.user?.lastName}`}
                        </h1>

                        <h2 className='text-[10px] sm:text-[12px] font-medium text-richblack-500 truncate'>
                          {review?.courses?.courseName}
                        </h2>

                      </div>

                    </div>

                    <div className='flex-1'>
                      <p className='font-medium text-richblack-25 leading-relaxed text-xs sm:text-sm'>
                        {review?.review?.split(" ").length > truncateWords 
                        ? `${review?.review.split(" ").slice(0, truncateWords).join(" ")} ...`
                        : `${review?.review}` }
                      </p>
                    </div>

                    <div className='flex items-center gap-2 mt-auto pt-1 sm:pt-2 border-t border-richblack-700'>

                      <h3 className='font-semibold text-yellow-100 text-xs sm:text-sm'>
                        {review.rating.toFixed(1)}
                      </h3>

                      <ReactStars 
                        count={5}
                        value={Number(review.rating) || 0}
                        size={12}
                        edit={false}
                        activeColor="#FFD700"
                        color="#6B7280"
                        emptyIcon={<FaRegStar/>}
                        filledIcon={<FaStar/>}
                      />

                    </div>

                  </div>

                </SwiperSlide>

              );
            })
          }
          {/* <SwiperSlide>Slide 1</SwiperSlide> */}

        </Swiper>

      </div>

    </div>
  );
}
