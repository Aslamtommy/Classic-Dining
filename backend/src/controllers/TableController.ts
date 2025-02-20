 
import { Request, Response } from 'express';
import { TableTypeService } from '../services/TableServices';
import { sendResponse, sendError } from '../utils/responseUtils';
import { HttpStatus } from '../constants/HttpStatus';

export class TableTypeController {
  private tableTypeService: TableTypeService;

  constructor() {
    this.tableTypeService = new TableTypeService();
  }

  async createTableType(req: Request, res: Response) {
    try {
      const { branchId } = req.params;
      const tableTypeData = req.body;

      const tableType = await this.tableTypeService.createTableType(branchId, tableTypeData);
      sendResponse(res, HttpStatus.Created, 'Table type created successfully', tableType);
    } catch (error: any) {
      sendError(res, HttpStatus.BadRequest, error.message);
    }
  }

  async getTableTypesByBranch(req: Request, res: Response) {
    try {
      const { branchId } = req.params;
      const tableTypes = await this.tableTypeService.getTableTypesByBranch(branchId);
      sendResponse(res, HttpStatus.OK, 'Table types fetched successfully', tableTypes);
    } catch (error: any) {
      sendError(res, HttpStatus.InternalServerError, error.message);
    }
  }

  async updateTableTypeQuantity(req: Request, res: Response) {
    try {
      const { tableTypeId } = req.params;
      const { quantity } = req.body;

      console.log('quatity',quantity)
      console.log('tabletypeid',tableTypeId)
      const updatedTableType = await this.tableTypeService.updateTableTypeQuantity(tableTypeId, quantity);
      sendResponse(res, HttpStatus.OK, 'Table type quantity updated successfully', updatedTableType);
    } catch (error: any) {
      sendError(res, HttpStatus.BadRequest, error.message);
    }
  }

  async deleteTableType(req: Request, res: Response) {
    try {
      const { tableTypeId } = req.params;
      await this.tableTypeService.deleteTableType(tableTypeId);
      sendResponse(res, HttpStatus.OK, 'Table type deleted successfully');
    } catch (error: any) {
      sendError(res, HttpStatus.BadRequest, error.message);
    }
  }
}