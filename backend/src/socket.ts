import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from './utils/jwt';
import Message from './models/User/message';
import adminModel from './models/Admin/adminModel';

import dotenv from "dotenv";
dotenv.config();
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
      origin:'https://classicdining.shop',
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

    // Join notification room based on role
    const { role, id } = socket.data;
    let notificationRoom: string | null = null;
    if (role === 'user') {
      notificationRoom = `user_${id}`;
    } else if (role === 'branch') {
      notificationRoom = `branch_${id}`;
    } else if (role === 'restaurent') {
      notificationRoom = `restaurant_${id}`;
    }
    if (notificationRoom) {
      socket.join(notificationRoom);
      console.log(`Socket ${socket.id} joined notification room: ${notificationRoom}`);
    }

    // Optional: Log incoming notifications for debugging
    socket.on('receiveNotification', (notification: any) => {
      console.log(`Notification received by ${socket.id} (Role: ${role}, ID: ${id}):`, notification);
    });

    socket.on('joinChat', async (data: { userId?: string; branchId?: string; restaurantId?: string; adminId?: string }) => {
      try {
        const { userId, branchId, restaurantId, adminId } = data;
        console.log('Join chat request:', { userId, branchId, restaurantId, adminId, role: socket.data.role, id: socket.data.id });

        // Branch ↔ User Chat
        if (userId && branchId && !restaurantId && !adminId) {
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
        else if (restaurantId && branchId && !userId && !adminId) {
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
        }

        // Admin ↔ Restaurant Chat
        else if (adminId && restaurantId && !userId && !branchId) {
          const superAdmin = await adminModel.findOne({ _id: adminId, email: 'admin123@gmail.com' }).lean();
          if (!superAdmin) {
            socket.emit('error', 'Unauthorized: Only super admin can chat with restaurants');
            return;
          }
          const room = `chat_admin_${adminId}_${restaurantId}`;
          if (socket.data.role === 'admin' && socket.data.id !== adminId) {
            socket.emit('error', 'Unauthorized: Cannot join chat for another admin');
            return;
          }
          if (socket.data.role === 'restaurent' && socket.data.id !== restaurantId) {
            socket.emit('error', 'Unauthorized: Cannot join chat for another restaurant');
            return;
          }
          socket.join(room);
          const previousMessages = await Message.find({ adminId, restaurantId }).sort({ timestamp: 1 }).lean();
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

    socket.on('sendMessage', async (data: { userId?: string; branchId?: string; restaurantId?: string; adminId?: string; message: string }) => {
      try {
        const { userId, branchId, restaurantId, adminId, message } = data;
        console.log('Send message request:', { userId, branchId, restaurantId, adminId, message, senderRole: socket.data.role, senderId: socket.data.id });

        if (!message) {
          socket.emit('error', 'Missing message');
          console.log('Missing message in sendMessage');
          return;
        }

        // Branch ↔ User Message
        if (userId && branchId && !restaurantId && !adminId) {
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
          const newMessage = await new Message(messageData).save();
          console.log(`Message saved for room ${room}`);
          io.to(room).emit('receiveMessage', newMessage);
        }

        // Branch ↔ Restaurant Message
        else if (restaurantId && branchId && !userId && !adminId) {
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
          const newMessage = await new Message(messageData).save();
          console.log(`Message saved for room ${room}`);
          io.to(room).emit('receiveMessage', newMessage);
        }

        // Admin ↔ Restaurant Message
        else if (adminId && restaurantId && !userId && !branchId) {
          const superAdmin = await adminModel.findOne({ _id: adminId, email: 'admin123@gmail.com' }).lean();
          if (!superAdmin) {
            socket.emit('error', 'Unauthorized: Only super admin can chat with restaurants');
            return;
          }
          const room = `chat_admin_${adminId}_${restaurantId}`;
          const messageData = {
            adminId,
            restaurantId,
            senderId: socket.data.id,
            senderRole: socket.data.role as 'admin' | 'restaurent',
            message,
            timestamp: new Date(),
          };
          console.log('Saving Admin ↔ Restaurant message:', messageData);
          const newMessage = await new Message(messageData).save();
          console.log(`Message saved for room ${room}`);
          io.to(room).emit('receiveMessage', newMessage);
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