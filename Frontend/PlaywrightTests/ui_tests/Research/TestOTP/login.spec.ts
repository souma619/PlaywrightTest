import { test, expect } from '@playwright/test';
import { getOtpWithRetry } from '../../../helpers/gmail';

const logBoundary = (message: string) => {
  const prefix = '>'.repeat(11);
  const suffix = '<'.repeat(10);
  console.log(prefix + message + suffix);
};

// ✅ Utility: Generate timestamp (DDMMYYHHmmSSS)
function generateTimestamp(): string {
  const now = new Date();

  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  const ms = String(now.getMilliseconds()).padStart(3, '0');

  return `${dd}${mm}${yy}${ms}`;
}

test('Login with OTP', async ({ page }) => {
  test.setTimeout(480000);
  logBoundary("Starting test: Login with OTP");

  // 🔥 SINGLE SOURCE OF TRUTH
  const timestamp = generateTimestamp();

 const email = `soumabha.bhandari.mbd01+${process.env.environment}${timestamp}@gmail.com`;
 const lastName = `${process.env.environment}${timestamp}`;

  console.log('Generated Email:', email);
  console.log('Generated LastName:', lastName);

  const startTime = Date.now();

  await page.goto('https://js.' + process.env.environment + '.digitalmbd.net/secret/straw-serve-pound.html');

  await page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');

  await page.getByRole('button', { name: 'Sign in' }).click();

  // Step 1: Trigger OTP
  await page.locator('text=Sign up').click();
  await page.locator('#email').fill(email);
  await page.locator('._button-signup-id').click();
   await page.waitForTimeout(10000); // Wait for the registration form to load

  // ✅ Step 2: Get OTP
  const otp = await getOtpWithRetry(email, startTime);
  console.log('OTP:', otp);

  // Step 3: Enter OTP
  await page.locator('#code').fill(otp);
  await page.getByRole('button', { name: 'Continue' }).click();


    await expect(page).toHaveURL(/\/register\?returnTo/);
    await page.waitForTimeout(7000); // Wait for the registration form to load
    await page.locator('#firstName').fill('Test');
    await page.locator('#lastName').fill(lastName);
    await page.locator('#zipCode').fill('07080');
    await page.waitForTimeout(7000);
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForTimeout(7000);

  // Step 4: Validate login
  await expect(page).toHaveURL(/auth_redirect=true/);
  await page.waitForURL(/.*digitalmbd\.net\/start.*/);

  console.log("Successfully navigated to Icebreaker page");

  // Cookie handling
  const cookieButton = page.getByRole('button', { name: /accept all cookies/i });
  if (await cookieButton.isVisible()) {
    await cookieButton.click();
    await page.waitForTimeout(7000);
  }

  // Profile icon
  const profileImg = page.locator('.chakra-avatar__img');
  await profileImg.waitFor({ state: 'visible' });
  await profileImg.click();
  await page.waitForTimeout(7000);

  // Validate profile info
  await expect(page.locator('span.name')).toBeVisible();
  await expect(page.locator('span.email')).toBeVisible();

  // Account overview
  const accountBtn = page.getByTestId('TestId_AccountOverview_Btn');
  await expect(accountBtn).toBeVisible();
  await page.waitForTimeout(7000);

  // Close modal
  await page.locator('div.icon svg').click();

  await expect(page.locator('p.headlineJumbo'))
    .toHaveText(/Let.s talk about the kitchen you.ve always wanted./, { timeout: 15000 });

  // Icebreaker flow
  await page.getByTestId('TestId_Icebreaker_Q1_A0').click();
  await page.getByTestId('TestId_Icebreaker_Q1_A1').click();
  await page.getByTestId('TestId_Icebreaker_Q1_Next_Btn').click();

  await page.getByTestId('TestId_Icebreaker_Q2_A1').click();
  await page.getByTestId('TestId_Icebreaker_Q2_Next_Btn').click();

  await page.getByTestId('TestId_Icebreaker_Q3_A1').click();
  await page.getByTestId('TestId_Icebreaker_Q3_Next_Btn').click();

  await page.getByTestId('TestId_Icebreaker_Q4_A1').click();
  await page.getByTestId('TestId_Icebreaker_Q4_Next_Btn').click();

  await page.getByTestId('TestId_Icebreaker_Q5_A1').click();
  await page.getByTestId('TestId_Icebreaker_Q5_Next_Btn').click();

  await page.getByTestId('TestId_Icebreaker_CONTINUE_Next_Btn').click();

  await page.waitForURL(`https://js.' + process.env.environment + '.digitalmbd.net/style`);
  logBoundary("Completed test: Login with OTP");
});