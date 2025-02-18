import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import restaurentApi from "../../Axios/restaurentInstance";
import toast from "react-hot-toast";

const EditBranch = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    image: null as File | null,
    currentImage: ""
  });

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const response:any = await restaurentApi.get(`/branches/${branchId}`);
        const { name, email, phone, image } = response.data.data;
        setFormData(prev => ({
          ...prev,
          name,
          email,
          phone,
          currentImage: image
        }));
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to fetch branch");
      }
    };
    fetchBranch();
  }, [branchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("phone", formData.phone);
    if (formData.password) formDataToSend.append("password", formData.password);
    if (formData.image) formDataToSend.append("image", formData.image);

    try {
      await restaurentApi.put(`/branches/${branchId}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Branch updated successfully!");
      navigate("/restaurent/branches");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Branch</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {formData.currentImage && (
          <div className="mb-4">
            <img
              src={formData.currentImage}
              alt="Current Branch"
              className="h-32 rounded"
            />
          </div>
        )}
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Phone"
          value={formData.phone}
          onChange={e => setFormData({ ...formData, phone: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="New Password (leave empty to keep current)"
          value={formData.password}
          onChange={e => setFormData({ ...formData, password: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <input
          type="file"
          onChange={e => setFormData({ 
            ...formData, 
            image: e.target.files?.[0] || null 
          })}
          className="w-full p-2 border rounded"
        />
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Update Branch
          </button>
          <button
            type="button"
            onClick={() => navigate("/restaurent/branches")}
            className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBranch;