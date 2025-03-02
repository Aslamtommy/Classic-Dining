import { UserRepositoryInterface } from '../interfaces/user/UserRepositoryInterface';
import User, { IUser } from '../models/User/userModel';
import { googleUserData } from '../types/google';
import { AppError } from '../utils/AppError';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';

export class UserRepository implements UserRepositoryInterface {
  async create(user: Partial<IUser> | googleUserData): Promise<IUser> {
    try {
      let newUser;
      if ('uid' in user) {
        const googleUser: googleUserData = user;
        newUser = new User({
          name: googleUser.name,
          email: googleUser.email,
          google_id: googleUser.uid,
          is_verified: googleUser.email_verified,
          isBlocked: false,
        });
      } else {
        newUser = new User({ ...user });
      }
      return await newUser.save();
    } catch (error) {
      console.error('Error in create user:', error);
      const errorMessage = error instanceof Error 
        ? `${MessageConstants.INTERNAL_SERVER_ERROR}: ${error.message}`
        : MessageConstants.INTERNAL_SERVER_ERROR;
      throw new AppError(HttpStatus.InternalServerError, errorMessage);
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email }).exec();
    } catch (error) {
      console.error('Error in findByEmail:', error);
      const errorMessage = error instanceof Error 
        ? `${MessageConstants.INTERNAL_SERVER_ERROR}: ${error.message}`
        : MessageConstants.INTERNAL_SERVER_ERROR;
      throw new AppError(HttpStatus.InternalServerError, errorMessage);
    }
  }

  async findByGoogleId(googleId: string): Promise<IUser | null> {
    try {
      return await User.findOne({ google_id: googleId }).exec();
    } catch (error) {
      console.error('Error in findByGoogleId:', error);
      const errorMessage = error instanceof Error 
        ? `${MessageConstants.INTERNAL_SERVER_ERROR}: ${error.message}`
        : MessageConstants.INTERNAL_SERVER_ERROR;
      throw new AppError(HttpStatus.InternalServerError, errorMessage);
    }
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    try {
      const user = await User.findById(userId).exec();
      if (!user) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
      }
      user.password = hashedPassword;
      await user.save();
    } catch (error) {
      console.error('Error in updatePassword:', error);
      if (error instanceof AppError) throw error;
      const errorMessage = error instanceof Error 
        ? `${MessageConstants.INTERNAL_SERVER_ERROR}: ${error.message}`
        : MessageConstants.INTERNAL_SERVER_ERROR;
      throw new AppError(HttpStatus.InternalServerError, errorMessage);
    }
  }

  async findAll(filter: any, skip: number, limit: number): Promise<any[]> {
    try {
      return await User.find(filter)
        .skip(skip)
        .limit(limit)
        .exec();
    } catch (error) {
      console.error('Error in findAll:', error);
      const errorMessage = error instanceof Error 
        ? `${MessageConstants.INTERNAL_SERVER_ERROR}: ${error.message}`
        : MessageConstants.INTERNAL_SERVER_ERROR;
      throw new AppError(HttpStatus.InternalServerError, errorMessage);
    }
  }

  async countAll(filter: any): Promise<number> {
    try {
      return await User.countDocuments(filter).exec();
    } catch (error) {
      console.error('Error in countAll:', error);
      const errorMessage = error instanceof Error 
        ? `${MessageConstants.INTERNAL_SERVER_ERROR}: ${error.message}`
        : MessageConstants.INTERNAL_SERVER_ERROR;
      throw new AppError(HttpStatus.InternalServerError, errorMessage);
    }
  }

  async findById(userId: string): Promise<IUser | null> {
    try {
      return await User.findById(userId).exec();
    } catch (error) {
      console.error('Error in findById:', error);
      const errorMessage = error instanceof Error 
        ? `${MessageConstants.INTERNAL_SERVER_ERROR}: ${error.message}`
        : MessageConstants.INTERNAL_SERVER_ERROR;
      throw new AppError(HttpStatus.InternalServerError, errorMessage);
    }
  }

  async updateProfilePicture(userId: string, profilePicture: string): Promise<IUser | null> {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePicture },
        { new: true }
      ).exec();
      if (!updatedUser) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
      }
      return updatedUser;
    } catch (error) {
      console.error('Error in updateProfilePicture:', error);
      if (error instanceof AppError) throw error;
      const errorMessage = error instanceof Error 
        ? `${MessageConstants.INTERNAL_SERVER_ERROR}: ${error.message}`
        : MessageConstants.INTERNAL_SERVER_ERROR;
      throw new AppError(HttpStatus.InternalServerError, errorMessage);
    }
  }

  async save(user: IUser): Promise<IUser> {
    try {
      return await user.save();
    } catch (error) {
      console.error('Error in save:', error);
      const errorMessage = error instanceof Error 
        ? `${MessageConstants.INTERNAL_SERVER_ERROR}: ${error.message}`
        : MessageConstants.INTERNAL_SERVER_ERROR;
      throw new AppError(HttpStatus.InternalServerError, errorMessage);
    }
  }

  async update(id: string, updateData: any): Promise<IUser | null> {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).exec();
      if (!updatedUser) {
        throw new AppError(HttpStatus.NotFound, MessageConstants.USER_NOT_FOUND);
      }
      return updatedUser;
    } catch (error) {
      console.error('Error in update:', error);
      if (error instanceof AppError) throw error;
      const errorMessage = error instanceof Error 
        ? `${MessageConstants.INTERNAL_SERVER_ERROR}: ${error.message}`
        : MessageConstants.INTERNAL_SERVER_ERROR;
      throw new AppError(HttpStatus.InternalServerError, errorMessage);
    }
  }
}