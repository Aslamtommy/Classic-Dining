// src/pages/Branch/BranchRestaurantChatPage.tsx
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import restaurentApi from '../../Axios/restaurentInstance';

interface Message {
  restaurantId: string;
  branchId: string;
  senderId: string;
  senderRole: 'restaurent' | 'branch';
  message: string;
  timestamp: string | Date;
}

interface Restaurant {
  id: string;
  name: string;
}

const SOCKET_URL = 'http://localhost:5000/';

const BranchRestaurantChatPage: React.FC = () => {
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const branchId = useSelector((state: RootState) => state.restaurent.restaurent?._id);
  const token = useSelector((state: RootState) => state.restaurent.restaurent?.accessToken);

  const fetchRestaurant = async () => {
    try {
      if (!branchId || !token) {
        setError('Missing branch ID or token');
        return;
      }
      const response :any= await restaurentApi.get('/chats/restaurant');
      const restaurant = response.data.data?.restaurant;
      if (restaurant) {
        setRestaurants([{ id: restaurant.id, name: restaurant.name }]);
        setSelectedRestaurantId(restaurant.id); // Auto-select since there's only one parent
      } else {
        setRestaurants([]);
      }
      setError(null);
    } catch (error: any) {
      console.error('Error fetching restaurant:', error.response?.data || error.message);
      setError('Failed to fetch restaurant.');
      setRestaurants([]);
    }
  };

  useEffect(() => {
    if (!token || !branchId) {
      setError('Please log in as a branch manager.');
      return;
    }

    fetchRestaurant();

    const newSocket = io(SOCKET_URL, { auth: { token } });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('connect_error', (err: any) => {
      setIsConnected(false);
      setError('Socket connection failed.');
    });

    newSocket.on('error', (error: string) => {
      setError(`Socket error: ${error}`);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, branchId]);

  useEffect(() => {
    if (!socket || !selectedRestaurantId || !isConnected) return;

    socket.emit('joinChat', { restaurantId: selectedRestaurantId, branchId });

    socket.on('previousMessages', (previousMessages: Message[]) => {
      setMessages(previousMessages || []);
    });

    socket.on('receiveMessage', (message: Message) => {
      if (message.branchId === branchId && message.restaurantId === selectedRestaurantId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off('previousMessages');
      socket.off('receiveMessage');
    };
  }, [socket, selectedRestaurantId, isConnected, branchId]);

  const sendMessage = () => {
    if (!input.trim() || !socket || !isConnected || !selectedRestaurantId) return;
    const messageData = { restaurantId: selectedRestaurantId, branchId, message: input };
    socket.emit('sendMessage', messageData);
    setInput('');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 flex h-screen bg-[#faf7f2] font-sans">
      <div className="w-1/3 bg-white p-4 border-r border-[#e8e2d9] overflow-y-auto shadow-md rounded-lg">
        <h3 className="text-lg font-playfair font-semibold text-[#2c2420] mb-4">Restaurant</h3>
        {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
        {restaurants.length === 0 ? (
          <p className="text-[#8b5d3b] italic">No restaurant assigned.</p>
        ) : (
          restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className={`p-3 mb-2 rounded-lg flex items-center gap-3 transition-colors duration-200 bg-[#8b5d3b] text-white`}
            >
              <div>
                <span className="font-medium block">{restaurant.name}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="w-2/3 p-4 flex flex-col">
        <h2 className="text-2xl font-playfair font-semibold text-[#2c2420] mb-4 flex items-center gap-3">
          {selectedRestaurantId ? (
            <span>Chat with {restaurants.find((r) => r.id === selectedRestaurantId)?.name || 'Restaurant'}</span>
          ) : (
            'No Restaurant Available'
          )}
        </h2>
        {selectedRestaurantId ? (
          <>
            {!isConnected && <p className="text-red-500 text-sm mb-2">Connecting...</p>}
            <div className="flex-1 h-96 overflow-y-auto mb-4 border border-[#e8e2d9] p-3 bg-white rounded-lg shadow-inner">
              {messages.length === 0 ? (
                <p className="text-[#8b5d3b] italic text-center">No messages yet.</p>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-3 flex ${msg.senderRole === 'branch' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`inline-block px-3 py-2 rounded-lg text-sm ${
                        msg.senderRole === 'branch' ? 'bg-[#8b5d3b] text-white' : 'bg-[#e8e2d9] text-[#2c2420]'
                      }`}
                    >
                      <span>{msg.message}</span>
                      <span className="block text-xs text-gray-300 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-[#e8e2d9] rounded-lg bg-[#faf7f2] text-[#2c2420] text-sm focus:outline-none focus:ring-1 focus:ring-[#8b5d3b] disabled:bg-gray-100 transition-colors duration-200"
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={!isConnected}
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white rounded-lg text-sm hover:opacity-90 disabled:bg-[#e8e2d9] disabled:text-[#8b5d3b] transition-all duration-200"
                disabled={!isConnected}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <p className="text-[#8b5d3b] italic">No restaurant to chat with.</p>
        )}
      </div>
    </div>
  );
};

export default BranchRestaurantChatPage;