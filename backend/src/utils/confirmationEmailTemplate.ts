import { IReservation } from '../models/User/Reservation';

// Utility function to format date (moved here for reuse within the template)
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Function to generate the confirmation email HTML
export const generateConfirmationEmail = (reservation: IReservation, branch: any, tableType: any): string => {
  const formattedDate = formatDate(reservation.reservationDate);
  const formattedTime = reservation.timeSlot;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8b5d3b; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #fff; padding: 20px; border: 1px solid #e8e2d9; border-radius: 0 0 5px 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .details { margin: 20px 0; }
        .details p { margin: 5px 0; }
        .highlight { color: #8b5d3b; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Reservation Confirmation</h2>
        </div>
        <div class="content">
          <p>Dear ${reservation.user.name},</p>
          <p>We are delighted to confirm your reservation at <span class="highlight">${branch.name}</span>. Below are the details of your booking:</p>
          
          <div class="details">
            <p><strong>Restaurant:</strong> ${branch.name}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Party Size:</strong> ${reservation.partySize} ${reservation.partySize > 1 ? 'people' : 'person'}</p>
            <p><strong>Table Type:</strong> ${tableType.name} (Capacity: ${tableType.capacity})</p>
            <p><strong>Number of Tables:</strong> ${reservation.tableQuantity}</p>
            ${reservation.preferences.length > 0 ? `<p><strong>Preferences:</strong> ${reservation.preferences.join(', ')}</p>` : ''}
            ${reservation.finalAmount !== undefined ? `<p><strong>Total Amount:</strong> ₹${reservation.finalAmount.toFixed(2)}</p>` : ''}
            ${reservation.discountApplied ? `<p><strong>Discount Applied:</strong> ₹${reservation.discountApplied.toFixed(2)}</p>` : ''}
          </div>

          <p>We look forward to welcoming you! If you need to modify or cancel your reservation, please contact us at <a href="mailto:${branch.email}">${branch.email}</a> or call us at ${branch.phone}.</p>
          
          <p>Thank you for choosing ${branch.name}. We hope you have a wonderful dining experience!</p>
          
          <p>Best regards,<br>The ${branch.name} Team</p>
        </div>
        <div class="footer">
          <p>${branch.name} | ${branch.address} | ${branch.phone}</p>
          <p>This is an automated message, please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};