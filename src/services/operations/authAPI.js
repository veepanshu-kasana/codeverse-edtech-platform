import toast from 'react-hot-toast';
import { setLoading, setToken } from '../../slices/authSlice';
import { resetCart } from '../../slices/cartSlice';
import { setUser } from '../../slices/profileSlice';
import { apiConnector } from '../apiconnector';
import { endpoints } from '../apis';

const {
    SENDOTP_API,
    SIGNUP_API,
    LOGIN_API,
    RESETPASSTOKEN_API,
    RESETPASSWORD_API,
} = endpoints;

export function logout(navigate) {
  return (dispatch) => {
    dispatch(setToken(null));
    dispatch(setUser(null));
    dispatch(resetCart());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged Out");
    navigate("/");
  }
}
