import React, { useEffect, useState } from 'react';
import axios from 'axios';
import adminApi from '../../Axios/adminInstance';

// Define the type for a manager
interface Manager {
  _id: string;
  name: string;
  email: string;
  phone: string;
  certificate: string;  
}

// Define the type for the API response
interface PendingManagersResponse {
  success: boolean;
  pendingManagers: Manager[];
}

const ApproveManagers: React.FC = () => {
  const [pendingManagers, setPendingManagers] = useState<Manager[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPendingManagers = async () => {
      try {
        const response = await adminApi.get<PendingManagersResponse>(
          'http://localhost:5000/admin/pending'
        );
        setPendingManagers(response.data.pendingManagers);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch managers.');
      }
    };

    fetchPendingManagers();
  }, []);

  const handleUpdateStatus = async (managerId: string, isBlocked: boolean) => {
    try {
      await axios.post('http://localhost:5000/admin/update-status', {
        managerId,
        isBlocked,
      });
      alert('Manager status updated successfully');
      setPendingManagers((prev) => prev.filter((manager) => manager._id !== managerId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update manager status.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Approve Managers</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {pendingManagers.length > 0 ? (
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
            {pendingManagers.map((manager) => {
              console.log('manager',manager.certificate);  
              return (
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
                      className="px-4 py-2 bg-green-500 text-white rounded mr-2"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(manager._id, true)}
                      className="px-4 py-2 bg-red-500 text-white rounded"
                    >
                      Block
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No pending managers to approve.</p>
      )}
    </div>
  );
};

export default ApproveManagers;
