import './App.css';
import { Route, Routes, useNavigate } from 'react-router-dom';
import OpenRoute from "./components/core/Auth/OpenRoute"
import { Home } from "./pages/Home";
import { Navbar } from './components/common/Navbar';

import { ForgotPassword } from './pages/ForgotPassword';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Error } from './pages/Error';
import { ACCOUNT_TYPE } from './utils/constants';
import { UpdatePassword } from './pages/UpdatePassword';
import { VerifyEmail } from './pages/VerifyEmail';
import { MyProfile } from './components/core/Dashboard/MyProfile';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Dashboard } from './pages/Dashboard';
import { PrivateRoute } from './components/core/Auth/PrivateRoute';
import { EnrolledCourses } from './components/core/Dashboard/EnrolledCourses';
import { Settings } from './components/core/Dashboard/Settings';
import { Cart } from './components/core/Dashboard/Cart';
import { useDispatch, useSelector } from 'react-redux';
import { AddCourse } from './components/core/Dashboard/AddCourse';
import { MyCourses } from './components/core/Dashboard/MyCourses';
import { EditCourse } from './components/core/Dashboard/EditCourse';
import { Catalog } from './pages/Catalog';
import { CourseDetails } from './pages/CourseDetails';

function App() {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.profile);

  return (
    <div className='w-screen min-h-screen bg-richblack-900 flex flex-col font-inter'>
    <Navbar/>
      <Routes>

        <Route path='/' element={<Home/>}/>
        <Route path='catalog/:catalogName' element={<Catalog/>}/>
        <Route path="courses/:courseId" element={<CourseDetails/>} />

        <Route path='signup'
          element={
            <OpenRoute>
              <Signup/>
            </OpenRoute>
          }
        />

        <Route path='login'
          element={
            <OpenRoute>
              <Login/>
            </OpenRoute>
          }
        />

        <Route path='forgot-password'
          element={
            <OpenRoute>
              <ForgotPassword/>
            </OpenRoute>
          }
        />

        <Route path='update-password/:id'
          element={
            <OpenRoute>
              <UpdatePassword/>
            </OpenRoute>
          }
        />

        <Route path='verify-email'
          element={
            <OpenRoute>
              <VerifyEmail/>
            </OpenRoute>
          }
        />        

        <Route
          element={
            <PrivateRoute>
              <Dashboard/>
            </PrivateRoute>
          }
        >
          <Route path='dashboard/my-profile' element={<MyProfile/>}/>
          <Route path='dashboard/settings' element={<Settings/>}/>
          {
            user?.accountType === ACCOUNT_TYPE.STUDENT && (
              <>
                <Route path='dashboard/cart' element={<Cart/>}/>
                <Route path='dashboard/enrolled-courses' element={<EnrolledCourses/>}/>
              </>
            )
          } 
          {
            user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
              <>
                {/* <Route path='dashboard/instructor' element={<Instructor/>}/> */}
                <Route path='dashboard/add-course' element={<AddCourse />}/>
                <Route path='dashboard/my-courses' element={<MyCourses />}/>
                <Route path='dashboard/edit-course/:courseId' element={<EditCourse/>}/>
              </>
            )
          }
        </Route>

        <Route path='*' element={<Error/>}/>

        <Route path='/about'
          element={
            <About/>
          }
        />

        <Route
          path='/contact'
          element={
            <Contact/>
          }
        />

      </Routes>
    </div>
  );
}

export default App;