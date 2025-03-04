import { Request, Response } from 'express';
import { ITableTypeService } from '../interfaces/table/ITableTypeService';
import { sendResponse, sendError } from '../utils/responseUtils';
import { HttpStatus } from '../constants/HttpStatus';
import { AppError } from '../utils/AppError';
import { MessageConstants } from '../constants/MessageConstants';

export class TableTypeController {
  constructor(private _tableTypeService: ITableTypeService) {}

  async createTableType(req: Request, res: Response): Promise<void> {
    try {
      const { branchId } = req.params;
      const tableTypeData = req.body;
      if (!branchId) throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);

      const tableType = await this._tableTypeService.createTableType(branchId, tableTypeData);
      sendResponse(res, HttpStatus.Created, MessageConstants.TABLE_TYPE_CREATED, tableType);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.BadRequest, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getTableTypesByBranch(req: Request, res: Response): Promise<void> {
    try {
      const { branchId } = req.params;
      if (!branchId) throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      const tableTypes = await this._tableTypeService.getTableTypesByBranch(branchId);
      sendResponse(res, HttpStatus.OK, MessageConstants.TABLE_TYPES_FETCHED, tableTypes);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async updateTableTypeQuantity(req: Request, res: Response): Promise<void> {
    try {
      const { tableTypeId } = req.params;
      const { quantity } = req.body;
      if (!tableTypeId || quantity === undefined) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      }

      console.log('quantity', quantity);
      console.log('tableTypeId', tableTypeId);
      const updatedTableType = await this._tableTypeService.updateTableTypeQuantity(tableTypeId, quantity);
      sendResponse(res, HttpStatus.OK, MessageConstants.TABLE_TYPE_UPDATED, updatedTableType);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.BadRequest, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async deleteTableType(req: Request, res: Response): Promise<void> {
    try {
      const { tableTypeId } = req.params;
      if (!tableTypeId) throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);
      await this._tableTypeService.deleteTableType(tableTypeId);
      sendResponse(res, HttpStatus.OK, MessageConstants.TABLE_TYPE_DELETED);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(res, HttpStatus.BadRequest, MessageConstants.INTERNAL_SERVER_ERROR);
      }
    }
  }
}