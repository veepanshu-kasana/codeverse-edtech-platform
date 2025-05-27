import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/pagination'
import { FreeMode, Pagination, Autoplay, Navigation } from 'swiper/modules'
import { CourseCardCatalog } from './CourseCardCatalog'

export const CourseSlider = ({Courses}) => {
  return (
    <>
      {
        Courses?.length ? (
          <Swiper loop={true} slidesPerView={1} spaceBetween={25} modules={[Pagination, FreeMode]}
            breakpoints={{
                1024: {
                  slidesPerView: 3,
                },
              }} 
              className='max-h-[30rem]'
            >
            {
              Courses?.map((course, index) => (
                <SwiperSlide key={index}>
                  <CourseCardCatalog course={course} Height={'h-[250px]'}/>
                </SwiperSlide>
              ))
            }
          </Swiper>
        ) : (
          <p className='text-xl text-richblack-5'>No Course Found</p>
        )
      }   
    </>
  )
}