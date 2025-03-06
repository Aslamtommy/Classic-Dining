 
import { Model, Document, FilterQuery } from 'mongoose';
import { AppError } from '../../utils/AppError';
import { HttpStatus } from '../../constants/HttpStatus';
import { MessageConstants } from '../../constants/MessageConstants';

export class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      return await this.model.create(data);
    } catch (error) {
      console.error('Error in create:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async findById(id: string): Promise<T | null> {
    try {
      return await this.model.findById(id).exec();
    } catch (error) {
      console.error('Error in findById:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async findByEmail(email: string): Promise<T | null> {
    try {
      return await this.model.findOne({ email }).exec();
    } catch (error) {
      console.error('Error in findByEmail:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }
  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    try {
      return await this.model.findOne(filter).exec();
    } catch (error) {
      console.error('Error in findOne:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(filter: FilterQuery<T> = {}, skip: number = 0, limit: number = 0): Promise<T[]> {
    try {
      return await this.model.find(filter).skip(skip).limit(limit).exec();
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    } catch (error) {
      console.error('Error in update:', error);
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.model.findByIdAndDelete(id).exec();
      if (!result) throw new AppError(HttpStatus.NotFound, `${this.model.modelName} not found`);
    } catch (error) {
      console.error('Error in delete:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

 
}