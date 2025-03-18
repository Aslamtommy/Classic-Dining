import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import restaurentApi from "../../Axios/restaurentInstance";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const GOOGLE_MAPS_API_KEY = "AIzaSyCmtwdLj4ezHr_PmZunPte9-bb14e4OUNU"; // Replace with your API key

const AddBranch = () => {
  const [image, setImage] = useState<File | null>(null);
  const { restaurent } = useSelector((state: RootState) => state.restaurent);
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required").min(4, "Name must be at least 4 characters"),
    email: Yup.string().email("Invalid email address").required("Email is required"),
    phone: Yup.string().matches(/^\d{10}$/, "Phone number must be 10 digits").required("Phone is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    address: Yup.string().required("Address is required"),
    longitude: Yup.number().required("Longitude is required").min(-180).max(180),
    latitude: Yup.number().required("Latitude is required").min(-90).max(90),
    image: Yup.mixed().required("Image is required").test("fileSize", "File size must be less than 5MB", (value) => {
      if (value) {
        const file = value as File;
        return file.size <= 5 * 1024 * 1024;
      }
      return false;
    }),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      address: "",
      longitude: "",
      latitude: "",
      image: null as File | null,
    },
    validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("phone", values.phone);
      formData.append("password", values.password);
      formData.append("address", values.address);
      formData.append("longitude", values.longitude.toString());
      formData.append("latitude", values.latitude.toString());
      formData.append("parentRestaurant", restaurent?._id || "");
      if (values.image) {
        formData.append("image", values.image);
      }

      try {
        const response = await restaurentApi.post("/branches", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Branch created successfully!");
        navigate("/restaurent/branches");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to create branch");
      }
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setImage(file);
    formik.setFieldValue("image", file);
  };

  // Geocode address to get longitude and latitude
  const handleAddressBlur = async () => {
    const address = formik.values.address.trim();
    if (!address) return;

    try {
      const response:any = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const results = response.data.results;
      if (results.length > 0) {
        const { lat, lng } = results[0].geometry.location;
        formik.setFieldValue("latitude", lat);
        formik.setFieldValue("longitude", lng);
      } else {
        toast.error("Could not find coordinates for this address.");
      }
    } catch (error) {
      toast.error("Failed to geocode address.");
      console.error(error);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Add Branch</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              placeholder="Enter branch name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {formik.touched.name && formik.errors.name && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.name}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter branch email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="text"
              placeholder="Enter branch phone"
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {formik.touched.phone && formik.errors.phone && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.phone}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter branch password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              placeholder="Enter branch address (e.g., 123 Main St, New York, NY)"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={(e) => {
                formik.handleBlur(e);
                handleAddressBlur(); // Trigger geocoding on blur
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {formik.touched.address && formik.errors.address && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.address}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
            <input
              type="number"
              placeholder="Auto-filled from address"
              name="longitude"
              value={formik.values.longitude}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              readOnly // Optional: Make it read-only since it’s auto-filled
            />
            {formik.touched.longitude && formik.errors.longitude && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.longitude}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
            <input
              type="number"
              placeholder="Auto-filled from address"
              name="latitude"
              value={formik.values.latitude}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              readOnly // Optional: Make it read-only since it’s auto-filled
            />
            {formik.touched.latitude && formik.errors.latitude && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.latitude}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Branch Image</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-all">
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-8 h-8 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-sm text-gray-500">{image ? image.name : "Upload an image"}</span>
                </div>
                <input type="file" name="image" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            {formik.touched.image && formik.errors.image && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.image}</div>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
            >
              Add Branch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBranch;