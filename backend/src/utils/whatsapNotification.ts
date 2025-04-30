import { IReservation } from '../models/User/Reservation';

// Function to generate WhatsApp message parameters
export const generateWhatsAppMessage = (reservation: IReservation): { template: string; parameters: string[] } => {
  const formattedDate = reservation.reservationDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = reservation.timeSlot;
  return {
    template: 'reservation_confirmation',
    parameters: [formattedDate, formattedTime],
  };
};