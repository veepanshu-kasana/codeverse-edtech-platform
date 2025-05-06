import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';

export const RequirementsField = ({name, label, register, setValue, errors, getValues}) => {

    const { editCourse, course } = useSelector((state) => state.course);
    const [requirement, setRequirement] = useState("");
    const [requirementList, setRequirementsList] = useState([]);

    useEffect(() => {
        if(editCourse) {
            setRequirementsList(course?.instructions);
        }
        register(name, {
            required:true,
            validate:(value) => value.length > 0
        })
    }, [])

    useEffect(() => {
        setValue(name, requirementList);
    }, [requirementList])

    const handleAddRequirement = () => {
        if(requirement) {
            setRequirementsList([...requirementList, requirement]);
            setRequirement("");
        }
    }

    const handleRemoveRequirement = (index) => {
        const updatedRequirementList = [...requirementList];
        updatedRequirementList.splice(index, 1);
        setRequirementsList(updatedRequirementList);
    }

  return (
    <div className='flex flex-col space-y-2'>

        <label htmlFor={name} className='text-sm text-richblack-5'>
            {label} <sup className='text-pink-200'>*</sup>
        </label>

        <div className='flex flex-col items-center space-y-2'>
            <input
                type='text'
                id={name}
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                className='w-full form-style'
            />
            <button type='button'
             onClick={handleAddRequirement} 
             className='font-semibold text-yellow-50'>
                Add
            </button>
        </div>

        {
            requirementList.length > 0 && (
                <ul className='mt-2 list-inside list-disc'>
                    {
                        requirementList.map((requirement, index) => (
                            <li key={index} className='flex items-center text-richblack-5'>
                                <span>{requirement}</span>
                                <button type='button'
                                 onClick={() => handleRemoveRequirement(index)} 
                                 className='text-xs ml-2 text-pure-greys-300'>
                                    Clear
                                </button>
                            </li>
                        ))
                    }
                </ul>
            )
        }
        {
            errors[name] && (
                <span className='ml-2 text-xs tracking-wide text-pink-200'>
                    {label} is required
                </span>
            )
        }
    </div>
  )
}