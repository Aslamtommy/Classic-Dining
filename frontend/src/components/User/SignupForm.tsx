import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import api from '../../Axios/userInstance';
import { setLoading, setError, setUser } from '../../redux/userslice';
import OtpModal from '../../components/CommonComponents/Modals/OtpModal';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import App from '../../../Config/firebaseConfig';
import sendOtp from '../../utils/sentotp';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { SignupFormInputs, SignupResponse, GoogleSignInResponse, AxiosError } from '../../types/auth';
import { toast } from 'react-hot-toast';

// Yup validation schema
const validationSchema = yup
  .object({ 
    name: yup
      .string()
      .matches(/^[A-Za-z ]+$/, 'Only alphabets and spaces are allowed')
      .min(3, 'Name must be at least 3 characters')
      .required('Name is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    password: yup
      .string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .matches(
        /[!@#$%^&*(),.?":{}|<>]/,
        'Password must contain at least one special character'
      )
      .required('Password is required'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords do not match')
      .required('Confirm Password is required'),
    mobile: yup
      .string()
      .matches(/^\d{10}$/, 'Mobile number must be 10 digits')
      .required('Mobile number is required'),
  })
  .required();

const SignupForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>('');
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SignupFormInputs>({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (data: SignupFormInputs) => {
    setMessage('');

    const { success, message: otpMessage } = await sendOtp(data.email, dispatch);
    setMessage(otpMessage);
    toast.success(otpMessage);

    if (success) {
      setShowOtpModal(true);
    }
  };

  const handleOtpSuccess = async (successMessage: string) => {
    setMessage(successMessage);
    setShowOtpModal(false);
    toast.success(successMessage);

    const data = getValues();

    try {
      dispatch(setLoading());
      const response = await api.post<SignupResponse>('/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        mobile: data.mobile,
      });

      const { user } = response.data.data;
      dispatch(setUser({
        name: user.name,
        email: user.email,
        mobile: user.mobile || '', // Default to empty string if undefined
      }));
      setMessage(response.data.message || 'User registered successfully!');
      toast.success('User registered successfully!');
      navigate('/login');
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Signup error:', error);

      const errorMessage = axiosError.response?.data?.message || 'Error registering user.';
      if (errorMessage === 'User with this email already exists') {
        setMessage('This email is already registered. Please use a different email.');
        toast.error('This email is already registered. Please use a different email.');
      } else {
        dispatch(setError(errorMessage));
        setMessage('Error registering user. Please try again.');
        toast.error('Error registering user. Please try again.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const auth = getAuth(App);
    const provider = new GoogleAuthProvider();

    try {
      dispatch(setLoading());
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const response = await api.post<GoogleSignInResponse>('/google', {
        idToken,
      });

      const user = response.data.data;
      dispatch(setUser({
        name: user.name,
        email: user.email,
        mobile: user.mobile || '', // Default to empty string if undefined
      }));
      setMessage('Google Sign-In successful!');
      navigate('/');
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Google Sign-In error:', error);
      
      const errorMessage = 
        axiosError.response?.data?.message || 'Google Sign-In failed. Please try again.';
      setMessage(`Google Sign-In failed: ${errorMessage}`);
      dispatch(setError(errorMessage));
    }
  };

  return (
    <div className="bg-[#faf7f2] p-6 min-h-screen flex justify-center items-center">
      <div className="bg-white border border-[#8b5d3b] shadow-lg rounded-lg w-full max-w-md p-8">
        <h2 className="text-3xl font-playfair text-[#2c2420] mb-6 text-center">
          User Registration
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#2c2420] mb-2">Name</label>
            <Controller
              name="name"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-[#8b5d3b] rounded bg-[#faf7f2] focus:outline-none focus:ring-2 focus:ring-[#8b5d3b]"
                />
              )}
            />
            {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#2c2420] mb-2">Email</label>
            <Controller
              name="email"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-[#8b5d3b] rounded bg-[#faf7f2] focus:outline-none focus:ring-2 focus:ring-[#8b5d3b]"
                />
              )}
            />
            {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#2c2420] mb-2">Password</label>
            <Controller
              name="password"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  type="password"
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 border border-[#8b5d3b] rounded bg-[#faf7f2] focus:outline-none focus:ring-2 focus:ring-[#8b5d3b]"
                />
              )}
            />
            {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#2c2420] mb-2">
              Confirm Password
            </label>
            <Controller
              name="confirmPassword"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  type="password"
                  placeholder="Confirm your password"
                  className="w-full px-3 py-2 border border-[#8b5d3b] rounded bg-[#faf7f2] focus:outline-none focus:ring-2 focus:ring-[#8b5d3b]"
                />
              )}
            />
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#2c2420] mb-2">Mobile No</label>
            <Controller
              name="mobile"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Enter your mobile number"
                  className="w-full px-3 py-2 border border-[#8b5d3b] rounded bg-[#faf7f2] focus:outline-none focus:ring-2 focus:ring-[#8b5d3b]"
                />
              )}
            />
            {errors.mobile && <p className="text-red-600 text-sm">{errors.mobile.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-[#2c2420] text-white font-semibold rounded hover:bg-[#8b5d3b] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b5d3b]"
          >
            Send OTP
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#2c2420]/80">Or sign up with:</p>
          <button
            onClick={handleGoogleSignIn}
            className="mt-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-500 transition-colors"
          >
            Sign in with Google
          </button>
        </div>

        {message && (
          <p className="mt-4 text-center text-sm font-medium text-[#8b5d3b]">{message}</p>
        )}
      </div>

      {showOtpModal && (
        <OtpModal
          email={getValues('email')}
          onClose={() => setShowOtpModal(false)}
          onSuccess={handleOtpSuccess}
          show={showOtpModal}
        />
      )}
    </div>
  );
};

export default SignupForm;