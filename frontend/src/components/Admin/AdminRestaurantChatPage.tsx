import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../Axios/adminInstance';

interface Message {
  adminId: string;
  restaurantId: string;
  senderId: string;
  senderRole: 'admin' | 'restaurent';
  message: string;
  timestamp: string | Date;
}

interface Restaurant {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

const SOCKET_URL = 'http://localhost:5000/';

const AdminRestaurantChatPage: React.FC = () => {
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adminState = useSelector((state: RootState) => state.admin);
  const adminId = adminState._id;
  const token = adminState.accessToken;
  const navigate = useNavigate();

  const fetchRestaurants = async () => {
    try {
      if (!adminId || !token) {
        console.log('Missing adminId or token:', { adminId, token });
        setError('Missing admin ID or token');
        navigate('/admin/login');
        return;
      }
      const response: any = await adminApi.get('/chats/restaurants');
      console.log('Fetch Restaurants Response:', response.data);
      const fetchedRestaurants = response.data.data?.restaurants || [];
      // Sort by lastMessageTime (descending), undefined at bottom
      const sortedRestaurants = fetchedRestaurants.sort((a: Restaurant, b: Restaurant) => {
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
        return timeB - timeA;
      });
      setRestaurants(sortedRestaurants);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching restaurants:', error.response?.data || error.message);
      setError('Failed to fetch restaurants.');
      setRestaurants([]);
    }
  };

  useEffect(() => {
    if (!token || !adminId) {
      console.log('No token or adminId, redirecting to login');
      setError('Please log in as an admin.');
      navigate('/admin/login');
      return;
    }

    fetchRestaurants();

    const newSocket = io(SOCKET_URL, { auth: { token } });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('connect_error', (err: any) => {
      console.error('Socket connection error:', err);
      setIsConnected(false);
      setError('Socket connection failed.');
    });

    newSocket.on('error', (error: string) => {
      console.error('Socket error:', error);
      setError(`Socket error: ${error}`);
    });

    newSocket.on('receiveMessage', (message: Message) => {
      console.log('Received message:', message);
      // Update messages for selected restaurant
      if (message.adminId === adminId && message.restaurantId === selectedRestaurantId) {
        setMessages((prev) => [...prev, message]);
      }
      // Update restaurant list for all messages
      setRestaurants((prev:any) => {
        const updated = prev.map((r:any) =>
          r.id === message.restaurantId
            ? { ...r, lastMessage: message.message, lastMessageTime: message.timestamp }
            : r
        );
        // Re-sort by lastMessageTime
        return updated.sort((a:any, b:any) => {
          const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
          const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
          return timeB - timeA;
        });
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, adminId, navigate, selectedRestaurantId]);

  useEffect(() => {
    if (!socket || !selectedRestaurantId || !isConnected) return;

    socket.emit('joinChat', { adminId, restaurantId: selectedRestaurantId });
    console.log('Joining chat room:', { adminId, restaurantId: selectedRestaurantId });

    socket.on('previousMessages', (previousMessages: Message[]) => {
      console.log('Received previous messages:', previousMessages);
      setMessages(previousMessages || []);
    });

    return () => {
      socket.off('previousMessages');
    };
  }, [socket, selectedRestaurantId, isConnected, adminId]);

  const sendMessage = () => {
    if (!input.trim() || !socket || !isConnected || !selectedRestaurantId) return;
    const messageData = {
      adminId,
      restaurantId: selectedRestaurantId,
      message: input,
      senderId: adminId,
      senderRole: 'admin',
    };
    console.log('Sending message:', messageData);
    socket.emit('sendMessage', messageData);
    // Optimistically update restaurants list
    setRestaurants((prev) => {
      const updated = prev.map((r) =>
        r.id === selectedRestaurantId
          ? { ...r, lastMessage: input, lastMessageTime: new Date().toISOString() }
          : r
      );
      // Re-sort by lastMessageTime
      return updated.sort((a, b) => {
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
        return timeB - timeA;
      });
    });
    setInput('');
  };

  const selectRestaurant = (restaurantId: string) => {
    setSelectedRestaurantId(restaurantId);
    setMessages([]);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 flex h-screen bg-[#faf7f2] font-sans">
      <div className="w-1/3 bg-white p-4 border-r border-[#e8e2d9] overflow-y-auto shadow-md rounded-lg">
        <h3 className="text-lg font-playfair font-semibold text-[#2c2420] mb-4">Restaurants</h3>
        {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
        {restaurants.length === 0 ? (
          <p className="text-[#8b5d3b] italic">No restaurants available.</p>
        ) : (
          restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              onClick={() => selectRestaurant(restaurant.id)}
              className={`p-3 mb-2 cursor-pointer rounded-lg flex flex-col gap-1 transition-colors duration-200 ${
                selectedRestaurantId === restaurant.id ? 'bg-[#8b5d3b] text-white' : 'bg-white hover:bg-[#e8e2d9]'
              }`}
            >
              <span className="font-medium">{restaurant.name}</span>
              {restaurant.lastMessage ? (
                <>
                  <span className="text-xs truncate max-w-[200px]">{restaurant.lastMessage}</span>
                  <span className="text-xs opacity-70">
                    {restaurant.lastMessageTime
                      ? new Date(restaurant.lastMessageTime).toLocaleTimeString()
                      : ''}
                  </span>
                </>
              ) : (
                <span className="text-xs italic opacity-70">No messages yet</span>
              )}
            </div>
          ))
        )}
      </div>

      <div className="w-2/3 p-4 flex flex-col">
        <h2 className="text-2xl font-playfair font-semibold text-[#2c2420] mb-4 flex items-center gap-3">
          {selectedRestaurantId ? (
            <span>Chat with {restaurants.find((r) => r.id === selectedRestaurantId)?.name || 'Restaurant'}</span>
          ) : (
            'Select a Restaurant'
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
                    className={`mb-3 flex ${msg.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`inline-block px-3 py-2 rounded-lg text-sm ${
                        msg.senderRole === 'admin' ? 'bg-[#8b5d3b] text-white' : 'bg-[#e8e2d9] text-[#2c2420]'
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
          <p className="text-[#8b5d3b] italic">Select a restaurant from the list to start chatting.</p>
        )}
      </div>
    </div>
  );
};

export default AdminRestaurantChatPage;