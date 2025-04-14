 
import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from './utils/jwt';
import Message from './models/User/message';

interface SocketData {
  id: string;
  role: 'user' | 'branch' | 'restaurent' | 'admin';
  email: string;
}

interface AuthenticatedSocket extends Socket {
  data: SocketData;
}

export const initializeSocket = (server: HttpServer): Server => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: No token provided'));
    try {
      const decoded = verifyToken(token);
      if (!decoded || typeof decoded !== 'object' || !('id' in decoded) || !('role' in decoded)) {
        return next(new Error('Invalid token'));
      }
      (socket as AuthenticatedSocket).data = decoded as SocketData;
      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`Connected: ${socket.id} (Role: ${socket.data.role}, ID: ${socket.data.id})`);

    socket.on('joinChat', async (data: { userId?: string; branchId?: string; restaurantId?: string }) => {
      try {
        const { userId, branchId, restaurantId } = data;
        console.log('Join chat request:', { userId, branchId, restaurantId, role: socket.data.role, id: socket.data.id });

        // Branch ↔ User Chat
        if (userId && branchId && !restaurantId) {
          const room = `chat_user_${userId}_${branchId}`;
          if (socket.data.role === 'user' && socket.data.id !== userId) {
            socket.emit('error', 'Unauthorized: Cannot join chat for another user');
            return;
          }
          if (socket.data.role === 'branch' && socket.data.id !== branchId) {
            socket.emit('error', 'Unauthorized: Cannot join chat for another branch');
            return;
          }
          socket.join(room);
          const previousMessages = await Message.find({ userId, branchId }).sort({ timestamp: 1 }).lean();
          console.log(`Joined room ${room} with ${previousMessages.length} previous messages`);
          socket.emit('previousMessages', previousMessages);
          socket.emit('joined', { room });
        }

        // Branch ↔ Restaurant Chat
        else if (restaurantId && branchId && !userId) {
          const room = `chat_restaurant_${restaurantId}_${branchId}`;
          if (socket.data.role === 'restaurent' && socket.data.id !== restaurantId) {
            socket.emit('error', 'Unauthorized: Cannot join chat for another restaurant');
            return;
          }
          if (socket.data.role === 'branch' && socket.data.id !== branchId) {
            socket.emit('error', 'Unauthorized: Cannot join chat for another branch');
            return;
          }
          socket.join(room);
          const previousMessages = await Message.find({ restaurantId, branchId }).sort({ timestamp: 1 }).lean();
          console.log(`Joined room ${room} with ${previousMessages.length} previous messages`);
          socket.emit('previousMessages', previousMessages);
          socket.emit('joined', { room });
        } else {
          socket.emit('error', 'Invalid chat parameters');
          console.log('Invalid joinChat parameters:', data);
        }
      } catch (error) {
        console.error('Error in joinChat:', error);
        socket.emit('error', 'Failed to join chat');
      }
    });

    socket.on('sendMessage', async (data: { userId?: string; branchId?: string; restaurantId?: string; message: string }) => {
      try {
        const { userId, branchId, restaurantId, message } = data;
        console.log('Send message request:', { userId, branchId, restaurantId, message, senderRole: socket.data.role, senderId: socket.data.id });

        if (!message) {
          socket.emit('error', 'Missing message');
          console.log('Missing message in sendMessage');
          return;
        }

        // Branch ↔ User Message
        if (userId && branchId && !restaurantId) {
          const room = `chat_user_${userId}_${branchId}`;
          const messageData = {
            userId,
            branchId,
            senderId: socket.data.id,
            senderRole: socket.data.role as 'user' | 'branch',
            message,
            timestamp: new Date(),
          };
          console.log('Saving Branch ↔ User message:', messageData);
          const newMessage = new Message(messageData);
          await newMessage.save();
          console.log(`Message saved for room ${room}`);
          io.to(room).emit('receiveMessage', messageData);
        }

        // Branch ↔ Restaurant Message
        else if (restaurantId && branchId && !userId) {
          const room = `chat_restaurant_${restaurantId}_${branchId}`;
          const messageData = {
            restaurantId,
            branchId,
            senderId: socket.data.id,
            senderRole: socket.data.role as 'restaurent' | 'branch',
            message,
            timestamp: new Date(),
          };
          console.log('Saving Branch ↔ Restaurant message:', messageData);
          const newMessage = new Message(messageData);
          await newMessage.save();
          console.log(`Message saved for room ${room}`);
          io.to(room).emit('receiveMessage', messageData);
        } else {
          socket.emit('error', 'Invalid message parameters');
          console.log('Invalid sendMessage parameters:', data);
        }
      } catch (error) {
        console.error('Error in sendMessage:', error);
        socket.emit('error', 'Failed to send message');
      }
    });

    socket.on('disconnect', () => {
      console.log(`Disconnected: ${socket.id} (Role: ${socket.data.role}, ID: ${socket.data.id})`);
    });
  });

  return io;
};