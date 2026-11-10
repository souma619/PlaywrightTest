import { expect, Page } from "@playwright/test";
import AuthHelper from '../helpers/api-helpers';
import { waitForSpinnerToDisappear, hideChatBubble, acceptCookiesIfPresent } from '../helpers/waitHelpers';
import { registerWithIAMOtp } from '../helpers/accountRegistrationWithIAMOTP';

function formatLogMessage(parts: unknown[]): string {
    return parts.map((part) => {
        if (part instanceof Error) {
            return part.stack ?? part.message;
        }
        if (typeof part === 'object' && part !== null) {
            try {
                return JSON.stringify(part);
            } catch {
                return String(part);
            }
        }
        return String(part);
    }).join(' ');
}

function logInfo(_page: Page, ...parts: unknown[]) {
    const message = formatLogMessage(parts);
    console.log(message);
}

function logWarn(_page: Page, ...parts: unknown[]) {
    const message = formatLogMessage(parts);
    console.warn(message);
}

function logError(_page: Page, ...parts: unknown[]) {
    const message = formatLogMessage(parts);
    console.error(message);
}
let newProjectId: string;
let email = process.env.createEmail as string;
let password = process.env.password as string;
let userId: string;

export default class AccountsPage {

    constructor(public page: Page) {
        page.on('console', msg => {
            const now = new Date();
            const timestamp = now.toUTCString();
            console.log(`${timestamp} - ${msg.type().toUpperCase()} - ${msg.text()}`);

        });
    }

     /**
     * Deletes a user by email using AuthHelper utilities.
     * @param {any} request - Playwright APIRequestContext or similar.
     * @param {string | null} email - Email address of the user to delete.
     */
    async deleteUser(request: any, email: string | null) { // ✅ email passed in
        if (!email) {
            logWarn(this.page, "No email provided, skipping delete.");
            return;
        }
        const authHelper = new AuthHelper(request);

        const oldId2 = await authHelper.getUserByEmail(email);
        if (oldId2 == false) {
            logInfo(this.page, "User ID associated with email is already Deleted");
        } else {
            expect(oldId2).toBeTruthy();
            await authHelper.deleteExistingUser(oldId2);
            await authHelper.deleteUserFromUserDetails(userId);
        }
    }

    // Add this method inside the class
    /**
     * Captures the userId from a network response and stores it for later use.
     */
    async captureUserDetailsID() {
        this.page.on('response', async (response) => {
            try {
                if (
                    response.url().includes('refresh') &&
                    response.request().method() === 'POST' &&
                    response.status() === 200
                ) {
                    const body = await response.json();
                    if (body?.userId) {
                        userId = body.userId;
                        logInfo(this.page, 'Captured userDetailsID:', userId);
                    }
                }
            } catch { }
        });
    }

    async launchHomePage() {
        logInfo(this.page, "Launched JumpStarter Page");
        this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.page.goto('https://js.' + process.env.environment + '.digitalmbd.net/secret/straw-serve-pound.html');
        //navigate to icebreaker page
        await acceptCookiesIfPresent(this.page);
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
        logInfo(this.page, "Successfully navigated to Icebreaker page");
    }

    async getProjectID(): Promise<string> {
        await this.page.goto('https://js.' + process.env.environment + '.digitalmbd.net/secret/straw-serve-pound.html');
        const [response] = await Promise.all([
            this.page.waitForResponse(response =>
                response.url().includes('/projectprofile/v1/projects') && (response.status() === 200 || response.status() === 201)),

        ]);
        const responseData = await response.json();
        //const response= await this.page.waitForResponse(response =>response.url().includes('/projectprofile/v1/projects') && response.status()===200);
        //navigate to icebreaker page
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
        logInfo(this.page, "Successfully navigated to Icebreaker page");
        //  const responseData = await response.json();
        return responseData.id;
    }

   /**
            * Verifies the sign-in process and checks for correct UI elements after registration.
            * @param {string} postalCode - Postal code for registration.
            * @returns {Promise<{status: string, email: string | null}>}
            */
           async verifySignIn(postalCode: string) {
               try {
                   await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
                   await this.page.getByRole('button', { name: 'Sign in' }).click();
                   await this.page.waitForURL(/.*digitalmbd\.net\/u\/login\/identifier.*/);
       
                   const { email } = await registerWithIAMOtp(this.page, postalCode);
                   logInfo(this.page, 'Registered Email:', email);
       
                   const cookieBtn = this.page.getByRole('button', { name: /accept all cookies/i });
                   if (await cookieBtn.isVisible()) {
                       await cookieBtn.click();
                   }
       
                   const profileImg = this.page.locator('.chakra-avatar__img');
                   await expect(profileImg).toBeVisible();
                   await profileImg.click();
       
                   await expect(this.page.locator('span.name')).toBeVisible();
                   await expect(this.page.locator('span.email')).toContainText(email);
                   await expect(this.page.getByTestId('TestId_AccountOverview_Btn')).toBeVisible();
                   const closeBtn = this.page.locator('[aria-label="close modal button"]');
       
                   if (await closeBtn.count() > 0 && await closeBtn.isVisible()) {
                       await closeBtn.click();
                       logInfo(this.page, 'Modal closed');
                   }
       
                   return { status: 'Passed' as string, email: email as string | null };
               }
               catch {
                   logError(this.page, "Failed to verify Sign in details");
                   return { status: 'Failed' as string, email: null as string | null };
               }
           }
       
    async verifyAccountsEditProfile() {
        expect(await this.page.locator('xpath=//button[text()="Account overview"]').click()).toBeTruthy;
        await this.page.waitForURL('https://login.digitalmbd.net/masterbrandadb2c.onmicrosoft.com/**');
        await waitForSpinnerToDisappear(this.page, 30000);
        expect(await this.page.locator('xpath=//div[text()="Account overview"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="My information"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@id="avatar"]/span').isVisible()).toBeTruthy;
        const initials = await this.page.locator('xpath=//div[@id="avatar"]/span').innerText();
        logInfo(this.page, "Initials:" + initials);
        const firstName = await this.page.locator('xpath=//label[text()="First Name"]/../input').getAttribute('value');
        logInfo(this.page, "firstName:" + firstName);
        const lastName = await this.page.locator('xpath=//label[text()="Last Name"]/../input').getAttribute('value');
        logInfo(this.page, "lastName:" + lastName);
        // Extract the first letter from firstName and lastName
        const expectedInitials =
            (firstName && firstName.charAt(0).toUpperCase() || '') +
            (lastName && lastName.charAt(0).toUpperCase() || '');

        // Compare initials with the expected initials
        if (initials === expectedInitials) {
            logInfo(this.page, "The initials match.");
        } else {
            logInfo(this.page, "The initials do not match.");
        }
        expect(await this.page.locator('xpath=//label[text()="First Name"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//label[text()="Last Name"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//label[text()="Country"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//label[text()="Zip code"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//label[text()="Phone number (optional)"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//label[text()="First Name"]/../input').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//label[text()="First Name"]/../input').click()).toBeTruthy;
        await this.page.keyboard.press('Control+A');
        await this.page.keyboard.press('Delete');
        expect(await this.page.locator('xpath=//label[text()="First Name"]/../input').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//label[text()="First Name"]/../input').fill('AutomationTestUserFirstName')).toBeTruthy;
        await this.page.keyboard.press('Tab');
        expect(await this.page.locator('xpath=//label[text()="Last Name"]/../input').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//label[text()="Last Name"]/../input').click()).toBeTruthy;
        await this.page.keyboard.press('Control+A');
        await this.page.keyboard.press('Delete');
        expect(await this.page.locator('xpath=//label[text()="Last Name"]/../input').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//label[text()="Last Name"]/../input').fill('TestLastName')).toBeTruthy;
        await this.page.keyboard.press('Tab');
        expect(await this.page.locator('xpath=//label[text()="Country"]/../input').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//label[text()="Zip code"]/../input').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//label[text()="Zip code"]/../input').click()).toBeTruthy;
        await this.page.keyboard.press('Control+A');
        await this.page.keyboard.press('Delete');
        expect(await this.page.locator('xpath=//label[text()="Zip code"]/../input').fill('11716')).toBeTruthy;
        await this.page.keyboard.press('Tab');
        expect(await this.page.locator('xpath=//label[text()="Phone number (optional)"]/../input').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//label[text()="Phone number (optional)"]/../input').click()).toBeTruthy;
        await this.page.keyboard.press('Control+A');
        await this.page.keyboard.press('Delete');
        expect(await this.page.locator('xpath=//label[text()="Phone number (optional)"]/../input').fill('1234567890')).toBeTruthy;
        await this.page.keyboard.press('Tab');
        const element1 = this.page.locator('#marketingSwitch');
        const backgroundColor1 = await element1.evaluate((el) =>
            window.getComputedStyle(el).backgroundColor
        );
        expect(backgroundColor1).toBe('rgb(112, 112, 112)');
        expect(await this.page.locator('xpath=//input[@id="marketingSwitch"]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=//input[@id="marketingSwitch"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//input[@id="marketingSwitch"]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Save and continue"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Save and continue"]').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
        expect(await this.page.locator('xpath=(//*[@id="root"]/div/div[2]/div/div/div//*[local-name()="svg"]/*[local-name()="circle"])[1]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//*[@id="root"]/div/div[2]/div/div/div//*[local-name()="svg"]/*[local-name()="circle"])[2]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//div[@role="img" and contains(@class,"chakra-avatar")]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@role="img" and contains(@class,"chakra-avatar")]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Account overview"]').click()).toBeTruthy;
        await this.page.waitForURL('https://login.digitalmbd.net/masterbrandadb2c.onmicrosoft.com/**');
        await waitForSpinnerToDisappear(this.page, 30000);
        expect(await this.page.locator('xpath=//div[text()="Account overview"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="My information"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@id="avatar"]/span').isVisible()).toBeTruthy;
        const initialsUpdated = await this.page.locator('xpath=//div[@id="avatar"]/span').innerText();
        logInfo(this.page, "initialsUpdated:" + initialsUpdated);
        const firstNameUpdated = await this.page.locator('xpath=//label[text()="First Name"]/../input').getAttribute('value');
        logInfo(this.page, "firstNameUpdated:" + firstNameUpdated);
        if (firstNameUpdated === 'AutomationTestUserFirstName') {
            logInfo(this.page, "The firstName is updated successfully.");
        } else {
            logInfo(this.page, "The firstName is not updated.");
        }
        const lastNameUpdated = await this.page.locator('xpath=//label[text()="Last Name"]/../input').getAttribute('value');
        logInfo(this.page, "lastNameUpdated:" + lastNameUpdated);
        if (lastNameUpdated === 'TestLastName') {
            logInfo(this.page, "The lastName is updated successfully.");
        } else {
            logInfo(this.page, "The lastName is not updated.");
        }

        const zipUpdated = await this.page.locator('xpath=//label[text()="Zip code"]/../input').getAttribute('value');
        logInfo(this.page, "zipUpdated:" + zipUpdated);
        if (zipUpdated === '11716') {
            logInfo(this.page, "The zip is updated successfully.");
        } else {
            logInfo(this.page, "The zip is not updated.");
        }

        const phoneUpdated = await this.page.locator('xpath=//label[text()="Phone number (optional)"]/../input').getAttribute('value');
        logInfo(this.page, "phoneUpdated:" + phoneUpdated);
        if (phoneUpdated === '1234567890') {
            logInfo(this.page, "The zip is updated successfully.");
        } else {
            logInfo(this.page, "The zip is not updated.");
        }
        // Extract the first letter from firstName and lastName
        const expectedInitialsUpdated =
            (firstNameUpdated && firstNameUpdated.charAt(0).toUpperCase() || '') +
            (lastNameUpdated && lastNameUpdated.charAt(0).toUpperCase() || '');

        // Compare initials with the expected initials
        if (initialsUpdated === expectedInitialsUpdated) {
            logInfo(this.page, "The initials match.");
        } else {
            logInfo(this.page, "The initials do not match.");
        }
        const element = await this.page.locator('#marketingSwitch');
        const backgroundColor = await element.evaluate((el) => {
            return window.getComputedStyle(el).backgroundColor;
        });

        expect(backgroundColor).toBe('rgb(32, 123, 119)');

    }

    async verifyAccountsEditProfileMarketingNotificationOff() {
        expect(await this.page.locator('xpath=//input[@id="marketingSwitch"]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=//input[@id="marketingSwitch"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//input[@id="marketingSwitch"]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Save and continue"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Save and continue"]').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
        expect(await this.page.locator('xpath=(//*[@id="root"]/div/div[2]/div/div/div//*[local-name()="svg"]/*[local-name()="circle"])[1]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//*[@id="root"]/div/div[2]/div/div/div//*[local-name()="svg"]/*[local-name()="circle"])[2]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//div[@role="img" and contains(@class,"chakra-avatar")]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@role="img" and contains(@class,"chakra-avatar")]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Account overview"]').click()).toBeTruthy;
        await this.page.waitForURL('https://login.digitalmbd.net/masterbrandadb2c.onmicrosoft.com/**');
        await waitForSpinnerToDisappear(this.page, 30000);
        expect(await this.page.locator('xpath=//div[text()="Account overview"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="My information"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@id="avatar"]/span').isVisible()).toBeTruthy;
        const element = this.page.locator('#marketingSwitch');
        const backgroundColor = await element.evaluate((el) =>
            window.getComputedStyle(el).backgroundColor
        );
        expect(backgroundColor).toBe('rgb(112, 112, 112)');
    }

    async verifyAccountWallPageDesign() {

        await expect(this.page.getByRole('button', { name: 'Sign in' })).toBeVisible();

        await Promise.all([
            this.page.waitForURL(/login\.digitalmbd\.net/),
            this.page.getByRole('button', { name: 'Sign in' }).click()
        ]);

        await this.page.waitForLoadState('domcontentloaded');

        await expect(this.page.getByRole('img', { name: 'rebode logo' })).toBeVisible();
        await expect(this.page.getByRole('heading', { name: 'Sign in', level: 1 })).toBeVisible();
        await expect(this.page.getByRole('textbox', { name: 'Email Address' })).toBeVisible();
        await expect(this.page.getByRole('textbox', { name: 'Password' })).toBeVisible();
        await expect(this.page.getByRole('link', { name: 'Forgot your password?' })).toBeVisible();
        await expect(this.page.getByRole('button', { name: 'Sign in' })).toBeVisible();
        await expect(this.page.getByText('Don\'t have an account?Sign up')).toBeVisible();
        await expect(this.page.getByRole('link', { name: 'Google logo Sign in with' })).toBeVisible();

        // Click Sign up now
        await this.page.getByRole('link', { name: 'Sign up now' }).click();
        await expect(this.page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
        await expect(this.page.getByRole('textbox', { name: 'Email' })).toBeVisible();
        await expect(this.page.getByRole('button', { name: 'Send verification code' })).toBeVisible();
        await expect(this.page.getByRole('textbox', { name: 'New Password', exact: true })).toBeDisabled();
        await expect(this.page.getByRole('textbox', { name: 'Confirm New Password' })).toBeDisabled();
        await expect(this.page.getByRole('textbox', { name: 'First Name' })).toBeDisabled();
        await expect(this.page.getByRole('textbox', { name: 'Last Name' })).toBeDisabled();
        await expect(this.page.getByLabel('Country')).toBeDisabled();
        await expect(this.page.getByRole('textbox', { name: 'Zip code' })).toBeDisabled();
        await expect(this.page.getByRole('textbox', { name: 'Phone number (optional)' })).toBeDisabled();

        await this.page.getByRole('link', { name: 'cancel account signup Cancel' }).click();
        await this.page.getByRole('link', { name: 'Sign up now' }).click();
    }

    async VerifyAccountWallPageDesignAsQuest() {

        await this.page.getByRole('button', { name: 'Sign up with email' }).waitFor();
        //await expect(this.page.locator('[id="chakra-modal-:r5:"]')).toContainText('Connect with local pros. Try on your style with AI.');
        //await expect(this.page.locator('[id="chakra-modal-:r5:"]')).toContainText('Sign up now to get free, no-obligation design consults, visualize your dream kitchen with AI, and more.');
        await expect(this.page.getByRole('img', { name: 'social signin' }).first()).toBeVisible();
        await expect(this.page.getByRole('button', { name: 'Sign up with email' })).toBeVisible();        
        await expect(this.page.getByText('Already have an account? Sign')).toBeVisible();
        
        // Sign up with email
        await this.page.getByRole('button', { name: 'Sign up with email' }).click();
        await this.page.waitForLoadState('domcontentloaded');
        await expect(this.page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
        await expect(this.page.getByRole('textbox', { name: 'Email' })).toBeVisible();
        await expect(this.page.getByRole('button', { name: 'Send verification code' })).toBeVisible();
        await expect(this.page.getByRole('textbox', { name: 'New Password', exact: true })).toBeDisabled();
        await expect(this.page.getByRole('textbox', { name: 'Confirm New Password' })).toBeDisabled();
        await expect(this.page.getByRole('textbox', { name: 'First Name' })).toBeDisabled();
        await expect(this.page.getByRole('textbox', { name: 'Last Name' })).toBeDisabled();
        await expect(this.page.getByLabel('Country')).toBeDisabled();
        await expect(this.page.getByRole('textbox', { name: 'Zip code' })).toBeDisabled();
        await expect(this.page.getByRole('textbox', { name: 'Phone number (optional)' })).toBeDisabled();
    }
}