import React from 'react'
import { ContactForm } from '../components/ContactPage/ContactForm'
import { ReviewSlider } from '../components/common/ReviewSlider'
import { Footer } from '../components/common/Footer'
import { ContactDetails } from '../components/ContactPage/ContactDetails'

export const Contact = () => {
  return (
    <div>
        <div className='mx-auto mt-20 flex w-11/12 max-w-maxContent flex-col
         justify-between gap-10 text-white lg:flex-row'>

            {/* Contact Details */}
            <div className='lg:w-[40%]'>
                <ContactDetails/>
            </div>

            {/* Contact Form */}
            <div className='lg:w-[60%]'>
                <ContactForm/>
            </div>

        </div>

        <div className='relative mx-auto my-20 flex w-11/12 max-w-maxContent flex-col
         items-center justify-between gap-8 bg-richblack-900 text-white'>

            {/* Reviews from Other Learners */}
            <h2 className="text-center text-3xl md:text-4xl font-semibold text-richblack-5 mt-8 tracking-wide">
              Reviews From Our Learners
            </h2>

            <ReviewSlider/>
        </div>

        {/* Footer */}
        <Footer/>
    </div>
  )
}
