import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { HttpStatus } from '../constants/HttpStatus';
export const authenticateToken = (requiredRole?: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
   console.log('body',req.cookies)
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

      // Populate req.data with decoded token info
         // Attach user data to request
         req.data = {
          id: decoded.id,
          role: decoded.role,
          parentRestaurantId: decoded.parentRestaurantId
        } as {
          id: string;
          role: string;
          userId?: string;
          parentRestaurantId?: string;
        };
        
      // If it's a user, add userId to req.data
       

      // Check if the required role matches the token's role
      if (requiredRole && decoded.role !== requiredRole) {
        console.log('Forbidden access: insufficient permissions for role', decoded.role);
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
