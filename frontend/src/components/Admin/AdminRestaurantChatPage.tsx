import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
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

  const adminId = useSelector((state: RootState) => state.admin ._id);
  const token = useSelector((state: RootState) => state.admin .accessToken);

  const fetchRestaurants = async () => {
    try {
      if (!adminId || !token) {
        setError('Missing admin ID or token');
        return;
      }
      const response: any = await adminApi.get('/chats/restaurants');
      const fetchedRestaurants = response.data.data?.restaurants || [];
      const sortedRestaurants = fetchedRestaurants.sort((a: Restaurant, b: Restaurant) => {
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
        return timeB - timeA;
      });
      setRestaurants(sortedRestaurants);
      if (sortedRestaurants.length > 0 && !selectedRestaurantId) {
        setSelectedRestaurantId(sortedRestaurants[0].id);
      }
      setError(null);
    } catch (error: any) {
      console.error('Error fetching restaurants:', error.response?.data || error.message);
      setError('Failed to fetch restaurants.');
      setRestaurants([]);
    }
  };

  useEffect(() => {
    if (!token || !adminId) {
      setError('Please log in as an admin.');
      return;
    }

    fetchRestaurants();

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
  }, [token, adminId]);

  useEffect(() => {
    if (!socket || !isConnected || restaurants.length === 0) return;

    // Join rooms for all restaurants to receive messages
    restaurants.forEach((restaurant) => {
      socket.emit('joinChat', { adminId, restaurantId: restaurant.id });
    });

    socket.on('previousMessages', (previousMessages: Message[]) => {
      if (previousMessages.length > 0 && previousMessages[0].restaurantId === selectedRestaurantId) {
        setMessages(previousMessages || []);
      }
    });

    socket.on('receiveMessage', (message: Message) => {
      if (message.adminId === adminId) {
        // Update messages for the selected restaurant
        if (message.restaurantId === selectedRestaurantId) {
          setMessages((prev) => [...prev, message]);
        }
        // Update restaurants list with new message and re-sort
        setRestaurants((prev:any) => {
          const updated = prev.map((restaurant:any) =>
            restaurant.id === message.restaurantId
              ? { ...restaurant, lastMessage: message.message, lastMessageTime: message.timestamp }
              : restaurant
          );
          return updated.sort((a:any, b:any) => {
            const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
            const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
            return timeB - timeA;
          });
        });
      }
    });

    return () => {
      socket.off('previousMessages');
      socket.off('receiveMessage');
    };
  }, [socket, selectedRestaurantId, isConnected, adminId, restaurants]);

  const sendMessage = () => {
    if (!input.trim() || !socket || !isConnected || !selectedRestaurantId) return;
    const messageData = {
      adminId,
      restaurantId: selectedRestaurantId,
      message: input,
      senderId: adminId,
      senderRole: 'admin',
    };
    socket.emit('sendMessage', messageData);
    setRestaurants((prev) => {
      const updated = prev.map((restaurant) =>
        restaurant.id === selectedRestaurantId
          ? { ...restaurant, lastMessage: input, lastMessageTime: new Date().toISOString() }
          : restaurant
      );
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
    if (socket && isConnected) {
      socket.emit('joinChat', { adminId, restaurantId });
    }
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