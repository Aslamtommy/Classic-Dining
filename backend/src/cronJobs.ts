import cron from 'node-cron';
import { ReservationRepository } from './repositories/ReservationRepository';
import { ReservationStatus } from './models/User/Reservation';

const reservationRepo = new ReservationRepository();

export const startCronJobs = () => {
  // Runs every minute
  cron.schedule('* * * * *', async () => {
    try {
      const expiredReservations :any= await reservationRepo.findExpiredPendingReservations(1);  
      for (const reservation of expiredReservations) {
        await reservationRepo.updateStatus(reservation._id.toString(), ReservationStatus.CANCELLED);
        console.log(`Cancelled expired reservation: ${reservation._id}`);
      }
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  });
};