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
import { motion, AnimatePresence } from 'framer-motion';
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

interface SignupModalProps {
  show: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ show, onClose, onLoginClick }) => {
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
        mobile: user.mobile || '',
      }));
      setMessage('User registered successfully!');
      toast.success('User registered successfully!');
      onClose();
      onLoginClick(); // Open login modal after signup
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
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
        mobile: user.mobile || '',
      }));
      setMessage('Google Sign-In successful!');
      toast.success('Google Sign-In successful!');
      onClose();
      navigate('/');
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorMessage = axiosError.response?.data?.message || 'Google Sign-In failed.';
      setMessage(`Google Sign-In failed: ${errorMessage}`);
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-sepia-50 rounded-lg shadow-2xl border-2 border-sepia-300 w-full max-w-md p-8 relative"
        >
          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-sepia-300"></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-sepia-300"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-sepia-300"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-sepia-300"></div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-sepia-700 hover:text-sepia-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-3xl font-playfair text-sepia-900 mb-6 text-center">
            Create an Account
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-playfair text-sepia-700 mb-1">Name</label>
              <Controller
                name="name"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 bg-sepia-50 border-2 border-sepia-300 rounded-none focus:outline-none focus:ring-2 focus:ring-sepia-500 text-sepia-900 font-playfair"
                  />
                )}
              />
              {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-playfair text-sepia-700 mb-1">Email</label>
              <Controller
                name="email"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 bg-sepia-50 border-2 border-sepia-300 rounded-none focus:outline-none focus:ring-2 focus:ring-sepia-500 text-sepia-900 font-playfair"
                  />
                )}
              />
              {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-playfair text-sepia-700 mb-1">Password</label>
              <Controller
                name="password"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="password"
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 bg-sepia-50 border-2 border-sepia-300 rounded-none focus:outline-none focus:ring-2 focus:ring-sepia-500 text-sepia-900 font-playfair"
                  />
                )}
              />
              {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-playfair text-sepia-700 mb-1">Confirm Password</label>
              <Controller
                name="confirmPassword"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="password"
                    placeholder="Confirm your password"
                    className="w-full px-4 py-2 bg-sepia-50 border-2 border-sepia-300 rounded-none focus:outline-none focus:ring-2 focus:ring-sepia-500 text-sepia-900 font-playfair"
                  />
                )}
              />
              {errors.confirmPassword && <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-playfair text-sepia-700 mb-1">Mobile No</label>
              <Controller
                name="mobile"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter your mobile number"
                    className="w-full px-4 py-2 bg-sepia-50 border-2 border-sepia-300 rounded-none focus:outline-none focus:ring-2 focus:ring-sepia-500 text-sepia-900 font-playfair"
                  />
                )}
              />
              {errors.mobile && <p className="text-red-600 text-sm">{errors.mobile.message}</p>}
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-sepia-700 text-sepia-50 rounded-none font-playfair font-medium hover:bg-sepia-800 transition-colors"
            >
              Send OTP
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm font-playfair text-sepia-700 mb-2">Or sign up with:</p>
            <motion.button
              onClick={handleGoogleSignIn}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-red-700 text-sepia-50 py-2 px-4 rounded-none hover:bg-red-800 transition-colors font-playfair"
            >
              Sign in with Google
            </motion.button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm font-playfair text-sepia-700">
              Already have an account?{' '}
              <button onClick={onLoginClick} className="text-sepia-900 hover:underline">
                Log In
              </button>
            </p>
          </div>

          {message && (
            <p className="mt-4 text-center text-sm font-playfair text-sepia-700">{message}</p>
          )}

          {showOtpModal && (
            <OtpModal
              email={getValues('email')}
              onClose={() => setShowOtpModal(false)}
              onSuccess={handleOtpSuccess}
              show={showOtpModal}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SignupModal;