// utils/sendOtp.ts
import api from '../Axios/userInstance';
import { setLoading, setError } from '../redux/userslice';
import { setOtpSent } from '../redux/otpslice';
import { Dispatch } from 'redux';

const sendOtp = async (email: string, dispatch: Dispatch): Promise<{ success: boolean; message: string }> => {
  try {
    dispatch(setLoading());
    await api.post('/otp/send', { email });
    dispatch(setOtpSent(email));
    return { success: true, message: 'OTP sent successfully to your email.' };
  } catch (error: any) {
    console.error(error);
    const errorMessage = error.response?.data?.message || 'Error sending OTP. Please try again.';
    dispatch(setError(errorMessage));
    return { success: false, message: errorMessage };
  }
};

export default sendOtp;
