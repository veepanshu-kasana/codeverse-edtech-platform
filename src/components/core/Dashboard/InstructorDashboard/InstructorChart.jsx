import React, { useState } from 'react'
import { Chart, registerables } from 'chart.js';
import { Pie } from 'react-chartjs-2';

Chart.register(...registerables);

export const InstructorChart = ({courses}) => {

  const [currChart, setCurrChart] = useState("students");

  // Function to generate random colors
  const getRandomColors = (numColors) => {
    const colors = [];
    for(let i=0; i<numColors; i++) {
      const color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)},
      ${Math.floor(Math.random() * 256)})`
      colors.push(color);
    }
    return colors;
  }

  // Create data for chart displaying student info
  const chartDataForStudents = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        data: courses.map((course) => course.totalStudentsEnrolled),
        backgroundColor: getRandomColors(courses.length),
      }
    ]
  }

  // Create data for chart displaying income info
  const chartDataForIncome = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        data: courses.map((course) => course.totalAmountGenerated),
        backgroundColor: getRandomColors(courses.length),
      }
    ]
  }

  // Create options
  const options = {
    maintainAspectRatio: false,
  }

  return (
    <div className='flex flex-1 flex-col gap-y-4 rounded-md bg-richblack-800 p-6'>

        <p className='text-lg font-bold text-richblack-5'>Visualize</p>

        <div className='gap-x-4 font-semibold'>
          <button
            onClick={() => setCurrChart("students")}
            className={`rounded-sm p-1 px-3 transition-all duration-200
             ${currChart === "students" ? "bg-richblack-700 text-yellow-50" : "text-yellow-400"}`}
          >
            Student
          </button>
          
          <button
            onClick={() => setCurrChart("income")}
            className={`rounded-sm p-1 px-3 transition-all duration-200
             ${currChart === "income" ? "bg-richblack-700 text-yellow-50" : "text-yellow-400"}`}
          >
            Income
          </button>
        </div>

        <div className='relative mx-auto aspect-square h-full w-full'>
          <Pie
            data={currChart === "students" ? chartDataForStudents : chartDataForIncome}
            options={options}
          />
        </div>

    </div>
  )
}