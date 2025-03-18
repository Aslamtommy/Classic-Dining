import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import restaurentApi from "../../Axios/restaurentInstance";
import toast from "react-hot-toast";

const EditBranch = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required").min(4, "Name must be at least 4 characters"),
    email: Yup.string().email("Invalid email address").required("Email is required"),
    phone: Yup.string().matches(/^\d{10}$/, "Phone number must be 10 digits").required("Phone is required"),
    address: Yup.string().required("Address is required"),
    longitude: Yup.number().required("Longitude is required").min(-180).max(180),
    latitude: Yup.number().required("Latitude is required").min(-90).max(90),
    password: Yup.string().min(6, "Password must be at least 6 characters").optional(),
    image: Yup.mixed().nullable().test("fileSize", "File size must be less than 5MB", (value) => {
      if (value) {
        const file = value as File;
        return file.size <= 5 * 1024 * 1024;
      }
      return true;
    }),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      longitude: "",
      latitude: "",
      password: "",
      image: null as File | null,
      currentImage: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      const formDataToSend = new FormData();
      formDataToSend.append("name", values.name);
      formDataToSend.append("email", values.email);
      formDataToSend.append("phone", values.phone);
      formDataToSend.append("address", values.address);
      formDataToSend.append("longitude", values.longitude.toString());
      formDataToSend.append("latitude", values.latitude.toString());
      if (values.password) formDataToSend.append("password", values.password);
      if (values.image) formDataToSend.append("image", values.image);

      try {
        await restaurentApi.put(`/branches/${branchId}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Branch updated successfully!");
        navigate("/restaurent/branches");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Update failed");
      }
    },
  });

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const response: any = await restaurentApi.get(`/branches/${branchId}`);
        const { name, email, phone, address, location, image } = response.data.data;
        formik.setValues({
          name,
          email,
          phone,
          address: address || "",
          longitude: location?.coordinates[0] || "",
          latitude: location?.coordinates[1] || "",
          password: "",
          image: null,
          currentImage: image,
        });
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to fetch branch");
      }
    };
    fetchBranch();
  }, [branchId]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    formik.setFieldValue("image", file);
  };

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Edit Branch</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {formik.values.currentImage && (
            <div className="mb-6">
              <img
                src={formik.values.currentImage}
                alt="Current Branch"
                className="h-48 w-full object-cover rounded-lg shadow-md"
              />
            </div>
          )}

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
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              placeholder="Enter branch address"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
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
              placeholder="Enter longitude (e.g., -73.935242)"
              name="longitude"
              value={formik.values.longitude}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {formik.touched.longitude && formik.errors.longitude && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.longitude}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
            <input
              type="number"
              placeholder="Enter latitude (e.g., 40.730610)"
              name="latitude"
              value={formik.values.latitude}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {formik.touched.latitude && formik.errors.latitude && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.latitude}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              placeholder="Leave empty to keep current password"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Branch Image</label>
            <input
              type="file"
              name="image"
              onChange={handleImageChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {formik.touched.image && formik.errors.image && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.image}</div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              Update Branch
            </button>
            <button
              type="button"
              onClick={() => navigate("/restaurent/branches")}
              className="flex-1 bg-gradient-to-r from-gray-500 to-slate-600 text-white p-3 rounded-lg hover:from-gray-600 hover:to-slate-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBranch;