import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'my-secret';

export const generateAccessToken = (payload: any): string => {
  console.log('Generating access token with payload:', payload);
  return jwt.sign(payload, JWT_SECRET);
};

export const generateRefreshToken = (payload: any): string => {
  console.log('Generating refresh token with payload:', payload);
  return jwt.sign(payload, JWT_SECRET);
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error: any) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};
