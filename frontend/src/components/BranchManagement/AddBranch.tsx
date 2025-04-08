import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import restaurentApi from "../../Axios/restaurentInstance";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const GOOGLE_MAPS_API_KEY = "AIzaSyCmtwdLj4ezHr_PmZunPte9-bb14e4OUNU";

const AddBranch = () => {
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [interiorImagesPreview, setInteriorImagesPreview] = useState<string[]>([]);
  const [loading, setLoading] = useState(false); // Add loading state
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
    mainImage: Yup.mixed()
      .required("Main image is required")
      .test("fileSize", "File size must be less than 5MB", (value) => {
        if (value) {
          const file = value as File;
          return file.size <= 5 * 1024 * 1024;
        }
        return false;
      }),
    interiorImages: Yup.array()
      .of(
        Yup.mixed()
          .test("fileSize", "Each file must be less than 5MB", (value) => {
            if (value) {
              const file = value as File;
              return file.size <= 5 * 1024 * 1024;
            }
            return true;
          })
      )
      .max(3, "You can upload up to 3 interior images"),
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
      mainImage: null as File | null,
      interiorImages: [] as File[],
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true); // Start loading
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("phone", values.phone);
      formData.append("password", values.password);
      formData.append("address", values.address);
      formData.append("longitude", values.longitude.toString());
      formData.append("latitude", values.latitude.toString());
      formData.append("parentRestaurant", restaurent?._id || "");
      if (values.mainImage) {
        formData.append("mainImage", values.mainImage);
      }
      values.interiorImages.forEach((image) => {
        formData.append("interiorImages", image);
      });

      try {
        const response = await restaurentApi.post("/branches", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Branch successfully added!"); // Updated success message
        setLoading(false); // Stop loading
        navigate("/restaurent/branches"); // Navigate after success
      } catch (error: any) {
        setLoading(false); // Stop loading on error
        toast.error(error.response?.data?.message || "Failed to create branch");
      }
    },
  });

  const handleMainImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setMainImagePreview(URL.createObjectURL(file));
      formik.setFieldValue("mainImage", file);
    }
  };

  const handleInteriorImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + formik.values.interiorImages.length > 3) {
      toast.error("You can upload up to 3 interior images.");
      return;
    }
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setInteriorImagesPreview((prev) => [...prev, ...newPreviews]);
    formik.setFieldValue("interiorImages", [...formik.values.interiorImages, ...files]);
  };

  const removeInteriorImage = (index: number) => {
    const updatedImages = formik.values.interiorImages.filter((_, i) => i !== index);
    const updatedPreviews = interiorImagesPreview.filter((_, i) => i !== index);
    setInteriorImagesPreview(updatedPreviews);
    formik.setFieldValue("interiorImages", updatedImages);
  };

  const handleAddressBlur = async () => {
    const address = formik.values.address.trim();
    if (!address) return;

    try {
      const response: any = await axios.get(
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
    <div className="p-8 bg-[#f8f1ea] min-h-screen font-sans">
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-xl border border-[#e8e2d9]">
        <h2 className="text-4xl font-playfair text-[#2c2420] font-bold mb-8 tracking-tight">Add New Branch</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-8">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#2c2420] mb-2">Branch Name</label>
            <input
              type="text"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter branch name"
              className="w-full p-3 border border-[#e8e2d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5d3b] bg-[#faf7f2] text-[#2c2420] transition-all"
              disabled={loading} // Disable input during loading
            />
            {formik.touched.name && formik.errors.name && (
              <div className="text-red-600 text-sm mt-1">{formik.errors.name}</div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#2c2420] mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter branch email"
              className="w-full p-3 border border-[#e8e2d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5d3b] bg-[#faf7f2] text-[#2c2420] transition-all"
              disabled={loading}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-600 text-sm mt-1">{formik.errors.email}</div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-[#2c2420] mb-2">Phone</label>
            <input
              type="text"
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter 10-digit phone number"
              className="w-full p-3 border border-[#e8e2d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5d3b] bg-[#faf7f2] text-[#2c2420] transition-all"
              disabled={loading}
            />
            {formik.touched.phone && formik.errors.phone && (
              <div className="text-red-600 text-sm mt-1">{formik.errors.phone}</div>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-[#2c2420] mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter branch password"
              className="w-full p-3 border border-[#e8e2d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5d3b] bg-[#faf7f2] text-[#2c2420] transition-all"
              disabled={loading}
            />
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-600 text-sm mt-1">{formik.errors.password}</div>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-[#2c2420] mb-2">Address</label>
            <input
              type="text"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={(e) => {
                formik.handleBlur(e);
                handleAddressBlur();
              }}
              placeholder="Enter branch address"
              className="w-full p-3 border border-[#e8e2d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5d3b] bg-[#faf7f2] text-[#2c2420] transition-all"
              disabled={loading}
            />
            {formik.touched.address && formik.errors.address && (
              <div className="text-red-600 text-sm mt-1">{formik.errors.address}</div>
            )}
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2c2420] mb-2">Longitude</label>
              <input
                type="number"
                name="longitude"
                value={formik.values.longitude}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Auto-filled from address"
                readOnly
                className="w-full p-3 border border-[#e8e2d9] rounded-lg bg-[#f0ede8] text-[#2c2420] cursor-not-allowed"
              />
              {formik.touched.longitude && formik.errors.longitude && (
                <div className="text-red-600 text-sm mt-1">{formik.errors.longitude}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2c2420] mb-2">Latitude</label>
              <input
                type="number"
                name="latitude"
                value={formik.values.latitude}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Auto-filled from address"
                readOnly
                className="w-full p-3 border border-[#e8e2d9] rounded-lg bg-[#f0ede8] text-[#2c2420] cursor-not-allowed"
              />
              {formik.touched.latitude && formik.errors.latitude && (
                <div className="text-red-600 text-sm mt-1">{formik.errors.latitude}</div>
              )}
            </div>
          </div>

          {/* Main Image */}
          <div>
            <label className="block text-sm font-medium text-[#2c2420] mb-2">Main Image</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#e8e2d9] rounded-lg cursor-pointer hover:border-[#8b5d3b] transition-all bg-[#faf7f2]">
                {mainImagePreview ? (
                  <img src={mainImagePreview} alt="Main Preview" className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-8 h-8 text-[#8b5d3b] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-sm text-[#8b5d3b]">Upload main image</span>
                  </div>
                )}
                <input type="file" name="mainImage" onChange={handleMainImageChange} className="hidden" accept="image/*" disabled={loading} />
              </label>
            </div>
            {formik.touched.mainImage && formik.errors.mainImage && (
              <div className="text-red-600 text-sm mt-1">{formik.errors.mainImage}</div>
            )}
          </div>

          {/* Interior Images */}
          <div>
            <label className="block text-sm font-medium text-[#2c2420] mb-2">Interior Images (up to 3)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#e8e2d9] rounded-lg cursor-pointer hover:border-[#8b5d3b] transition-all bg-[#faf7f2]">
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-8 h-8 text-[#8b5d3b] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-sm text-[#8b5d3b]">Upload interior images</span>
                </div>
                <input
                  type="file"
                  multiple
                  name="interiorImages"
                  onChange={handleInteriorImagesChange}
                  className="hidden"
                  accept="image/*"
                  disabled={loading}
                />
              </label>
            </div>
            {interiorImagesPreview.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {interiorImagesPreview.map((preview, index) => (
                  <div key={index} className="relative">
                    <img src={preview} alt={`Interior ${index + 1}`} className="h-24 w-full object-cover rounded-lg shadow-md" />
                    <button
                      type="button"
                      onClick={() => removeInteriorImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition-all"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {formik.touched.interiorImages && formik.errors.interiorImages && (
              <div className="text-red-600 text-sm mt-1">
                {Array.isArray(formik.errors.interiorImages)
                  ? formik.errors.interiorImages.filter(Boolean).join(", ")
                  : formik.errors.interiorImages}
              </div>
            )}
          </div>

          {/* Submit Button with Loading State */}
          <div>
            <button
              type="submit"
              disabled={loading} // Disable button during loading
              className={`w-full bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5d3b] transition-all shadow-md ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:from-[#2c2420] hover:to-[#8b5d3b]"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"></path>
                  </svg>
                  Adding Branch...
                </span>
              ) : (
                "Add Branch"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBranch;