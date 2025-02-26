import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfilePicture, setUser } from '../../redux/userslice';
import api from '../../Axios/userInstance';
import toast from 'react-hot-toast';
import OtpModal from '../CommonComponents/Modals/OtpModal';
import sendOtp from '../../utils/sentotp';
import NewPasswordModal from '../CommonComponents/Modals/NewPaawordModal';
import { motion } from 'framer-motion';
 
const UserProfile: React.FC = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state: any) => state.user.user);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedMobile, setEditedMobile] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setEditedName(profile.name);
      setEditedEmail(profile.email);
      setEditedMobile(profile.mobile);
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const response: any = await api.get('/profile');
      dispatch(setUser(response.data.data));
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async () => {
    if (editedEmail !== profile.email) {
      setTempEmail(editedEmail);
      const { success, message: otpMessage } = await sendOtp(editedEmail, dispatch);
      if (!success) {
        toast.error(otpMessage);
        return;
      }
      setShowOtpModal(true);
    } else {
      saveProfile();
    }
  };

  const saveProfile = async () => {
    try {
      const updatedData = {
        name: editedName,
        email: editedEmail,
        mobile: editedMobile,
      };

      const response: any = await api.put('/updateProfile', updatedData);
      dispatch(setUser(response.data.data));
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      console.error('Update error:', error);
    }
  };

  const handleOtpSuccess = async () => {
    await saveProfile();
    setShowOtpModal(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setPreview(previewURL);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', selectedFile);

    try {
      const response = await api.post<{ profilePicture: string }>('/uploadProfilePicture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedImageUrl = response.data.profilePicture;
      toast.success('Profile picture uploaded successfully');

      dispatch(updateProfilePicture(uploadedImageUrl));
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture.');
    }
  };

  return (

    
    <div className="bg-[#faf7f2] min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Profile Header */}
        <div className="text-center mb-16">
          <motion.h1
            className="font-playfair text-5xl text-[#2c2420] font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Your Profile
          </motion.h1>
          <div className="flex items-center justify-center">
            <div className="h-px w-16 bg-[#8b5d3b]"></div>
            <p className="mx-4 text-lg text-[#2c2420]/80">Personal Details</p>
            <div className="h-px w-16 bg-[#8b5d3b]"></div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Profile Picture Section */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col items-center">
              {profile.profilePicture || preview ? (
                <img
                  src={preview || profile.profilePicture}
                  alt="Profile"
                  className="w-48 h-48 rounded-full object-cover border-4 border-[#e8e2d9] shadow-lg"
                />
              ) : (
                <div className="w-48 h-48 rounded-full bg-[#e8e2d9] flex items-center justify-center border-4 border-[#e8e2d9] shadow-lg">
                  <span className="text-[#8b5d3b] text-xl font-playfair">No Image</span>
                </div>
              )}
              <div className="mt-6 space-y-4">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity text-sm uppercase tracking-wide inline-block"
                >
                  Change Picture
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {selectedFile && (
                  <button
                    onClick={handleUpload}
                    className="bg-gradient-to-r from-[#2c2420] to-[#8b5d3b] text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity text-sm uppercase tracking-wide block w-full"
                  >
                    Upload Picture
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Profile Details Section */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-[#2c2420] text-sm font-bold mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  className="w-full px-4 py-3 border border-[#e8e2d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5d3b] bg-[#faf7f2]"
                  id="name"
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <label className="block text-[#2c2420] text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  className="w-full px-4 py-3 border border-[#e8e2d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5d3b] bg-[#faf7f2]"
                  id="email"
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <label className="block text-[#2c2420] text-sm font-bold mb-2" htmlFor="phone">
                  Phone
                </label>
                <input
                  className="w-full px-4 py-3 border border-[#e8e2d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5d3b] bg-[#faf7f2]"
                  id="phone"
                  type="tel"
                  value={editedMobile}
                  onChange={(e) => setEditedMobile(e.target.value)}
                  readOnly={!isEditing}
                />
              </div>

              {/* Edit/Save Buttons */}
              <div className="mt-8 flex gap-4 justify-end">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedName(profile.name);
                        setEditedEmail(profile.email);
                        setEditedMobile(profile.mobile);
                      }}
                      className="bg-[#e8e2d9] text-[#2c2420] px-6 py-2 rounded-full hover:bg-[#d4ccc2] transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>

              {/* Change Password Button */}
              <div className="mt-4">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity w-full"
                >
                  Change Password
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* OTP Modal */}
        {showOtpModal && (
          <OtpModal
            show={showOtpModal}
            email={tempEmail}
            onClose={() => setShowOtpModal(false)}
            onSuccess={handleOtpSuccess}
          />
        )}

        {/* Change Password Modal */}
        {showPasswordModal && (
          <NewPasswordModal
            show={showPasswordModal}
            email={profile.email}
            onClose={() => setShowPasswordModal(false)}
            role="user"
          />
        )}
 
      </div>
    </div>
  );
};

export default UserProfile;