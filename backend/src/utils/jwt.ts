import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'my-secret';

const JWT_EXPIRES_IN = '15m';  
const JWT_REFRESH_EXPIRES_IN = '7d';  
 
export const generateAccessToken = (id: string,role:string): string => {
  console.log('Generating access token for user ID:', id, 'Role:', role)
  return jwt.sign({id,role }, JWT_SECRET 
 
 );
};

 
export const generateRefreshToken = (id: string,role:string): string => {

  console.log('Generating refresh token for user ID:', id, 'Role:', role);
  return jwt.sign({ id,role }, JWT_SECRET );
};

// Verify token
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error: any) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};
