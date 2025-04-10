import './App.css';
import { Route, Routes } from 'react-router-dom';
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

function App() {
  return (
    <div className='w-screen min-h-screen bg-richblack-900 flex flex-col font-inter'>
    <Navbar/>
      <Routes>

        <Route path='/' element={<Home/>}/>

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

        <Route path='dashboard/my-profile'
          element={
            <MyProfile/>
          }
        />

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