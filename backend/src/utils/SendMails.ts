import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
export const sentMail = async (
  email: string,
  subject: string,
  body: string,
): Promise<boolean> => {
  try {
    // smt server set up

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.SENDMAIL,
        pass: process.env.PASSKEY,
      },
    });

    const mailOptions = {
      from: process.env.SENDMAIL,
      to: email,
      subject: subject,
      html: body,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error: any) {
    console.log(error.message);
    return false;
  }
};
