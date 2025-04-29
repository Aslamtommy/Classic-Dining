import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import restaurentApi from '../../Axios/restaurentInstance';
import { BaseUrl } from '../../../Config/BaseUrl';
interface Message {
  userId: string;
  branchId: string;
  senderId: string;
  senderRole: 'user' | 'branch';
  message: string;
  timestamp: string | Date;
}


interface User {
  id: string;
  name: string;
  mobile?: string;
  profilePicture?: string;
  lastMessage?: string;
  lastMessageTime?: string;
}



const SOCKET_URL = BaseUrl
const BranchUserChatPage: React.FC = () => {
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const branchId = useSelector((state: RootState) => state.restaurent.restaurent?._id);
  const token = useSelector((state: RootState) => state.restaurent.restaurent?.accessToken);

  const fetchUsersWithMessages = async () => {
    try {
      if (!branchId || !token) {
        setError('Missing branch ID or token');
        return;
      }
      const response: any = await restaurentApi.get(`/chats/users/${branchId}`);
      const fetchedUsers = response.data.data?.users || [];
      // Sort by lastMessageTime (descending), undefined at bottom
      const sortedUsers = fetchedUsers.sort((a: User, b: User) => {
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
        return timeB - timeA;
      });
      setUsers(sortedUsers);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching users:', error.response?.data || error.message);
      setError('Failed to fetch users.');
      setUsers([]);
    }
  };

  useEffect(() => {
    if (!token || !branchId) {
      setError('Please log in as a branch manager.');
      return;
    }

    fetchUsersWithMessages();

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
    if (!socket || !selectedUserId || !isConnected) return;

    socket.emit('joinChat', { userId: selectedUserId, branchId });

    socket.on('previousMessages', (previousMessages: Message[]) => {
      setMessages(previousMessages || []);
    });

    socket.on('receiveMessage', (message: Message) => {
      if (message.branchId === branchId && message.userId === selectedUserId) {
        setMessages((prev) => [...prev, message]);
      }
      // Update users list with new message and re-sort
      setUsers((prev:any) => {
        const updated = prev.map((user:any) =>
          user.id === message.userId
            ? { ...user, lastMessage: message.message, lastMessageTime: message.timestamp }
            : user
        );
        return updated.sort((a:any, b:any) => {
          const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
          const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
          return timeB - timeA;
        });
      });
    });

    return () => {
      socket.off('previousMessages');
      socket.off('receiveMessage');
    };
  }, [socket, selectedUserId, isConnected, branchId]);

  const sendMessage = () => {
    if (!input.trim() || !socket || !isConnected || !selectedUserId) return;
    const messageData = { userId: selectedUserId, branchId, message: input };
    socket.emit('sendMessage', messageData);
    // Optimistically update users list
    setUsers((prev) => {
      const updated = prev.map((user) =>
        user.id === selectedUserId
          ? { ...user, lastMessage: input, lastMessageTime: new Date().toISOString() }
          : user
      );
      return updated.sort((a, b) => {
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
        return timeB - timeA;
      });
    });
    setInput('');
  };

  const selectUser = (userId: string) => {
    setSelectedUserId(userId);
    setMessages([]);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 flex h-screen bg-[#faf7f2] font-sans">
      <div className="w-1/3 bg-white p-4 border-r border-[#e8e2d9] overflow-y-auto shadow-md rounded-lg">
        <h3 className="text-lg font-playfair font-semibold text-[#2c2420] mb-4">Users</h3>
        {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
        {users.length === 0 ? (
          <p className="text-[#8b5d3b] italic">No users have messaged yet.</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              onClick={() => selectUser(user.id)}
              className={`p-3 mb-2 cursor-pointer rounded-lg flex items-start gap-3 transition-colors duration-200 ${
                selectedUserId === user.id ? 'bg-[#8b5d3b] text-white' : 'bg-white hover:bg-[#e8e2d9]'
              }`}
            >
              <img
                src={user.profilePicture || '/default-profile.png'}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border border-[#e8e2d9]"
              />
              <div className="flex-1">
                <span className="font-medium block">{user.name}</span>
                <span className="text-sm text-gray-500">{user.mobile || 'N/A'}</span>
                {user.lastMessage ? (
                  <>
                    <span className="text-xs truncate block max-w-[150px]">{user.lastMessage}</span>
                    <span className="text-xs opacity-70">
                      {user.lastMessageTime
                        ? new Date(user.lastMessageTime).toLocaleTimeString()
                        : ''}
                    </span>
                  </>
                ) : (
                  <span className="text-xs italic opacity-70">No messages yet</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="w-2/3 p-4 flex flex-col">
        <h2 className="text-2xl font-playfair font-semibold text-[#2c2420] mb-4 flex items-center gap-3">
          {selectedUserId ? (
            <>
              <img
                src={users.find((u) => u.id === selectedUserId)?.profilePicture || '/default-profile.png'}
                alt="User profile"
                className="w-8 h-8 rounded-full object-cover border border-[#e8e2d9]"
              />
              <span>
                Chat with {users.find((u) => u.id === selectedUserId)?.name || 'User'}
                <span className="text-sm text-[#8b5d3b] block">{users.find((u) => u.id === selectedUserId)?.mobile || 'N/A'}</span>
              </span>
            </>
          ) : (
            'Select a User'
          )}
        </h2>
        {selectedUserId ? (
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
                    {msg.senderRole !== 'branch' && (
                      <img
                        src={users.find((u) => u.id === msg.userId)?.profilePicture || '/default-profile.png'}
                        alt="User profile"
                        className="w-6 h-6 rounded-full object-cover mr-2 self-end border border-[#e8e2d9]"
                      />
                    )}
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
          <p className="text-[#8b5d3b] italic">Select a user from the list to start chatting.</p>
        )}
      </div>
    </div>
  );
};

export default BranchUserChatPage;