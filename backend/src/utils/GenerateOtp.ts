import bcrypt from 'bcrypt';

export const generateOtp = (): string => {
  const length = 6;
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return otp;
};

export async function hashOtp(otp: string): Promise<string> {
  try {
    return await bcrypt.hash(otp, 10);
  } catch (error: any) {
    console.log(error.message);
    throw new Error();
  }
}

export async function compareOtps(
  otp: string,
  otpDb: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(otp, otpDb);
  } catch (error: any) {
    console.log(error.any);
    throw new Error('wrong otp');
  }
}
