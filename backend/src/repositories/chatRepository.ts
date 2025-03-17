import Message from '../models/User/message';
import User from '../models/User/userModel';
import { AppError } from '../utils/AppError';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';

export class ChatRepository {
  async getUsersWhoMessaged(branchId: string): Promise<string[]> {
    try {
      const userIds = await Message.distinct('userId', { branchId }).exec();
      return userIds;
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
      );
    }
  }

  async getUserDetails(userIds: string[]): Promise<{ id: string; name: string; phone?: string; profilePicture?: string }[]> {
    try {
      const users = await User.find({ _id: { $in: userIds } }, 'name mobile profilePicture').lean();
      return users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
       mobile: user.mobile || undefined, // Optional, fallback to undefined if not present
        profilePicture: user.profilePicture || undefined, // Optional, fallback to undefined if not present
      }));
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        `${MessageConstants.INTERNAL_SERVER_ERROR}: ${(error as Error).message}`
      );
    }
  }
}