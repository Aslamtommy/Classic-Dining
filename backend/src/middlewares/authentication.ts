import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { HttpStatus } from '../constants/HttpStatus';

export const authenticateToken = (requiredRole?: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
      console.log('Received token from cookies or header:', token);

      if (!token) {
        res.status(401).json({ message: 'Access token is missing or invalid' });
        return;
      }

      const decoded = verifyToken(token);
      if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
      }

      console.log('Decoded token:', decoded);

      // Attach user data to request
      req.data = {
        id: decoded.id,
        role: decoded.role,
        parentRestaurantId: decoded.parentRestaurantId,
        email: decoded.email, // Include email here
      } as {
        id: string;
        role: string;
        userId?: string;
        parentRestaurantId?: string;
        email: string;
      };

      console.log('User attached to request:', req.data);

      // Role validation
      if (requiredRole && decoded.role !== requiredRole) {
        console.log(`Forbidden: Role mismatch. Required: ${requiredRole}, Found: ${decoded.role}`);
        res.status(HttpStatus.Forbidden).json({ message: 'Forbidden: Insufficient permissions' });
        return;
      }

      next();
    } catch (error: any) {
      console.error('Token Authentication Error:', error.message);
      res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
  };
};
