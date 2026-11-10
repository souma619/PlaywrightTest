import { Page, expect } from '@playwright/test';
import { getOtpWithRetry } from './gmail';

// ✅ Utility: Generate timestamp
function generateTimestamp(): string {
  const now = new Date();

  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  const ms = String(now.getMilliseconds()).padStart(3, '0');

  return `${dd}${mm}${yy}${ms}`;
}

// 🔥 MAIN REUSABLE FUNCTION
export async function signInWithIAMOtp(page: Page, postalCode: string): Promise<{ email: string; lastName: string }> {
  const env = process.env.environment;

  if (!env) {
    throw new Error('❌ environment not set');
  }

  const timestamp = generateTimestamp();

  const email = `soumabha.bhandari.mbd01+${env}auto${postalCode}@gmail.com`;
  const lastName = `${env}auto${postalCode}`;

  console.log('Generated Email:', email);
  console.log('Generated LastName:', lastName);

  const startTime = Date.now();

  // Step 1: Click Sign up
  await page.locator('text=Sign up').click();

  // Step 2: Enter email
  await page.locator('#email').fill(email);
  await page.locator('._button-signup-id').click();
  await page.waitForTimeout(10000);

  // Step 3: Fetch OTP
  const otp = await getOtpWithRetry(email, startTime);
  console.log('OTP:', otp);

  // Step 4: Enter OTP
  await page.locator('#code').fill(otp);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForTimeout(10000);

    console.log('✅ OTP Signin completed');

  return { email, lastName };
}