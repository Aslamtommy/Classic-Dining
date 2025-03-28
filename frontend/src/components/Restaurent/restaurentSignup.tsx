// src/components/RestaurentSignup.tsx
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import { setLoading, setRestaurent, setError } from "../../redux/restaurentSlice";
import restaurentApi from "../../Axios/restaurentInstance";
import OtpModal from "../CommonComponents/Modals/OtpModal";
import sendOtp from "../../utils/sentotp";
import {
  SignupFormData,
  RestaurentResponse,
  RestaurentState,
   
} from "../../types/restaurent";

// Validation Schema
const validationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must include at least one uppercase, one lowercase, one number, and one special character"
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
  phone: yup
    .string()
    .matches(/^\d{10}$/, "Phone must be a valid 10-digit number")
    .required("Phone is required"),
  certificate: yup
    .mixed<File>()
    .required("Certificate is required")
    .test(
      "fileFormat",
      "Unsupported file format. Only PDF, PNG, and JPG are allowed.",
      (value: File | undefined) => {
        if (value) {
          const supportedFormats = ["application/pdf", "image/png", "image/jpeg"];
          return supportedFormats.includes(value.type);
        }
        return false;
      }
    ),
});

const RestaurentSignup: React.FC = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: yupResolver(validationSchema),
  });

  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const dispatch = useDispatch();
  const { loading, error } = useSelector<RootState, RestaurentState>(
    (state) => state.restaurent
  );
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignupFormData | null>(null);

  useEffect(() => {
    return () => {
      dispatch(setError(""));
    };
  }, [dispatch]);

  const onSubmit = async (data: SignupFormData) => {
    setFormData(data);
    const result = await sendOtp(data.email, dispatch);
    if (result.success) {
      setShowOtpModal(true);
    }
  };

  const completeRegistration = async () => {
    if (!formData) return;

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "confirmPassword") {
        if (value instanceof File) {
          formDataToSend.append(key, value);
        } else {
          formDataToSend.append(key, value.toString());
        }
      }
    });

    try {
      dispatch(setLoading());
      const response  = await restaurentApi.post<RestaurentResponse>(

       
        "/signup",  
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log('response',response )
      
      // Correctly access the Restaurent object from response.data.data
      dispatch(setRestaurent(response.data.data));  
      setShowOtpModal(false);
      navigate("/restaurent/login");
    } catch (err) {
      const errorMessage =
        err instanceof Error && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Signup failed";
      dispatch(setError(errorMessage || "Signup failed"));
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Restaurant Signup</h2>
      {error && (
        <p className="text-red-500 text-sm mb-4">
          {error.split(", ").map((msg, i) => (
            <span key={i}>
              • {msg}
              <br />
            </span>
          ))}
        </p>
      )}

      {!showOtpModal && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="name" className="font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              {...register("name")}
              className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="email" className="font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register("email")}
              className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password")}
              className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="confirmPassword" className="font-medium mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              {...register("confirmPassword")}
              className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="phone" className="font-medium mb-1">
              Phone
            </label>
            <input
              type="text"
              id="phone"
              {...register("phone")}
              className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="certificate" className="font-medium mb-1">
              Certificate (PDF, PNG, JPG)
            </label>
            <Controller
              name="certificate"
              control={control}
              render={({ field }) => (
                <input
                  type="file"
                  id="certificate"
                  onChange={(e) => field.onChange(e.target.files?.[0])}
                  className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              )}
            />
            {errors.certificate && (
              <p className="text-red-500 text-sm">{errors.certificate.message}</p>
            )}
          </div>

          <button
            type="submit"
            className={`w-full py-2 text-white font-medium rounded ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={loading}
          >
            {loading ? "Processing..." : "Signup"}
          </button>
        </form>
      )}

      {showOtpModal && formData && (
        <OtpModal
          email={formData.email}
          show={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          onSuccess={completeRegistration}
        />
      )}
    </div>
  );
};

export default RestaurentSignup;