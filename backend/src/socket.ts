import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from './utils/jwt';
import Message from './models/User/message';

interface SocketData {
  id: string;
  role: 'user' | 'branch' | 'restaurent';
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
    console.log('Socket connection attempt with token:', token ? 'Provided' : 'Missing');
    if (!token) {
      console.error('Authentication error: No token provided for socket:', socket.id);
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = verifyToken(token);
      console.log('Token decoded:', decoded);
      if (!decoded || typeof decoded !== 'object' || !('id' in decoded) || !('role' in decoded)) {
        console.error('Invalid token structure:', decoded);
        return next(new Error('Invalid token'));
      }
      (socket as AuthenticatedSocket).data = decoded as SocketData;
      console.log('Socket authenticated:', socket.id, 'Role:', decoded.role, 'ID:', decoded.id);
      next();
    } catch (error) {
      console.error('Token verification failed:', (error as Error).message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`Connected: ${socket.id} (Role: ${socket.data.role}, ID: ${socket.data.id})`);

    socket.on('joinChat', async ({ userId, branchId }) => {
      try {
        console.log('joinChat event received:', { userId, branchId, socketId: socket.id });
        if (!userId || !branchId) {
          console.error('Missing parameters:', { userId, branchId });
          socket.emit('error', 'Missing userId or branchId');
          return;
        }

        if (socket.data.role === 'user' && socket.data.id !== userId) {
          console.error('Unauthorized user attempt:', { socketId: socket.id, userId, socketDataId: socket.data.id });
          socket.emit('error', 'Unauthorized: Cannot join chat for another user');
          return;
        }
        if (socket.data.role === 'branch' && socket.data.id !== branchId) {
          console.error('Unauthorized branch attempt:', { socketId: socket.id, branchId, socketDataId: socket.data.id });
          socket.emit('error', 'Unauthorized: Cannot join chat for another branch');
          return;
        }

        const room = `chat_${userId}_${branchId}`;
        socket.join(room);
        console.log(`${socket.data.role} ${socket.data.id} joined room: ${room}`);
        console.log('Current rooms for socket:', Array.from(socket.rooms));

        // Log all clients in the room
        const roomClients = io.sockets.adapter.rooms.get(room);
        console.log(`Clients in room ${room}:`, roomClients ? Array.from(roomClients) : 'No clients');

        const previousMessages = await Message.find({ userId, branchId })
          .sort({ timestamp: 1 })
          .lean();
        console.log('Previous messages fetched:', previousMessages);
        socket.emit('previousMessages', previousMessages);

        socket.emit('joined', { room });
        console.log(`Emitted 'joined' event to ${socket.id} for room: ${room}`);
      } catch (error) {
        console.error('Error in joinChat:', (error as Error).message);
        socket.emit('error', 'Failed to join chat');
      }
    });

    socket.on('sendMessage', async ({ userId, branchId, message }) => {
      try {
        console.log('sendMessage event received:', { userId, branchId, message, socketId: socket.id });
        if (!userId || !branchId || !message) {
          console.error('Missing parameters:', { userId, branchId, message });
          socket.emit('error', 'Missing userId, branchId, or message');
          return;
        }

        const room = `chat_${userId}_${branchId}`;
        const messageData = {
          userId,
          branchId,
          senderId: socket.data.id,
          senderRole: socket.data.role,
          message,
          timestamp: new Date(),
        };
        console.log('Message data to save:', messageData);

        const newMessage = new Message(messageData);
        console.log('Attempting to save message to database...');
        await newMessage.save()
          .then(() => console.log('Message successfully saved to database:', newMessage))
          .catch((dbError) => {
            console.error('Database save failed:', dbError);
            throw new Error('Failed to save message to database');
          });

        console.log(`Broadcasting 'receiveMessage' to room: ${room}`);
        io.to(room).emit('receiveMessage', messageData);
        console.log(`Message broadcasted to ${room}:`, messageData);

        // Log all clients in the room after broadcasting
        const roomClients = io.sockets.adapter.rooms.get(room);
        console.log(`Clients in room ${room} after broadcast:`, roomClients ? Array.from(roomClients) : 'No clients');
      } catch (error) {
        console.error('Error in sendMessage:', (error as Error).message);
        socket.emit('error', 'Failed to send message');
      }
    });

    socket.on('disconnect', () => {
      console.log(`Disconnected: ${socket.id} (Role: ${socket.data.role}, ID: ${socket.data.id})`);
    });
  });

  return io;
};