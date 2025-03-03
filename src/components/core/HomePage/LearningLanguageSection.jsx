import React from 'react'
import {HighlightText} from './HighlightText'
import {CTAButton} from './Button'
import know_your_progress from '../../../assets/Images/Know_your_progress.png'
import compare_with_others from '../../../assets/Images/Compare_with_others.png'
import plan_your_lessons from '../../../assets/Images/Plan_your_lessons.png'

export const LearningLanguageSection = () => {
  return (
    <div className='mt-[130px]'>
        <div className='flex flex-col gap-5 items-center'>

          <div className='text-4xl font-semibold text-center'>
            Your Swiss knife for
            <HighlightText text={"learning any language"}/>
          </div>

          <div className='text-center text-richblack-600 mx-auto text-base font-medium w-[70%]'>
            Using spin making learning multiple languages easy. with 20+ languages 
            realistic voice-over, progress tracking, custom schedule and more.
          </div>

          <div className='flex flex-row items-center justify-center mt-5'>
            <img src={know_your_progress} alt='KnowYourProgress' className='object-contain -mr-28'/>
            <img src={compare_with_others} alt='CompareWithOthers' className='object-contain'/>
            <img src={plan_your_lessons} alt='PlanYourLessons' className='object-contain -ml-32'/>
          </div>

          <div className='w-fit'>
            <CTAButton active={true} linkto={"/signup"}>
              <div>
                Learn More
              </div>
            </CTAButton>
          </div>
            
        </div>
    </div>
  )
}
