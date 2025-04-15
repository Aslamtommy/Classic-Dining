// src/pages/Restaurant/RestaurantAdminChatPage.tsx
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import restaurentApi from '../../Axios/restaurentInstance';

interface Message {
  adminId: string;
  restaurantId: string;
  senderId: string;
  senderRole: 'admin' | 'restaurent';
  message: string;
  timestamp: string | Date;
}

interface Admin {
  id: string;
  email: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

const SOCKET_URL = 'http://localhost:5000/';

const RestaurantAdminChatPage: React.FC = () => {
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [superAdmin, setSuperAdmin] = useState<Admin | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const restaurantId = useSelector((state: RootState) => state.restaurent.restaurent?._id);
  const token = useSelector((state: RootState) => state.restaurent.restaurent?.accessToken);

  const fetchSuperAdmin = async () => {
    try {
      if (!restaurantId || !token) {
        setError('Missing restaurant ID or token');
        return;
      }
      const response: any = await restaurentApi.get('/chats/admins');
      console.log('Fetch Super Admin Response:', response.data);
      const fetchedAdmins = response.data.data?.admins || [];
      if (fetchedAdmins.length > 0) {
        setSuperAdmin(fetchedAdmins[0]); // Expecting only super admin
      } else {
        setSuperAdmin(null);
      }
      setError(null);
    } catch (error: any) {
      console.error('Error fetching super admin:', error.response?.data || error.message);
      setError('Failed to fetch super admin.');
      setSuperAdmin(null);
    }
  };

  useEffect(() => {
    if (!token || !restaurantId) {
      setError('Please log in as a restaurant manager.');
      return;
    }

    fetchSuperAdmin();

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
      if (superAdmin && message.adminId === superAdmin.id && message.restaurantId === restaurantId) {
        setMessages((prev) => [...prev, message]);
        // Update superAdmin with new message
        setSuperAdmin((prev:any) =>
          prev
            ? { ...prev, lastMessage: message.message, lastMessageTime: message.timestamp }
            : prev
        );
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, restaurantId, superAdmin]);

  useEffect(() => {
    if (!socket || !superAdmin || !isConnected) return;

    socket.emit('joinChat', { adminId: superAdmin.id, restaurantId });
    console.log('Joining chat with super admin:', { adminId: superAdmin.id, restaurantId });

    socket.on('previousMessages', (previousMessages: Message[]) => {
      console.log('Received previous messages:', previousMessages);
      setMessages(previousMessages || []);
    });

    return () => {
      socket.off('previousMessages');
    };
  }, [socket, superAdmin, isConnected, restaurantId]);

  const sendMessage = () => {
    if (!input.trim() || !socket || !isConnected || !superAdmin) return;
    const messageData = {
      adminId: superAdmin.id,
      restaurantId,
      message: input,
      senderId: restaurantId,
      senderRole: 'restaurent',
    };
    console.log('Sending message:', messageData);
    socket.emit('sendMessage', messageData);
    setInput('');
    // Optimistically update superAdmin
    setSuperAdmin((prev) =>
      prev
        ? { ...prev, lastMessage: input, lastMessageTime: new Date().toISOString() }
        : prev
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6 flex h-screen bg-[#faf7f2] font-sans">
      <div className="w-1/3 bg-white p-4 border-r border-[#e8e2d9] overflow-y-auto shadow-md rounded-lg">
        <h3 className="text-lg font-playfair font-semibold text-[#2c2420] mb-4">Support</h3>
        {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
        {superAdmin ? (
          <div className="p-3 mb-2 rounded-lg flex flex-col gap-1 bg-[#8b5d3b] text-white">
            <span className="font-medium">{superAdmin.email}</span>
            {superAdmin.lastMessage ? (
              <>
                <span className="text-xs truncate">{superAdmin.lastMessage}</span>
                <span className="text-xs opacity-70">
                  {superAdmin.lastMessageTime
                    ? new Date(superAdmin.lastMessageTime).toLocaleTimeString()
                    : ''}
                </span>
              </>
            ) : (
              <span className="text-xs italic opacity-70">No messages yet</span>
            )}
          </div>
        ) : (
          <p className="text-[#8b5d3b] italic">No support admin available.</p>
        )}
      </div>

      <div className="w-2/3 p-4 flex flex-col">
        <h2 className="text-2xl font-playfair font-semibold text-[#2c2420] mb-4 flex items-center gap-3">
          {superAdmin ? <span>Chat with Support</span> : 'No Support Admin Available'}
        </h2>
        {superAdmin ? (
          <>
            {!isConnected && <p className="text-red-500 text-sm mb-2">Connecting...</p>}
            <div className="flex-1 h-96 overflow-y-auto mb-4 border border-[#e8e2d9] p-3 bg-white rounded-lg shadow-inner">
              {messages.length === 0 ? (
                <p className="text-[#8b5d3b] italic text-center">No messages yet.</p>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-3 flex ${msg.senderRole === 'restaurent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`inline-block px-3 py-2 rounded-lg text-sm ${
                        msg.senderRole === 'restaurent' ? 'bg-[#8b5d3b] text-white' : 'bg-[#e8e2d9] text-[#2c2420]'
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
                disabled={!isConnected || !superAdmin}
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white rounded-lg text-sm hover:opacity-90 disabled:bg-[#e8e2d9] disabled:text-[#8b5d3b] transition-all duration-200"
                disabled={!isConnected || !superAdmin}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <p className="text-[#8b5d3b] italic">No support admin available to chat with.</p>
        )}
      </div>
    </div>
  );
};

export default RestaurantAdminChatPage;