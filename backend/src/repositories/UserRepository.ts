import { UserRepositoryInterface } from '../interfaces/user/UserRepositoryInterface';
import User, { IUser } from '../models/User/userModel';
import { googleUserData } from '../types/google';

export class UserRepository implements UserRepositoryInterface {
  // Create a new user (standard or Google)
  async create(user: Partial<IUser> | googleUserData): Promise<IUser> {
    try {
      // If the user is coming from Google Sign-In, add the google_id
      if ('uid' in user) {
        const googleUser: googleUserData = user;
        const newUser = new User({
          name: googleUser.name,
          email: googleUser.email,
          google_id: googleUser.uid,
          is_verified: googleUser.email_verified,
           isBlocked: false, // Default to false
        });

        const savedUser = await newUser.save();
        console.log('After Save (Google User):', savedUser);  
        return savedUser;
      } else {
 
        const newUser = new User({
          ...user,
        });
        console.log('Before Save (Standard User):', newUser);
        const savedUser = await newUser.save();
        console.log('After Save (Standard User):', savedUser);  
        return savedUser;
      }
    } catch (error) {
      console.error('Error saving user:', error);
      throw new Error('Unable to save user');
    }
  }

  // Find user by email, returning IUser
  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  // Find user by Google ID, returning IUser
  async findByGoogleId(googleId: string): Promise<IUser | null> {
    return await User.findOne({ google_id: googleId });
  }
  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.password = hashedPassword;
        await user.save();
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      throw new Error('Error updating password');
    }
  }

  async findAll(filter: any, skip: number, limit: number): Promise<any[]> {
   return await User.find(filter).skip(skip).limit(limit).exec()
  }
  async countAll(filter:any): Promise<number> {
    return await User.countDocuments(filter);
  }

  async findById(userId: string): Promise<IUser | null> {
    try {
      // Search for the user by ID
      const user = await User.findById(userId).exec();
      
 
      if (!user) {
        return null;
      }
      
 
      return user;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new Error('Error finding user');
    }
  }
  async updateProfilePicture(userId: string, profilePicture: string) {
    return await User.findByIdAndUpdate(userId, { profilePicture }, { new: true });
  }

  async save(user:IUser):Promise<IUser>{
    return await user.save()
  }

  public async update(id: string, updateData: any): Promise<any> {
    return User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true } // Return the updated document
    ).exec();
  }
}

 
 
