import React, { useEffect, useState } from 'react';
import adminApi from '../../Axios/adminInstance';

interface Restaurent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  certificate: string;
  isBlocked: boolean;
}

interface PendingRestaurentsResponse {
  success: boolean;
  message: string;
  data: {
    restaurents: Restaurent[];
  };
}

const ApproveRestaurents: React.FC = () => {
  const [pendingRestaurents, setPendingRestaurents] = useState<Restaurent[]>([]);
  const [error, setError] = useState<string>('');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedRestaurent, setSelectedRestaurent] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    fetchPendingRestaurents();
  }, []);

  const fetchPendingRestaurents = async () => {
    try {
      const response = await adminApi.get<PendingRestaurentsResponse>('/pending');
      setPendingRestaurents(response.data.data.restaurents || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch pending restaurents.');
    }
  };

  const handleBlockClick = (restaurentId: string) => {
    setSelectedRestaurent(restaurentId);
    setShowBlockModal(true);
  };

  const handleUpdateStatus = async (restaurentId: string, isBlocked: boolean) => {
    try {
      await adminApi.post('/update-status', {
        restaurentId,
        isBlocked,
        blockReason: isBlocked ? blockReason : undefined,
      });

      alert(`Restaurent ${isBlocked ? 'blocked' : 'approved'} successfully!`);
      setPendingRestaurents((prev) => prev.filter((restaurent) => restaurent._id !== restaurentId));
      setShowBlockModal(false);
      setBlockReason('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update restaurent status.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Approve Restaurents</h2>

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
                onClick={() => handleUpdateStatus(selectedRestaurent!, true)} // Pass selectedRestaurentand true
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {pendingRestaurents.length > 0 ? (
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
            {pendingRestaurents.map((restaurent) => (
              <tr key={restaurent._id}>
                <td className="border border-gray-400 px-4 py-2">{restaurent.name}</td>
                <td className="border border-gray-400 px-4 py-2">{restaurent.email}</td>
                <td className="border border-gray-400 px-4 py-2">{restaurent.phone}</td>
                <td className="border border-gray-400 px-4 py-2">
                  <a
                    href={restaurent.certificate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View Certificate
                  </a>
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  <button
                    onClick={() => handleUpdateStatus(restaurent._id, false)} // Pass restaurent._id and false
                    className="px-4 py-2 bg-green-500 text-white rounded mr-2 hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleBlockClick(restaurent._id)} // Open the modal
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
        <p>No pending restaurents to approve.</p>
      )}
    </div>
  );
};

export default ApproveRestaurents;