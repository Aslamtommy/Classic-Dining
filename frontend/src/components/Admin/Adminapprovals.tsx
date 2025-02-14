import React, { useEffect, useState } from 'react';
import adminApi from '../../Axios/adminInstance';

interface Manager {
  _id: string;
  name: string;
  email: string;
  phone: string;
  certificate: string;
  isBlocked: boolean;
}

interface PendingManagersResponse {
  success: boolean;
  message: string;
  data: {
    managers: Manager[];
  };
}

const ApproveManagers: React.FC = () => {
  const [pendingManagers, setPendingManagers] = useState<Manager[]>([]);
  const [error, setError] = useState<string>('');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    fetchPendingManagers();
  }, []);

  const fetchPendingManagers = async () => {
    try {
      const response = await adminApi.get<PendingManagersResponse>('/pending');
      setPendingManagers(response.data.data.managers || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch pending managers.');
    }
  };

  const handleBlockClick = (managerId: string) => {
    setSelectedManager(managerId);
    setShowBlockModal(true);
  };

  const handleUpdateStatus = async (managerId: string, isBlocked: boolean) => {
    try {
      await adminApi.post('/update-status', {
        managerId,
        isBlocked,
        blockReason: isBlocked ? blockReason : undefined,
      });

      alert(`Manager ${isBlocked ? 'blocked' : 'approved'} successfully!`);
      setPendingManagers((prev) => prev.filter((manager) => manager._id !== managerId));
      setShowBlockModal(false);
      setBlockReason('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update manager status.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Approve Managers</h2>

      {/* Block Reason Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">Block Reason</h3>
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              placeholder="Enter reason for blocking..."
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockReason('');
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedManager!, true)} // Pass selectedManager and true
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}

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
                    onClick={() => handleUpdateStatus(manager._id, false)} // Pass manager._id and false
                    className="px-4 py-2 bg-green-500 text-white rounded mr-2 hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleBlockClick(manager._id)} // Open the modal
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