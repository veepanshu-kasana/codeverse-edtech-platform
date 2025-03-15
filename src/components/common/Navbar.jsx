import React from 'react';
import Logo from "../../assets/Logo/Logo-Full-Light.png";
import { Link, matchPath } from 'react-router-dom';
import { NavbarLinks } from "../../data/navbar-links";
import { useLocation } from 'react-router-dom';

export const Navbar = () => {

  const location = useLocation();
  const matchRoute = (route) => {
    return matchPath({path:route}, location.pathname);
  }

  return (
    <div className='flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700'>
      <div className='flex w-11/12 max-w-maxContent items-center justify-between'>

        <Link>
          <img src={Logo} width={160} height={42} loading='lazy' alt=''/>
        </Link>

        <nav>
          <ul className='flex gap-x-6 text-richblack-25'>
            {
              NavbarLinks.map((link, index) => (
                <li key={index}>
                  {
                    link.title === 'Catalog' ? (<div></div>) : (
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
        <div className='flex gap-x-4 items-center'>

        </div>


      </div>
    </div>
  )
}
