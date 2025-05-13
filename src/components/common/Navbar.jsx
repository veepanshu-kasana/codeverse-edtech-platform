import React, { useEffect, useState } from 'react';
import Logo from "../../assets/Logo/Logo-Full-Light.png";
import { Link, matchPath } from 'react-router-dom';
import { NavbarLinks } from "../../data/navbar-links";
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AiOutlineShoppingCart, AiOutlineMenu } from 'react-icons/ai';
import { BsChevronDown } from 'react-icons/bs';
import { ProfileDropDown } from '../core/Auth/ProfileDropDown';
import { apiConnector } from '../../services/apiconnector';
import { categories } from '../../services/apis';
import { ACCOUNT_TYPE } from '../../utils/constants';

export const Navbar = () => {

  const {token} = useSelector( (state) => state.auth);
  const {user} = useSelector( (state) => state.profile);
  const {totalItems} = useSelector( (state) => state.cart);

  const [subLinks, setSubLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSubLinks = async() => {
    setLoading(true);
    try{
      const result = await apiConnector("GET", categories.CATEGORIES_API);
      console.log("API Response", result);
      setSubLinks(result.data.data);
    }
    catch(error) {
      console.log("Could not fetch the catalog list", error);
      setSubLinks([]);
    }
    setLoading(false);
  }

  useEffect( () => {
    fetchSubLinks();
  },[]);

  const location = useLocation();
  const matchRoute = (route) => {
    return matchPath({path:route}, location.pathname);
  }

  return (
    <div className={`flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700
     ${location.pathname !== "/" ? "bg-richblack-800" : ""} transition-all duration-200`}>

      <div className='flex w-11/12 max-w-maxContent items-center justify-between'>

        {/* Navbar Logo Image */}
        <Link to='/'>
          <img src={Logo} width={160} height={32} loading='lazy' alt='Logo' />
        </Link>

        {/* Navbar Links */}
        <nav className='hidden md:block'>
          <ul className='flex gap-x-6 text-richblack-25'>
            {
              NavbarLinks.map((link, index) => (
                <li key={index}>
                  {
                    link.title === 'Catalog' ? (
                      <>
                        <div className={`group relative flex cursor-pointer items-center gap-1 
                         ${matchRoute('/catalog/:catalogName') ? "text-yellow-25" : "text-richblack-25"}`}>
  
                          <p>{link.title}</p>
                          <BsChevronDown />
  
                          <div className='invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] flex-col rounded-lg
                           bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150
                           group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px] translate-x-[-50%] 
                           translate-y-[3em]'>
  
                            <div className='absolute left-[50%] top-0 -z-10 translate-x-[80%] translate-y-[-40%]
                             h-6 w-6 rotate-45 rounded bg-richblack-5 select-none'>
  
                            </div>
  
                            {
                              loading ? (
                                <p className='text-center'>Loading...</p>

                              ) : subLinks.length ? (
                                <>
                                  {
                                    subLinks?.map((subLink, i) => (
                                      <Link to={`/catalog/${subLink.name.split(" ").join("-").toLowerCase()}`} 
                                       className='rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50' key={i}>
    
                                       <p>{subLink.name}</p>
    
                                      </Link>
                                    ))
                                  }
                                </>
                              ) : (
                                <p className='text-center'>No Courses Found</p>
                              )
                            }
  
                          </div>
  
                        </div>
                      </>
                    ) : (
                      <Link to={link?.path}>
                        <p className={`${ matchRoute(link?.path) ? "text-yellow-25" : "text-richblack-25"}`}>
                          {link.title}
                        </p>
                      </Link>
                    )
                  }
                </li>
              ))
            }
          </ul>
        </nav>

        {/* Login/SignUp/Dashboard */}
        <div className='hidden md:flex gap-x-4 items-center'>

          {
            user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (

              <Link to='/dashboard/cart' className='relative'>
                <AiOutlineShoppingCart className='text-2xl text-richblack-100'/>
                {
                  totalItems > 0 && (
                    <span className='absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center
                     overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100'>
                      {totalItems}
                    </span>
                  )
                }
              </Link>

            )
          }
          {
            token === null && (
              <Link to='/login'>
                <button className='border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] 
                 text-richblack-100 rounded-[8px]'>
                  Log in 
                </button>
              </Link>
            )
          }
          {
            token === null && (
              <Link to='/signup'>
                <button className='border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] 
                 text-richblack-100 rounded-[8px]'>
                  Sign up
                </button>
              </Link>
            )
          }
          {
            token !== null && <ProfileDropDown />
          }

        </div>

        <button className='mr-4 md:hidden'>
          <AiOutlineMenu fontSize={24} fill="#AFB2BF"/>
        </button>

      </div>

    </div>
  )
}
