import React, { useState, useEffect, useCallback, KeyboardEvent } from 'react';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
import { RootState } from '../../redux/store';

// Message interface
interface Message {
  userId: string;
  branchId: string;
  senderId: string;
  senderRole: 'user' | 'branch';
  message: string;
  timestamp: string | Date;
}

// Props interface
interface ChatWidgetProps {
  userId: string;
  branchId: string;
  onClose: () => void;
}

const SOCKET_URL = 'http://localhost:5000/';

const ChatWidget: React.FC<ChatWidgetProps> = ({ userId, branchId, onClose }) => {
  const [socket, setSocket] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  const token = useSelector((state: RootState) => state.user.user?.accessToken);

  // Socket connection
  useEffect(() => {
    if (!token) return;

    const newSocket = io(SOCKET_URL, { auth: { token } });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('User socket connected:', newSocket.id);
      setIsConnected(true);
      newSocket.emit('joinChat', { userId, branchId });
    });

    newSocket.on('connect_error', (err:any) => {
      console.error('Connection error:', err.message);
      setIsConnected(false);
    });

    newSocket.on('previousMessages', (previousMessages: Message[]) => {
      console.log('User received previous messages:', previousMessages);
      setMessages(previousMessages || []);
    });

    newSocket.on('receiveMessage', (message: Message) => {
      console.log('User received message:', message);
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      newSocket.disconnect();
      console.log('User socket disconnected:', newSocket.id);
    };
  }, [token, userId, branchId]);

  // Send message
  const sendMessage = useCallback(() => {
    if (!input.trim() || !socket || !isConnected) return;

    const messageData = { userId, branchId, message: input };
    console.log('User sending message:', messageData);
    socket.emit('sendMessage', messageData);
    setInput(''); // Clear input, let server handle message addition
  }, [input, socket, isConnected, userId, branchId]);

  // Handle Enter key
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="fixed bottom-4 right-4 w-72 bg-white shadow-xl rounded-lg border border-[#e8e2d9] flex flex-col font-sans">
      {/* Header */}
      <div className="flex justify-between items-center p-2 bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white rounded-t-lg">
        <h3 className="text-sm font-playfair font-semibold tracking-wide">Chat with Us</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[#2c2420] rounded-full transition-colors duration-200"
          aria-label="Close chat"
        >
          <FaTimes size={12} />
        </button>
      </div>

      {/* Messages */}
      <div className="h-48 overflow-y-auto p-3 bg-[#faf7f2] text-sm">
        {messages.length === 0 ? (
          <p className="text-[#8b5d3b] text-center italic">Start the conversation...</p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.senderRole === 'user' ? 'justify-end' : 'justify-start'
              } mb-2`}
            >
              <span
                className={`inline-block px-3 py-1 rounded-md text-sm ${
                  msg.senderRole === 'user'
                    ? 'bg-[#8b5d3b] text-white'
                    : 'bg-[#e8e2d9] text-[#2c2420]'
                }`}
              >
                {msg.message}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-2 border-t border-[#e8e2d9] bg-white flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={!isConnected}
          className="flex-1 px-2 py-1 text-sm border border-[#e8e2d9] rounded-md focus:outline-none focus:ring-1 focus:ring-[#8b5d3b] bg-[#faf7f2] text-[#2c2420] placeholder-[#8b5d3b] disabled:bg-gray-100 transition-colors duration-200"
        />
        <button
          onClick={sendMessage}
          disabled={!isConnected}
          className="px-3 py-1 bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white text-sm rounded-md hover:opacity-90 disabled:bg-[#e8e2d9] disabled:text-[#8b5d3b] transition-all duration-200"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;