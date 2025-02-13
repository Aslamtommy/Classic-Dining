import type React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import managerApi from "../../Axios/managerInstance";
import type { RootState } from "../../redux/store";
import { setProfile, setError, setLoading } from "../../redux/managerSlice";
import toast from 'react-hot-toast'
const ManagerProfile: React.FC = () => {
  const dispatch = useDispatch();
  const { manager, profile, loading, error } = useSelector(
    (state: RootState) => state.manager
  );

  useEffect(() => {
    if (!manager) {
      dispatch(setError("Manager not logged in."));
      return;
    }

    const fetchProfile = async () => {
      try {
        dispatch(setLoading());
        const response: any = await managerApi.get(`/profile/${manager._id}`);
        dispatch(setProfile(response.data.data));
        console.log(response)
      } catch (err) {
        dispatch(setError("Failed to fetch profile."));
      }
    };

    fetchProfile();
  }, [dispatch, manager]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f4ede8]">
        <div className="w-12 h-12 border-4 border-[#6b4f4f] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f4ede8]">
        <p className="text-[#5a3e36] font-serif text-lg">Error: {error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f4ede8] flex justify-center items-center px-6 py-12">
      <div className="bg-[#fffaf0] shadow-lg rounded-xl p-8 max-w-lg w-full border border-[#d2b48c] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-[#b08a60]"></div>
        <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-[#b08a60]"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-[#b08a60]"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-[#b08a60]"></div>

        <h1 className="text-2xl font-serif font-bold text-[#5a3e36] mb-6 text-center">
          Manager Profile
        </h1>

        {profile ? (
          <div className="space-y-4">
            <div className="flex items-center border-b border-[#d2b48c] pb-3">
              <span className="text-[#7a5c45] font-serif w-24">Name:</span>
              <span className="text-[#5a3e36] font-serif flex-1">{profile.name}</span>
            </div>
            <div className="flex items-center border-b border-[#d2b48c] pb-3">
              <span className="text-[#7a5c45] font-serif w-24">Email:</span>
              <span className="text-[#5a3e36] font-serif flex-1">{profile.email}</span>
            </div>
            <div className="flex items-center border-b border-[#d2b48c] pb-3">
              <span className="text-[#7a5c45] font-serif w-24">Phone:</span>
              <span className="text-[#5a3e36] font-serif flex-1">{profile.phone}</span>
            </div>
            <div className="pt-4">
              <span className="text-[#7a5c45] font-serif block mb-2">Certificate:</span>
              <a
                href={profile.certificate}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#6b4f4f] text-[#fffaf0] px-4 py-2 rounded-md hover:bg-[#5a3e36] transition-colors duration-300 font-serif text-sm uppercase tracking-wide"
              >
                View Certificate
              </a>
            </div>
          </div>
        ) : (
          <p className="text-[#7a5c45] font-serif text-center">No profile data available.</p>
        )}
      </div>
    </div>
  );
};

export default ManagerProfile;
