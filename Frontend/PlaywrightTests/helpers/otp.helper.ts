export function extractOTP(emailBody: string): string {
  const match = emailBody.match(/\d{4,6}/);

  if (!match) {
    throw new Error('OTP not found in email');
  }

  return match[0];
}