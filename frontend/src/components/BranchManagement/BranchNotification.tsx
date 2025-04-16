import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { tableTypeApi } from '../../Api/restaurentApi';
import  io   from 'socket.io-client';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  timestamp: string;
}

const BranchNotifications: React.FC = () => {
  const { restaurent, role } = useSelector((state: RootState) => state.restaurent);
  const accessToken = restaurent?.accessToken || '';
  const [page, setPage] = useState(1);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await tableTypeApi.getNotifications(page, limit);
      setNotifications(response.notifications);
      setTotal(response.total);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  useEffect(() => {
    if (!accessToken) return;

    const socket = io('http://localhost:5000', {
      auth: { token: accessToken },
    });

    socket.on('receiveNotification', (notification: any) => {
      console.log('New branch notification:', notification);
      toast.success('New notification received!');
      fetchNotifications();
    });

    socket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
      toast.error('Failed to connect to notification service');
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken]);

 
  if (role !== 'branch') {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 text-lg font-playfair">
        Unauthorized Access
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-playfair">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Branch Notifications</h1>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-indigo-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {notifications.length ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-6 border-b border-gray-200 last:border-b-0 ${
                    notification.read ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-800 text-base">{notification.message}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(new Date(notification.timestamp), 'PPP p')}
                      </p>
                    </div>
                 
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">No notifications available</div>
            )}
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:bg-gray-300 hover:bg-indigo-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Previous
            </button>
            <span className="text-gray-700">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:bg-gray-300 hover:bg-indigo-700 transition-colors"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchNotifications;