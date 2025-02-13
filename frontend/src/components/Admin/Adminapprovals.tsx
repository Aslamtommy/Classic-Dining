import React, { useEffect, useState } from 'react';
import adminApi from '../../Axios/adminInstance';

// Define the type for a manager
interface Manager {
  _id: string;
  name: string;
  email: string;
  phone: string;
  certificate: string;
  isBlocked: boolean;
}

// Define the type for the API response
interface PendingManagersResponse {
  success: boolean;
  message: string;
  data: {
    managers: Manager[];
  };
}

const ApproveManagers: React.FC = () => {
  const [pendingManagers, setPendingManagers] = useState<Manager[]>([]); // Default is an empty array
  const [error, setError] = useState<string>('');

  // Fetch pending managers on component mount
  useEffect(() => {
    fetchPendingManagers();
  }, []);

  // Function to fetch pending managers
  const fetchPendingManagers = async () => {
    try {
      const response = await adminApi.get<PendingManagersResponse>('/pending');
      console.log('Response:', response.data); // Log the response

      // Access the managers array from the data field
      setPendingManagers(response.data.data.managers || []); // Set managers (fallback to empty array)
    } catch (err: any) {
      console.error('Error fetching pending managers:', err); // Log the error
      setError(err.response?.data?.message || 'Failed to fetch pending managers.');
    }
  };

  // Function to update manager status (approve or block)
  const handleUpdateStatus = async (managerId: string, isBlocked: boolean) => {
    try {
      await adminApi.post('/update-status', {
        managerId,
        isBlocked,
      });
      alert(`Manager ${isBlocked ? 'blocked' : 'approved'} successfully!`);
      // Remove the updated manager from the list
      setPendingManagers((prev) => prev.filter((manager) => manager._id !== managerId));
    } catch (err: any) {
      console.error('Error updating manager status:', err); // Log the error
      setError(err.response?.data?.message || 'Failed to update manager status.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Approve Managers</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {pendingManagers && pendingManagers.length > 0 ? (
        <table className="table-auto w-full border-collapse border border-gray-400">
          <thead>
            <tr>
              <th className="border border-gray-400 px-4 py-2">Name</th>
              <th className="border border-gray-400 px-4 py-2">Email</th>
              <th className="border border-gray-400 px-4 py-2">Phone</th>
              <th className="border border-gray-400 px-4 py-2">Certificate</th>
              <th className="border border-gray-400 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingManagers.map((manager) => (
              <tr key={manager._id}>
                <td className="border border-gray-400 px-4 py-2">{manager.name}</td>
                <td className="border border-gray-400 px-4 py-2">{manager.email}</td>
                <td className="border border-gray-400 px-4 py-2">{manager.phone}</td>
                <td className="border border-gray-400 px-4 py-2">
                  <a
                    href={manager.certificate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View Certificate
                  </a>
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  <button
                    onClick={() => handleUpdateStatus(manager._id, false)}
                    className="px-4 py-2 bg-green-500 text-white rounded mr-2 hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(manager._id, true)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Block
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No pending managers to approve.</p>
      )}
    </div>
  );
};

export default ApproveManagers;