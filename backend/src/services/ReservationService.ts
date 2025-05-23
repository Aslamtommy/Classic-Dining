import { IReservationRepository } from '../interfaces/Reservation/IReservationRepository';
import { IBranchRepository } from '../interfaces/branch/IBranchRepository';
import { TableTypeRepository } from '../repositories/TableRepository';
import { ReservationStatus } from '../models/User/Reservation';
import { IWalletRepository } from '../interfaces/wallet/IWalletRepository';
import { IReservation } from '../models/User/Reservation';
import { ICouponRepository } from '../interfaces/coupon/ICouponRepository';
import { ITableType } from '../models/Restaurent/TableModel';
import mongoose, { Types } from 'mongoose';
import { IReservationService } from '../interfaces/Reservation/IReservationService';
import { AppError } from '../utils/AppError';
import { HttpStatus } from '../constants/HttpStatus';
import { MessageConstants } from '../constants/MessageConstants';
import { IReview } from '../models/User/Reservation';
import { sentMail } from '../utils/SendMails';
import { generateConfirmationEmail } from '../utils/confirmationEmailTemplate';
import { generateWhatsAppMessage } from '../utils/whatsapNotification';
import twilio from 'twilio';
export class ReservationService implements IReservationService {
  private twilioClient: twilio.Twilio;
  constructor(
    private _reservationRepo: IReservationRepository,
    private _branchRepo: IBranchRepository,
    private _tableTypeRepo: TableTypeRepository,
    private _walletRepo: IWalletRepository,
    private _couponRepo: ICouponRepository
  ) {
    // Log Twilio credentials to ensure they're loaded
    console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID);
    console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '[REDACTED]' : 'NOT SET');
    console.log('TWILIO_WHATSAPP_NUMBER:', process.env.TWILIO_WHATSAPP_NUMBER);

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.error('Twilio credentials are missing. WhatsApp messages will not be sent.');
    }

    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

    
  async createReservation(reservationData: Partial<IReservation>): Promise<IReservation> {
    try {
      const branchId = reservationData.branch?._id?.toString();
      const tableTypeId = reservationData.tableType?._id?.toString();
      if (!branchId || !tableTypeId) throw new AppError(HttpStatus.BadRequest, MessageConstants.REQUIRED_FIELDS_MISSING);

      const [branch, tableType] = await Promise.all([
        this._branchRepo.findById(branchId),
        this._tableTypeRepo.findById(tableTypeId),
      ]);

      if (!branch || !tableType) throw new AppError(HttpStatus.BadRequest, MessageConstants.INVALID_BRANCH_OR_TABLE);

      const partySize = reservationData.partySize || 0;
      const tableQuantity = Math.ceil(partySize / tableType.capacity); // Handle large groups

      const reservedQuantity = await this._reservationRepo.getReservedQuantity(
        branchId,
        tableTypeId,
        reservationData.reservationDate as Date,
        reservationData.timeSlot as string
      );

      if (reservedQuantity + tableQuantity > tableType.quantity) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.NO_AVAILABLE_TABLES);
      }

      let discountApplied = 0;
      let finalAmount = (tableType.price || 0) * tableQuantity;

      if (reservationData.couponCode) {
        const coupon = await this._couponRepo.findByCode(reservationData.couponCode);
        if (!coupon || !coupon.isActive || coupon.expiryDate < new Date()) {
          throw new AppError(HttpStatus.BadRequest, MessageConstants.INVALID_COUPON);
        }
        if (coupon.minOrderAmount && finalAmount < coupon.minOrderAmount) {
          throw new AppError(HttpStatus.BadRequest, `${MessageConstants.MIN_ORDER_AMOUNT_REQUIRED} ${coupon.minOrderAmount}`);
        }
        discountApplied = coupon.discountType === 'percentage'
          ? Math.min((coupon.discount / 100) * finalAmount, coupon.maxDiscountAmount || Infinity)
          : coupon.discount;
        finalAmount -= discountApplied;
        if (finalAmount < 0) finalAmount = 0;
      }

      const reservation = await this._reservationRepo.create({
        ...reservationData,
        tableQuantity,
        preferences: reservationData.preferences || [],
        couponCode: reservationData.couponCode,
        discountApplied,
        finalAmount,
        branch: new Types.ObjectId(branchId),
        tableType: new Types.ObjectId(tableTypeId),
      });

      return reservation;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getReservation(id: string): Promise<IReservation> {
    try {
      const reservation = await this._reservationRepo.findById(id);
      if (!reservation) throw new AppError(HttpStatus.NotFound, MessageConstants.RESERVATION_NOT_FOUND);
      return reservation;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async cancelReservation(id: string): Promise<IReservation> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const reservation = await this._reservationRepo.findById(id);
      if (!reservation) throw new AppError(HttpStatus.NotFound, MessageConstants.RESERVATION_NOT_FOUND);
      if (reservation.status === ReservationStatus.CANCELLED) throw new AppError(HttpStatus.BadRequest, MessageConstants.RESERVATION_ALREADY_CANCELLED);

      if (reservation.status === ReservationStatus.CONFIRMED) {
        const tableType = typeof reservation.tableType === 'object' && 'price' in reservation.tableType
          ? reservation.tableType as ITableType
          : await this._tableTypeRepo.findById(reservation.tableType.toString());

        if (!tableType || !('price' in tableType)) throw new AppError(HttpStatus.InternalServerError, MessageConstants.INVALID_BRANCH_OR_TABLE);

        const amount = reservation.finalAmount !== undefined ? reservation.finalAmount : (tableType.price || 0) * reservation.tableQuantity;
        if (amount > 0) {
          await this._walletRepo.updateWalletBalance(reservation.userId.toString(), amount);
          await this._walletRepo.createTransaction({
            userId: reservation.userId.toString(),
            type: 'credit',
            amount,
            description: `Refund for cancelled reservation ${id}`,
            date: new Date(),
          });
        }
      }

      const updatedReservation = await this._reservationRepo.update(id, { status: ReservationStatus.CANCELLED });
      if (!updatedReservation) throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      await session.commitTransaction();
      return updatedReservation;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    } finally {
      session.endSession();
    }
  }

  async confirmReservation(id: string, paymentId: string, whatsappOptIn?: true): Promise<IReservation> {
    try {
      console.log(`Confirming reservation ID: ${id} with paymentId: ${paymentId}, whatsappOptIn: ${whatsappOptIn}`);

      const reservation = await this._reservationRepo.findById(id);
      if (!reservation) {
        console.error(`Reservation not found for ID: ${id}`);
        throw new AppError(HttpStatus.NotFound, MessageConstants.RESERVATION_NOT_FOUND);
      }

      console.log('Reservation found:', reservation);

      if (reservation.status !== ReservationStatus.PENDING && reservation.status !== ReservationStatus.PAYMENT_FAILED) {
        console.error(`Invalid reservation status: ${reservation.status}`);
        throw new AppError(HttpStatus.BadRequest, `${MessageConstants.INVALID_RESERVATION_STATUS}: ${reservation.status}`);
      }

      const branch = reservation.branch;
      const tableType = reservation.tableType;

      if (!branch || !tableType) {
        console.error('Branch or tableType is missing:', { branch, tableType });
        throw new AppError(HttpStatus.BadRequest, MessageConstants.INVALID_BRANCH_OR_TABLE);
      }

      const updatedReservation = await this._reservationRepo.update(id, {
        status: ReservationStatus.CONFIRMED,
        paymentId,
        paymentMethod: 'razorpay',
        whatsappOptIn: whatsappOptIn ||true,
      });

      if (!updatedReservation) {
        console.error('Failed to update reservation');
        throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }

      console.log('Reservation updated:', updatedReservation);

      // Send confirmation email
      const emailBody =  generateConfirmationEmail(updatedReservation, branch, tableType);
      const emailSent = await sentMail(
        updatedReservation.user.email,
        `Reservation Confirmation`,
        emailBody
      );

      if (!emailSent) {
        console.error('Failed to send confirmation email for reservation:', id);
      } else {
        console.log('Confirmation email sent to:', updatedReservation.user.email);
      }

      // Send WhatsApp notification if opted in
      console.log('Checking WhatsApp opt-in:', updatedReservation.whatsappOptIn);
      if (updatedReservation.whatsappOptIn) {
        console.log('WhatsApp opt-in is true. Preparing to send message...');
        console.log('User phone number:', updatedReservation.user.phone);

        if (!updatedReservation.user.phone) {
          console.error('User phone number is missing for reservation ID:', id);
        } else if (!updatedReservation.user.phone.startsWith('+')) {
          console.warn('Phone number format may be incorrect (should start with +):', updatedReservation.user.phone);
        }

        const { template, parameters } =  generateWhatsAppMessage(updatedReservation);
        console.log('WhatsApp message parameters:', { template, parameters });

        try {
          const messageResponse = await this.twilioClient.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${updatedReservation.user.phone}`,
            contentSid: 'HXe992703cd9bbe13e5ff2de8201a6c7c5',
            contentVariables: JSON.stringify({
              '1': parameters[0],
              '2': parameters[1],
            }),
          });
          console.log('WhatsApp message sent successfully. Message SID:', messageResponse.sid);
        } catch (error) {
          console.error('Failed to send WhatsApp message:', error);
          if (error instanceof Error) {
            console.error('Error details:', error.message);
            console.error('Error stack:', error.stack);
          }
        }
      } else {
        console.log('WhatsApp opt-in is false. Skipping WhatsApp message.');
      }

      return updatedReservation;
    } catch (error) {
      console.error('Error in confirmReservation:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async failReservation(id: string, paymentId: string): Promise<IReservation> {
    try {
      const reservation = await this._reservationRepo.findById(id);
      if (!reservation) throw new AppError(HttpStatus.NotFound, MessageConstants.RESERVATION_NOT_FOUND);
      if (reservation.status !== ReservationStatus.PENDING) {
        throw new AppError(HttpStatus.BadRequest, `${MessageConstants.INVALID_RESERVATION_STATUS}: ${reservation.status}`);
      }
      const updatedReservation = await this._reservationRepo.update(id, {
        status: ReservationStatus.PAYMENT_FAILED,
        paymentId,
      });
      if (!updatedReservation) throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      return updatedReservation;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getAvailableTables(branchId: string, date: Date, timeSlot: string): Promise<ITableType[]> {
    try {
      const allTables = await this._tableTypeRepo.findAllByBranch(branchId);
      const availabilityPromises = allTables.map(async (table) => {
        const reservedQuantity = await this._reservationRepo.getReservedQuantity(
          branchId,
          table._id.toString(),
          date,
          timeSlot
        );
        return reservedQuantity < table.quantity ? table : null;
      });
      return (await Promise.all(availabilityPromises)).filter((table): table is ITableType => table !== null);
    } catch (error) {
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserReservationsWithPagination(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: ReservationStatus
  ): Promise<{ reservations: IReservation[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const [reservations, total] = await Promise.all([
        this._reservationRepo.findByUserIdWithPagination(userId, skip, limit, status),
        this._reservationRepo.countByUserId(userId, status),
      ]);
      return { reservations, total };
    } catch (error) {
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async confirmWithWallet(reservationId: string, userId: string): Promise<IReservation> {
    try {
      console.log(`Confirming reservation with wallet for user: ${userId} reservation: ${reservationId}`);

      // Fetch the reservation
      const reservation = await this._reservationRepo.findById(reservationId);
      if (!reservation) {
        console.error(`Reservation not found for ID: ${reservationId}`);
        throw new AppError(HttpStatus.NotFound, MessageConstants.RESERVATION_NOT_FOUND);
      }

      console.log('Reservation found:', reservation);

      // Verify user ownership
      if (reservation.userId.toString() !== userId) {
        console.error(`User ${userId} does not own reservation ${reservationId}`);
        throw new AppError(HttpStatus.Forbidden, MessageConstants.PERMISSION_DENIED);
      }

      // Check reservation status
      if (reservation.status !== ReservationStatus.PENDING) {
        console.error(`Invalid reservation status: ${reservation.status}`);
        throw new AppError(HttpStatus.BadRequest, `${MessageConstants.INVALID_RESERVATION_STATUS}: ${reservation.status}`);
      }

      // Extract branch and tableType, assuming they are populated (like confirmReservation)
      const branch = typeof reservation.branch === 'object' && 'name' in reservation.branch
        ? reservation.branch
        : await this._branchRepo.findById(reservation.branch.toString());

      const tableType = typeof reservation.tableType === 'object' && 'name' in reservation.tableType
        ? reservation.tableType
        : await this._tableTypeRepo.findById(reservation.tableType.toString());

      // Validate branch and tableType
      if (!branch || !tableType) {
        console.error('Branch or tableType is missing:', { branch, tableType });
        throw new AppError(HttpStatus.BadRequest, MessageConstants.INVALID_BRANCH_OR_TABLE);
      }

      // Calculate the amount to be paid
      const amount = reservation.finalAmount !== undefined ? reservation.finalAmount : (tableType.price || 0) * reservation.tableQuantity;

      // Process wallet payment
      await this._walletRepo.payWithWallet(userId, amount, reservationId);

      // Update reservation status and set whatsappOptIn to true by default (like confirmReservation)
      const updatedReservation = await this._reservationRepo.update(reservationId, {
        status: ReservationStatus.CONFIRMED,
        paymentMethod: 'wallet',
        whatsappOptIn: true, // Align with confirmReservation's default behavior
      });

      if (!updatedReservation) {
        console.error('Failed to update reservation');
        throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      }

      console.log('Reservation updated:', updatedReservation);

      // Send confirmation email
      const emailBody =  generateConfirmationEmail(updatedReservation, branch, tableType);
      const emailSent = await sentMail(
        updatedReservation.user.email,
        `Reservation Confirmation - ${branch.name}`,
        emailBody
      );

      if (!emailSent) {
        console.error('Failed to send confirmation email for reservation:', reservationId);
      } else {
        console.log('Confirmation email sent to:', updatedReservation.user.email);
      }

      // Send WhatsApp notification if opted in (same as confirmReservation)
      console.log('Checking WhatsApp opt-in:', updatedReservation.whatsappOptIn);
      if (updatedReservation.whatsappOptIn) {
        console.log('WhatsApp opt-in is true. Preparing to send message...');
        console.log('User phone number:', updatedReservation.user.phone);

        if (!updatedReservation.user.phone) {
          console.error('User phone number is missing for reservation ID:', reservationId);
        } else if (!updatedReservation.user.phone.startsWith('+')) {
          console.warn('Phone number format may be incorrect (should start with +):', updatedReservation.user.phone);
        }

        const { template, parameters } =  generateWhatsAppMessage(updatedReservation);
        console.log('WhatsApp message parameters:', { template, parameters });

        try {
          const messageResponse = await this.twilioClient.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${updatedReservation.user.phone}`,
            contentSid: 'HXe992703cd9bbe13e5ff2de8201a6c7c5',
            contentVariables: JSON.stringify({
              '1': parameters[0],
              '2': parameters[1],
            }),
          });
          console.log('WhatsApp message sent successfully. Message SID:', messageResponse.sid);
        } catch (error) {
          console.error('Failed to send WhatsApp message:', error);
          if (error instanceof Error) {
            console.error('Error details:', error.message);
            console.error('Error stack:', error.stack);
          }
        }
      } else {
        console.log('WhatsApp opt-in is false. Skipping WhatsApp message.');
      }

      return updatedReservation;
    } catch (error) {
      console.error('Error in confirmWithWallet:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.WALLET_CONFIRMATION_FAILED);
    }
  }

  async getBranchReservations(
    branchId: string,
    page: number = 1,
    limit: number = 10,
    status?: ReservationStatus
  ): Promise<{ reservations: IReservation[]; total: number }> {
    try {
      const branch = await this._branchRepo.findById(branchId);
      if (!branch) throw new AppError(HttpStatus.NotFound, MessageConstants.BRANCH_NOT_FOUND);

      const skip = (page - 1) * limit;
      const [reservations, total] = await Promise.all([
        this._reservationRepo.findByBranchIdWithPagination(branchId, skip, limit, status),
        this._reservationRepo.countByBranchId(branchId, status),
      ]);
      return { reservations, total };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  async updateBranchReservationStatus(
    reservationId: string,
    status: 'completed' | 'cancelled',
    branchId: string
  ): Promise<IReservation | null> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

    
      const reservation = await this._reservationRepo.findById(reservationId);
      if (!reservation) throw new AppError(HttpStatus.NotFound, MessageConstants.RESERVATION_NOT_FOUND);
      
      if (reservation.branch._id.toString() !== branchId) throw new AppError(HttpStatus.Forbidden, MessageConstants.PERMISSION_DENIED);
      if (reservation.status !== ReservationStatus.CONFIRMED) {
        throw new AppError(HttpStatus.BadRequest, MessageConstants.INVALID_RESERVATION_STATUS);
      }

      let updatedReservation: IReservation | null = null;

      if (status === 'cancelled') {
        const tableType = typeof reservation.tableType === 'object' && 'price' in reservation.tableType
          ? reservation.tableType as ITableType
          : await this._tableTypeRepo.findById(reservation.tableType.toString());

        if (!tableType || !('price' in tableType)) throw new AppError(HttpStatus.InternalServerError, MessageConstants.INVALID_BRANCH_OR_TABLE);

        const amount = reservation.finalAmount !== undefined ? reservation.finalAmount : (tableType.price || 0) * reservation.tableQuantity;
        if (amount > 0) {
          await this._walletRepo.updateWalletBalance(reservation.userId.toString(), amount);
          await this._walletRepo.createTransaction({
            userId: reservation.userId.toString(),
            type: 'credit',
            amount,
            description: `Refund for cancelled reservation ${reservationId} by branch`,
            date: new Date(),
          });
        }
      }

      const mappedStatus = status === 'completed' ? ReservationStatus.COMPLETED : ReservationStatus.CANCELLED;
      updatedReservation = await this._reservationRepo.update(reservationId, { status: mappedStatus });
      if (!updatedReservation) throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
      await session.commitTransaction();
      return updatedReservation;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    } finally {
      session.endSession();
    }
  }

  async submitReview(reservationId: string, userId: string, review: { rating: number; comment?: string }): Promise<IReservation> {
    try {
      // Fetch the existing reservation by ID
      const reservation = await this._reservationRepo.findById(reservationId);
      if (!reservation) throw new AppError(HttpStatus.NotFound, MessageConstants.RESERVATION_NOT_FOUND);
  
      console.log('Existing Reservation:', reservation); // Log the current state of the reservation
  
      // Verify the user submitting the review owns the reservation
      if (reservation.userId.toString() !== userId) {
        throw new AppError(HttpStatus.Forbidden, MessageConstants.PERMISSION_DENIED);
      }
  
      // Check if the reservation is completed (only completed reservations can be reviewed)
      if (reservation.status !== ReservationStatus.COMPLETED) {
        throw new AppError(HttpStatus.BadRequest, 'Reviews can only be submitted for completed reservations');
      }
  
      // Log the incoming review data for debugging
      console.log('Received Review:', review);
  
      // Construct the new review object
      const newReview: IReview = {
        rating: review.rating,
        comment: review.comment || undefined, // Explicitly set to undefined if empty string
        createdAt: new Date(),
        userName: reservation.user.name,
      };
  
      console.log('Constructed New Review:', newReview); // Log the new review object
  
      // Append the new review to the existing reviews array, or start a new array if none exists
      const updatedReviews = reservation.reviews ? [...reservation.reviews, newReview] : [newReview];
      console.log('Updated Reviews Array:', updatedReviews); // Log the full reviews array before saving
  
      // Update the reservation with the new reviews array
      const updatedReservation = await this._reservationRepo.update(reservationId, {
        reviews: updatedReviews,
      });
  
      console.log('Updated Reservation:', updatedReservation); // Existing log to verify the result
  
      // Check if the update was successful
      if (!updatedReservation) {
        throw new AppError(HttpStatus.InternalServerError, 'Failed to submit review');
      }
  
      return updatedReservation;
    } catch (error) {
      console.error('Submit Review Error:', error); // Log any errors for debugging
      if (error instanceof AppError) throw error;
      throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
    }
  }

  
async getBranchReviews(branchId: string): Promise<IReview[]> {
  try {
    const reservations = await this._reservationRepo.findByBranchIdWithPagination(branchId, 0, 0, ReservationStatus.COMPLETED);
    // Flatten all reviews from completed reservations
    const reviews = reservations.flatMap(reservation => reservation.reviews || []);
    return reviews;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(HttpStatus.InternalServerError, MessageConstants.INTERNAL_SERVER_ERROR);
  }
}
}