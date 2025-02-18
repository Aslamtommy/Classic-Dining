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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Approve Restaurants</h2>

        {/* Block Reason Modal */}
        {showBlockModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
              <h3 className="text-lg font-bold mb-4">Block Reason</h3>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter reason for blocking..."
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowBlockModal(false);
                    setBlockReason('');
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedRestaurent!, true)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Confirm Block
                </button>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {pendingRestaurents.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Certificate</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingRestaurents.map((restaurent) => (
                  <tr key={restaurent._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-700">{restaurent.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{restaurent.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{restaurent.phone}</td>
                    <td className="px-6 py-4 text-sm text-blue-600 hover:text-blue-800">
                      <a
                        href={restaurent.certificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        View Certificate
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(restaurent._id, false)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleBlockClick(restaurent._id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Block
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No pending restaurants to approve.</p>
        )}
      </div>
    </div>
  );
};

export default ApproveRestaurents;