import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfilePicture, setUser } from '../../redux/userslice';
import api from '../../Axios/userInstance';

 

const UserProfile: React.FC = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state: any) => state.user.user);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
const storedUser=useSelector((state:any)=>state.user.user)
const email=storedUser?.email
  useEffect(() => {
    
   
      const fetchProfile = async () => {
        try {
          const response:any = await api.get ('/profile',{ params: { email } } );
          console.log('Fetched profile:', response.data.user);
          dispatch(setUser(response.data.user));
          localStorage.setItem('userProfile', JSON.stringify(response.data.user));
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      };
      fetchProfile();
   
  }, [dispatch]);

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

      alert('Profile picture updated successfully!');

      dispatch(updateProfilePicture(uploadedImageUrl));

      const updatedProfile = { ...profile, profilePicture: uploadedImageUrl };
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

      setPreview(null);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture.');
    }
  };

  return (
    <div className="min-h-screen bg-sepia-100 flex flex-col justify-center items-center p-4">
      <div className="bg-sepia-50 border-2 border-sepia-300 shadow-xl rounded-none p-12 max-w-2xl w-full relative overflow-hidden">
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-sepia-300"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-sepia-300"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-sepia-300"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-sepia-300"></div>

        {profile ? (
          <div className="relative z-10">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-playfair font-bold text-sepia-900 mb-2">
                Profile
              </h1>
              <div className="w-24 h-1 bg-sepia-300 mx-auto"></div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="w-40 flex-shrink-0">
                {profile.profilePicture || preview ? (
                  <img
                    src={preview || profile.profilePicture}
                    alt="Profile"
                    className="w-40 h-40 rounded-full object-cover border-4 border-sepia-300 shadow-lg"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-full bg-sepia-200 flex items-center justify-center border-4 border-sepia-300 shadow-lg">
                    <span className="text-sepia-500 text-xl font-playfair">No Image</span>
                  </div>
                )}
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer bg-sepia-700 text-sepia-100 px-4 py-2 rounded-full hover:bg-sepia-800 transition-colors duration-300 text-sm uppercase tracking-wide inline-block">
                    Select New Picture
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                {selectedFile && (
                  <button
                    onClick={handleUpload}
                    className="mt-2 bg-sepia-800 text-sepia-100 px-4 py-2 rounded-full hover:bg-sepia-900 transition-colors duration-300 text-sm uppercase tracking-wide block w-full"
                  >
                    Upload Picture
                  </button>
                )}
              </div>

              <div className="flex-grow">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sepia-700 text-sm font-bold mb-2" htmlFor="name">
                      Name
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-sepia-900 leading-tight focus:outline-none focus:shadow-outline bg-sepia-100"
                      id="name"
                      type="text"
                      value={profile.name}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sepia-700 text-sm font-bold mb-2" htmlFor="email">
                      Email
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-sepia-900 leading-tight focus:outline-none focus:shadow-outline bg-sepia-100"
                      id="email"
                      type="email"
                      value={profile.email}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sepia-700 text-sm font-bold mb-2" htmlFor="phone">
                      Phone
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-sepia-900 leading-tight focus:outline-none focus:shadow-outline bg-sepia-100"
                      id="phone"
                      type="tel"
                      value={profile.mobile_no}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-sepia-300 border-t-sepia-800 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sepia-700 font-lora">Loading your profile...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

