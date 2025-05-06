import React from 'react'
import { useSelector } from "react-redux"
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/core/Dashboard/Sidebar';

export const Dashboard = () => {

    const { loading: authLoading } = useSelector( (state) => state.auth );
    const { loading: profileLoading } = useSelector( (state) => state.profile );

    if(profileLoading || authLoading) {
        return (
            <div className='grid min-h-[calc(100vh-3.5rem)] place-items-center'>
                <div className='spinner'></div>
            </div>
        )
    }

  return (
    <div className='relative flex min-h-[calc(100vh-3.5rem)] overflow-hidden'>
        <Sidebar/>
        <div className='h-[calc(100vh-3.5rem)] flex-1 overflow-auto'>
            <div className='mx-auto w-11/12 max-w-[1000px] py-10'>
                <Outlet/>
            </div>
        </div>

    </div>
  )
}