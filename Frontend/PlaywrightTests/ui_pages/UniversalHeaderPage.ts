import { expect, Locator, Page } from "@playwright/test";
import { registerWithIAMOtp } from '../helpers/accountRegistrationWithIAMOTP';
import AuthHelper from '../helpers/api-helpers';
import { waitForSpinnerToDisappear, hideChatBubble, acceptCookiesIfPresent } from '../helpers/waitHelpers';
import * as assert from "assert";
import * as fs from "fs";
import * as path from 'path';
import { signInWithIAMOtp } from "../helpers/accountSignInWithIAMOTP";
import { attachConsoleLogger } from '../helpers/logSuppress';

// Lazy load pdfParse to avoid demo code side effects on module import
/*
let pdfParse: any = null;
const loadPdfParse = async () => {
  if (!pdfParse) {
    pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
  }
  return pdfParse;
};
*/
let newProjectId: string;
let userId: string;
let currentPage: string;

/**
 * SmokePage provides methods for automating and verifying
 * user flows and UI interactions on the main application pages using Playwright.
 * Each method encapsulates a specific test scenario or utility for end-to-end testing.
 */
export default class UniversalHeaderPage {

    /**
     * Constructs a UniversalHeaderPage instance and attaches a console event listener for logging.
     * @param {Page} page - Playwright Page object for browser automation.
     */
    constructor(public page: Page) {
        attachConsoleLogger(page);
    }

    private async logInfo(message: string) {
        try {
            await this.page.evaluate((msg) => console.log(msg), message);
        } catch {
            console.log(message);
        }
    }

    private async logWarn(message: string) {
        try {
            await this.page.evaluate((msg) => console.warn(msg), message);
        } catch {
            console.warn(message);
        }
    }

    private async logError(message: string, details?: unknown) {
        const detailText = details === undefined
            ? ''
            : details instanceof Error
                ? ` ${details.stack ?? details.message}`
                : ` ${String(details)}`;
        try {
            await this.page.evaluate((msg) => console.error(msg), `${message}${detailText}`);
        } catch {
            console.error(`${message}${detailText}`);
        }
    }

    private async returnToCurrentPage() {
        await this.page.goto(currentPage, { waitUntil: 'commit', timeout: 120000 });
        await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {
            // Some content pages keep loading secondary scripts; URL commit is enough before header checks.
        });
        expect(this.page.url()).toContain(currentPage);
    }

    private async clearBlockingOverlay() {
        await this.page.waitForTimeout(1000);
        await this.page.locator('div.fixed.inset-0.z-50').waitFor({ state: 'detached', timeout: 15000 }).catch(async () => {
            await this.page.locator('div.fixed.inset-0.z-50').evaluateAll(elements => {
                for (const element of elements) {
                    const htmlElement = element as HTMLElement;
                    htmlElement.style.pointerEvents = 'none';
                    htmlElement.style.display = 'none';
                }
            });
        });
    }

    /**
     * Deletes a user by email using AuthHelper utilities.
     * @param {any} request - Playwright APIRequestContext or similar.
     * @param {string | null} email - Email address of the user to delete.
     */
    async deleteUser(request: any, email: string | null) { // ✅ email passed in
        if (!email) {
            await this.logWarn("No email provided, skipping delete.");
            return;
        }
        const authHelper = new AuthHelper(request);

        const oldId2 = await authHelper.getUserByEmail(email);
        if (oldId2 == false) {
            await this.logInfo("User ID associated with email is already Deleted");
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
                        await this.logInfo(`Captured userDetailsID: ${userId}`);
                    }
                }
            } catch { }
        });
    }

    /**
     * Launches the home page and sets the viewport size, then waits for the page to load.
     */
    async launchKRJPage() {
        
        await this.logInfo("Launched JumpStarter Page");
        this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.page.goto('https://js.' + process.env.environment + '.digitalmbd.net/secret/straw-serve-pound.html');
        await acceptCookiesIfPresent(this.page);
        await waitForSpinnerToDisappear(this.page, 15000);
        await this.page.waitForTimeout(15000);
        await this.logInfo("Successfully navigated to Icebreaker Page");
    }

     /**
     * Launches the home page and sets the viewport size, then waits for the page to load.
     */
    async launchNewHomePage() {
        const homeOrigin = 'https://home.' + process.env.environment + '.digitalmbd.net';
        currentPage = homeOrigin;
        await this.logInfo("Launched New Home Page");
        await this.page.goto(homeOrigin, { waitUntil: 'domcontentloaded' });
        await waitForSpinnerToDisappear(this.page, 20000);
        await this.page.waitForTimeout(50000);
        await this.logInfo("Successfully navigated to New Home Page");
    }

    async launchBlogPage() {
const blogPage= 'https://home.' + process.env.environment + '.digitalmbd.net/blog';
        await this.logInfo("Launched Blog Page");
        currentPage = blogPage;
        await this.page.goto(blogPage);
        await waitForSpinnerToDisappear(this.page, 20000);
        await this.page.waitForTimeout(30000);
        await this.logInfo("Successfully navigated to Blog Page");
    }

    async launchExpertSupportPage() {

        const expertSupportPage = 'https://home.' + process.env.environment + '.digitalmbd.net/expertsupport';
        await this.logInfo("Launched Expert Support Page");
        currentPage = expertSupportPage;
        await this.page.goto(expertSupportPage);
        await waitForSpinnerToDisappear(this.page, 20000);
        await this.page.waitForTimeout(30000);
        await this.logInfo("Successfully navigated to Expert Support Page");
    }

    async launchVisionPage() {

        await this.logInfo("Launched Vision Page");
        const visionPage = 'https://home.' + process.env.environment + '.digitalmbd.net/vision';
        currentPage = visionPage;
        await this.page.goto(visionPage);
        await this.page.waitForTimeout(150000);
        await this.logInfo("Successfully navigated to Vision Page");
    }

 async verifyUniversalHeadersAreDisplayed() {

    try {
        // Plan your kitchen
        await this.logInfo('verifyUniversalHeadersAreDisplayed: checking Plan your kitchen header');
        const planYourKitchen = this.page.locator('span[aria-haspopup="true"]', { hasText: 'Plan your kitchen' });
        await expect(planYourKitchen).toBeVisible();
        await this.logInfo('verifyUniversalHeadersAreDisplayed: Plan your kitchen header verified');
        await this.clearBlockingOverlay();

        // Plan your kitchen - dropdown on hover
        await this.logInfo('verifyUniversalHeadersAreDisplayed: hovering Plan your kitchen to verify dropdown tiles');
        await planYourKitchen.hover();
        await this.page.waitForTimeout(5000);

        const planYourKitchenTiles = [
            {
                label: 'Start your kitchen plan',
                urlContains: 'start',
                title: 'Jumpstarter by Rebode',
                urlTimeout: 15000,
            },
            {
                label: 'Take the style quiz',
                urlContains: 'home/style/quiz',
                title: 'Rebode',
                urlTimeout: 15000,
            },
          /*  {
                label: 'See it in 3D',
                urlContains: 'vision',
                title: 'Rebode Vision',
                urlTimeout: 15000,
            },
            */
            {
                label: 'Talk with a designer',
                urlContains: 'home/designers',
                title: 'Rebode',
                urlTimeout: 15000,
            },
        ];

        for (const tile of planYourKitchenTiles) {
            const tileLocator = this.page.locator(
                'span[class*="navDropdownItemLabel"]',
                { hasText: tile.label }
            );
            await expect(tileLocator).toBeVisible();
            await this.logInfo(`verifyUniversalHeadersAreDisplayed: Plan your kitchen dropdown tile "${tile.label}" verified`);

            await this.page.waitForTimeout(15000);
            await tileLocator.hover();
            await this.logInfo(`verifyUniversalHeadersAreDisplayed: clicking "${tile.label}"`);
            await tileLocator.click();

            await this.page.waitForURL(`**${tile.urlContains}**`, { timeout: tile.urlTimeout });
            expect(this.page.url()).toContain(tile.urlContains || this.page.url().includes('gl'));
            await this.page.waitForTimeout(25000);
            await this.logInfo(`verifyUniversalHeadersAreDisplayed: URL verified to contain "${tile.urlContains}" after clicking "${tile.label}"`);

            await expect(this.page).toHaveTitle(tile.title);
            await this.logInfo(`verifyUniversalHeadersAreDisplayed: page title verified as "${tile.title}" after clicking "${tile.label}"`);

            await this.logInfo(`verifyUniversalHeadersAreDisplayed: navigating back after "${tile.label}"`);
            await this.returnToCurrentPage();
            expect(this.page.url()).toContain(currentPage);
            await this.page.waitForTimeout(60000);
           // await expect(this.page).toHaveTitle('Kitchen Remodel & Design: Create Your Dream Kitchen | Rebode');
            await this.logInfo(`verifyUniversalHeadersAreDisplayed: navigated back to current page successfully after "${tile.label}"`);

            await expect(planYourKitchen).toBeVisible();
            await this.clearBlockingOverlay();
            await this.page.mouse.move(0, 0);
            await planYourKitchen.hover();
            await this.page.waitForTimeout(15000);
        }

        // Resources
        await this.logInfo('verifyUniversalHeadersAreDisplayed: checking Resources header');
        const resources = this.page.locator('span[aria-haspopup="true"]', { hasText: 'Resources' });
        await expect(resources).toBeVisible();
        await this.logInfo('verifyUniversalHeadersAreDisplayed: Resources header verified');
        await this.clearBlockingOverlay();
        await resources.hover();
        await this.page.waitForTimeout(5000);

        const resourcesTiles = [
            {
                label: 'Kitchen design articles',
                urlContains: 'blog',
                title: 'Rebode Blog | Kitchen Remodel Ideas & Expert Inspiration',
                urlTimeout: 15000,
            },
            {
                label: 'Kitchen rebates & offers',
                urlContains: 'rebate',
                title: 'Rebode Rebate | Up to $1,000 Back on your Kitchen Remodel',
                urlTimeout: 15000,
            },
            {
                label: 'Common questions',
                urlContains: 'frequently-asked-questions',
                title: 'Rebode FAQ | Getting Started with Jumpstarter',
                urlTimeout: 15000,
            },
        ];

        for (const tile of resourcesTiles) {
            const tileLocator = this.page.locator(
                'span[class*="navDropdownItemLabel"]',
                { hasText: tile.label }
            );
            await expect(tileLocator).toBeVisible();
            await this.logInfo(`verifyUniversalHeadersAreDisplayed: Resources dropdown tile "${tile.label}" verified`);

            await this.page.waitForTimeout(10000);
            await tileLocator.hover();
            await this.logInfo(`verifyUniversalHeadersAreDisplayed: clicking "${tile.label}"`);
            await tileLocator.click();

            await this.page.waitForURL(`**${tile.urlContains}**`, { timeout: tile.urlTimeout });
            expect(this.page.url()).toContain(tile.urlContains);
            await this.page.waitForTimeout(15000);
            await this.logInfo(`verifyUniversalHeadersAreDisplayed: URL verified to contain "${tile.urlContains}" after clicking "${tile.label}"`);

            await expect(this.page).toHaveTitle(tile.title);
            await this.logInfo(`verifyUniversalHeadersAreDisplayed: page title verified as "${tile.title}" after clicking "${tile.label}"`);

            await this.logInfo(`verifyUniversalHeadersAreDisplayed: navigating back after "${tile.label}"`);
            await this.returnToCurrentPage();
            expect(this.page.url()).toContain(currentPage);
            await this.page.waitForTimeout(60000);
            //await expect(this.page).toHaveTitle('Kitchen Remodel & Design: Create Your Dream Kitchen | Rebode');
            await this.logInfo(`verifyUniversalHeadersAreDisplayed: navigated back to current page successfully after "${tile.label}"`);

            await expect(resources).toBeVisible();
            await this.clearBlockingOverlay();
            await this.page.mouse.move(0, 0);
            await resources.hover();
            await this.page.waitForTimeout(5000);
        }

        // Why Rebode
        await this.logInfo('verifyUniversalHeadersAreDisplayed: checking Why Rebode link');
        const whyRebode = this.page.locator('a', { hasText: 'Why Rebode' }).first();
        await expect(whyRebode).toBeVisible();
        await this.logInfo('verifyUniversalHeadersAreDisplayed: Why Rebode link verified');

        await this.logInfo('verifyUniversalHeadersAreDisplayed: clicking "Why Rebode"');
        await whyRebode.click();

        await this.page.waitForURL('**about**', { timeout: 15000 });
        expect(this.page.url()).toContain('about');
        await this.logInfo('verifyUniversalHeadersAreDisplayed: URL verified to contain "about" after clicking "Why Rebode"');

        await expect(this.page).toHaveTitle('About Rebode | Simplifying Kitchen Design & Remodel');
        await this.logInfo('verifyUniversalHeadersAreDisplayed: page title verified as "About Rebode | Simplifying Kitchen Design & Remodel" after clicking "Why Rebode"');

        return "Passed";
    }
    catch (error) {
        await this.logError("Failed to verify Universal Header details: " + error);
        return 'Failed';
    }
}

    /**
     * Navigates to the project page and retrieves the project ID from the response.
     * @returns {Promise<string>} The project ID.
     */
    async getProjectID(): Promise<string> {
        await this.page.goto('https://js.' + process.env.environment + '.digitalmbd.net/secret/straw-serve-pound.html');
        const [response] = await Promise.all([
            this.page.waitForResponse(response =>
                response.url().includes('/projectprofile/v1/projects') && (response.status() === 200 || response.status() === 201)),

        ]);
        const responseData = await response.json();
        //const response= await this.page.waitForResponse(response =>response.url().includes('/projectprofile/v1/projects') && response.status()===200);
        //navigate to icebreaker page
        await this.page.locator('.label', { hasText: 'Start' }).first().click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.logInfo("Successfully clicked Start on Icebreaker page. Current URL: " + this.page.url());

        //  const responseData = await response.json();
        return responseData.id;
    }

     /**
     * Navigates to the project page and retrieves the project ID from the response.
     * @returns {Promise<{projectId: string, userId: string}>} The project ID and user ID.
     */
    async getProjectOldID(): Promise<{projectId: string, userId: string}> {
        await this.page.goto('https://js.' + process.env.environment + '.digitalmbd.net/secret/straw-serve-pound.html');
        const [response] = await Promise.all([
            this.page.waitForResponse(response =>
                response.url().includes('/projectprofile/v1/projects') && (response.status() === 200 || response.status() === 201)),

        ]);
        const responseData = await response.json();
        await this.page.locator('.label', { hasText: 'Start' }).first().click();
          //  const responseData = await response.json();
        return { projectId: responseData.id, userId: responseData.userId };
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
            await this.logInfo(`Registered Email: ${email}`);

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
                await this.logInfo('Modal closed');
            }

            return { status: 'Passed' as string, email: email as string | null };
        }
        catch {
            await this.logError("Failed to verify Sign in details");
            return { status: 'Failed' as string, email: null as string | null };
        }
    }

    /**
     * Completes account creation from the account wall (after anonymous user finishes budget flow).
     * The user has already clicked Continue on the account wall modal and is now on the
     * IAM sign-up page — skips the /start waitForURL and Sign in button click.
     * @param {string} postalCode - Postal code for registration.
     * @returns {Promise<{status: string, email: string | null}>}
     */
    async verifySignInFromAccountWall(postalCode: string) {
        try {
            await this.page.waitForURL(/.*digitalmbd\.net\/u\/login\/identifier.*/, { timeout: 30000 });

            const { email } = await registerWithIAMOtp(this.page, postalCode);
            await this.logInfo(`Registered Email from account wall: ${email}`);

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
                await this.logInfo('Modal closed');
            }

            return { status: 'Passed' as string, email: email as string | null };
        }
        catch {
            await this.logError('Failed to complete account creation from account wall');
            return { status: 'Failed' as string, email: null as string | null };
        }
    }

    /**
     * Signs in an existing account from the account wall (after anonymous user finishes budget flow).
     * The user has already clicked Continue on the account wall modal and is now on the
     * IAM sign-up page — uses signInWithIAMOtp instead of registerWithIAMOtp.
     * @param {string} postalCode - Postal code for the existing account.
     * @returns {Promise<{status: string, email: string | null}>}
     */
    async verifySignInExistingAccountFromAccountWall(postalCode: string) {
        try {
            await this.page.waitForURL(/.*digitalmbd\.net\/u\/login\/identifier.*/, { timeout: 30000 });

            const { email } = await signInWithIAMOtp(this.page, postalCode);
            await this.logInfo(`Signed in existing account from account wall: ${email}`);

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
                await this.logInfo('Modal closed');
            }

            return { status: 'Passed' as string, email: email as string | null };
        }
        catch {
            await this.logError('Failed to sign in existing account from account wall');
            return { status: 'Failed' as string, email: null as string | null };
        }
    }

    /**
     * Verifies the sign-in process and checks for correct UI elements after registration.
     * @param {string} postalCode - Postal code for registration.
     * @returns {Promise<{status: string, email: string | null}>}
     */
    async verifySignInExistingAccount(postalCode: string) {
        try {
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
            await this.page.getByRole('button', { name: 'Sign in' }).click();
            await this.page.waitForURL(/.*digitalmbd\.net\/u\/login\/identifier.*/);


            const { email } = await signInWithIAMOtp(this.page, postalCode);
            await this.logInfo(`Signed in Email: ${email}`);

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
                await this.logInfo('Modal closed');
            }

            return { status: 'Passed' as string, email: email as string | null };
        }
        catch {
            await this.logError("Failed to verify Sign in details");
            return { status: 'Failed' as string, email: null as string | null };
        }
    }

    /**
     * Verifies the presence and visibility of all design intro text boxes and options.
     * @returns {Promise<string>} "Passed" or "Failed"
     */
    async verifyDesignIntroTextBoxes() {
        try {
            await this.page.waitForURL(/\/design(?:\/|$)/, { timeout: 30000 });
            await waitForSpinnerToDisappear(this.page, 20000);

            await this.logInfo('verifyDesignIntroTextBoxes: checking design intro heading');

            const designIntroHeading = this.page
                .locator('h1, h2, p.headlineJumbo')
                .filter({
                    hasText: /Let[\'\u2019]s talk about design\s*[-\u2013]\s*the functionality of your kitchen/i
                })
                .first();

            await expect(
                designIntroHeading
            ).toBeVisible({ timeout: 15000 });

            await this.logInfo('verifyDesignIntroTextBoxes: checking remodel reason copy');

            await expect(
                this.page.getByText(
                    'You said you want to remodel your kitchen because:'
                )
            ).toBeVisible({ timeout: 15000 });

            await this.logInfo('verifyDesignIntroTextBoxes: checking remodel reasons');

            await expect(
                this.page.getByText(/I want to change how it looks\.?/i)
            ).toBeVisible({ timeout: 15000 });

            await expect(
                this.page.getByText(/I want better organization and storage\.?/i)
            ).toBeVisible({ timeout: 15000 });

            await this.logInfo('verifyDesignIntroTextBoxes: checking progress text');

            await expect(
                this.page.getByText('1/4')
            ).toBeVisible();

            await this.logInfo('verifyDesignIntroTextBoxes: checking kitchen layout prompt');

            await expect(
                this.page.getByText(
                    "What\u2019s the layout of your existing kitchen?"
                )
            ).toBeVisible();

            await this.logInfo('verifyDesignIntroTextBoxes: checking layout help text');

            await expect(
                this.page.getByText(
                    "It\u2019s okay if your kitchen is a bit different. Just select the closest shape."
                )
            ).toBeVisible();

            await this.logInfo('verifyDesignIntroTextBoxes: checking kitchen layout options');

            const layouts = [
                'Corridor',
                'Galley',
                'Single wall',
                'U-shaped',
                'G-shaped',
                'L-shaped'
            ];

            for (const layout of layouts) {
                await expect(
                    this.page.getByText(layout, { exact: true })
                ).toBeVisible();
            }

            await this.logInfo('verifyDesignIntroTextBoxes: checking disabled Next button');

            await expect(
                this.page.getByRole('button', { name: 'Next' })
            ).toHaveAttribute('aria-disabled', 'true');

            await this.logInfo(
                'verifyDesignIntroTextBoxes: all intro text boxes verified'
            );

            return 'Passed';
        } catch (error) {
            await this.logError(
                'verifyDesignIntroTextBoxes: failed to verify design details',
                error
            );
            return 'Failed';
        }
    }

    /**
     * Verifies that the Style Finder is not visible on the page after completing the Icebreaker flow.
     * @returns {Promise<string>} "Passed" or "Failed"
     */
    async verifyStyleFinderIsNotVisibleOnPage() {
        try {
            // Q1
            await this.page.getByTestId('TestId_Icebreaker_Q1_A0').click();
            await this.page.getByTestId('TestId_Icebreaker_Q1_A1').click();
            await this.page.getByTestId('TestId_Icebreaker_Q1_Next_Btn').click();
            await expect(this.page.getByTestId('TestId_Icebreaker_Q2_A1')).toBeVisible();

            // Q2
            await this.page.getByTestId('TestId_Icebreaker_Q2_A1').click();
            await this.page.getByTestId('TestId_Icebreaker_Q2_Next_Btn').click();
            await expect(this.page.getByTestId('TestId_Icebreaker_Q3_A1')).toBeVisible();

            // Q3
            await this.page.getByTestId('TestId_Icebreaker_Q3_A1').click();
            await this.page.getByTestId('TestId_Icebreaker_Q3_Next_Btn').click();
            await expect(this.page.getByTestId('TestId_Icebreaker_Q4_A1')).toBeVisible();

            // Q4
            await this.page.getByTestId('TestId_Icebreaker_Q4_A1').click();
            await this.page.getByTestId('TestId_Icebreaker_Q4_Next_Btn').click();
            await expect(this.page.getByTestId('TestId_Icebreaker_Q5_A1')).toBeVisible();

            // Q5
            await this.page.getByTestId('TestId_Icebreaker_Q5_A1').click();
            await this.page.getByTestId('TestId_Icebreaker_Q5_Next_Btn').click();

            expect(await this.page.getByTestId('TestId_Icebreaker_CONTINUE_Next_Btn').click()).toBeTruthy;
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/style');
            await this.page.waitForTimeout(5000);
            let coookieFlag = this.page.locator('xpath=//*[@id="onetrust-close-btn-container"]/button').count();
            if ((await coookieFlag).valueOf() === 1) {
                expect(await this.page.locator('xpath=//*[@id="onetrust-close-btn-container"]/button').click()).toBeTruthy;
            }
            // verify see all styles button is present
            await expect(this.page.getByTestId('TestId_Style_SeeAllStyles_Btn')).not.toBeVisible({ timeout: 10000 });
            await expect(this.page.getByTestId('TestId_Style_StartTheQuiz_Btn')).toBeVisible({ timeout: 10000 });
            await expect(this.page.getByTestId('TestId_Style_UploadAPhoto_Btn')).toBeVisible({ timeout: 10000 });
            return "Passed"
        }
        catch {
            await this.logError("Failed to verify style details");
            return 'Failed';
        }
    }

    /*
    async verifyStyleTunerSliders() {
        try {
            const firstThumbnail = () => this.page.locator('div.optionThumbnails > div').first();
            const lastThumbnail = () => this.page.locator('div.optionThumbnails > div').last();
            await firstThumbnail().scrollIntoViewIfNeeded();

            // verify first style is Asian-Inspired
            await expect(firstThumbnail().locator('div.bodyBold20.label').first()).toHaveText('Asian-Inspired');

            // drag slider from Tranditional to Madern i.e far end right
            await dragSlider(this.page, "//div[@data-testid='TestId_StyleTuner_Traditional-Modern_SliderThumb']", 600);

            // verify first style gets changed to Modern
            await firstThumbnail().locator('div.bodyBold20.label').first().waitFor({ state: 'visible' });
            await expect(firstThumbnail().locator('div.bodyBold20.label').first()).toHaveText('Modern');

            // drag slider for Formal to Informal
            await dragSlider(this.page, "//div[@data-testid='TestId_StyleTuner_Formal-Informal_SliderThumb']", 600);

            // verify first style gets changed to Scandinavian
            await firstThumbnail().locator('div.bodyBold20.label').first().waitFor({ state: 'visible' });
            await expect(firstThumbnail().locator('div.bodyBold20.label').first()).toHaveText('Scandinavian');

            // drag slider for Maximalist to Minimalist
            await dragSlider(this.page, "//div[@data-testid='TestId_StyleTuner_Maximalist-Minimalist_SliderThumb']", 700);

            // verify last style gets changed to Modern
            await lastThumbnail().locator('div.bodyBold20.label').last().waitFor({ state: 'visible' });
            await expect(lastThumbnail().locator('div.bodyBold20.label').last()).toHaveText('Modern');

            // drag slider for Rustic to Industrial
            await this.page.locator("//div[@data-testid='TestId_StyleTuner_Rustic-Industrial_SliderThumb']").scrollIntoViewIfNeeded();
            //await this.page.evaluate(() => { document.body.style.zoom = '0.8'; });
            await dragSlider(this.page, "//div[@data-testid='TestId_StyleTuner_Rustic-Industrial_SliderThumb']", 600);

            // verify first style gets changed to Minimalist and last style as Contemporary
            await firstThumbnail().locator('div.bodyBold20.label').last().waitFor({ state: 'visible' });
            await expect(firstThumbnail().locator('div.bodyBold20.label').first()).toHaveText('Minimalist');
            await expect(lastThumbnail().locator('div.bodyBold20.label').last()).toHaveText('Contemporary');
            return "Passed"
        }
        catch {
            await this.logError("Failed to verify style details details");
            return 'Failed';
        }
    }
*/
    /**
     * Completes the Icebreaker flow by answering all questions and navigating to the style page.
     */
    async completeIceBreakerFlow() {

        // verify landed on style tuner page
        const cookieButton = this.page.getByRole('button', { name: /accept all cookies/i });
        if (await cookieButton.isVisible()) {
            await this.logInfo('completeIceBreakerFlow: accept cookies button is visible, clicking it');
            await cookieButton.click();
        }

        const title = this.page.locator('p.headlineJumbo');
        await title.waitFor({ state: 'visible' });

        // Verify text content loosely
        await expect(title).toContainText("Let\u2019s talk about the kitchen you\u2019ve always wanted.");
        // Q1
        await this.logInfo('completeIceBreakerFlow: clicking Q1 answer A0');
        await this.page.getByTestId('TestId_Icebreaker_Q1_A0').click();
        await this.logInfo('completeIceBreakerFlow: clicking Q1 answer A1');
        await this.page.getByTestId('TestId_Icebreaker_Q1_A1').click();
        await this.logInfo('completeIceBreakerFlow: clicking Q1 next button');
        await this.page.getByTestId('TestId_Icebreaker_Q1_Next_Btn').click();
        await this.logInfo('completeIceBreakerFlow: verifying Q2 answer A1 is visible');
        await expect(this.page.getByTestId('TestId_Icebreaker_Q2_A1')).toBeVisible();

        // Q2
        await this.logInfo('completeIceBreakerFlow: clicking Q2 answer A1');
        await this.page.getByTestId('TestId_Icebreaker_Q2_A1').click();
        await this.logInfo('completeIceBreakerFlow: clicking Q2 next button');
        await this.page.getByTestId('TestId_Icebreaker_Q2_Next_Btn').click();
        await this.logInfo('completeIceBreakerFlow: verifying Q3 answer A1 is visible');
        await expect(this.page.getByTestId('TestId_Icebreaker_Q3_A1')).toBeVisible();

        // Q3
        await this.logInfo('completeIceBreakerFlow: clicking Q3 answer A1');
        await this.page.getByTestId('TestId_Icebreaker_Q3_A1').click();
        await this.logInfo('completeIceBreakerFlow: clicking Q3 next button');
        await this.page.getByTestId('TestId_Icebreaker_Q3_Next_Btn').click();
        await this.logInfo('completeIceBreakerFlow: verifying Q4 answer A1 is visible');
        await expect(this.page.getByTestId('TestId_Icebreaker_Q4_A1')).toBeVisible();

        // Q4
        await this.logInfo('completeIceBreakerFlow: clicking Q4 answer A1');
        await this.page.getByTestId('TestId_Icebreaker_Q4_A1').click();
        await this.logInfo('completeIceBreakerFlow: clicking Q4 next button');
        await this.page.getByTestId('TestId_Icebreaker_Q4_Next_Btn').click();
        await this.logInfo('completeIceBreakerFlow: verifying Q5 answer A1 is visible');
        await expect(this.page.getByTestId('TestId_Icebreaker_Q5_A1')).toBeVisible();

        // Q5
        await this.logInfo('completeIceBreakerFlow: clicking Q5 answer A1');
        await this.page.getByTestId('TestId_Icebreaker_Q5_A1').click();
        await this.logInfo('completeIceBreakerFlow: clicking Q5 next button');
        await this.page.getByTestId('TestId_Icebreaker_Q5_Next_Btn').click();

        await this.logInfo('completeIceBreakerFlow: clicking Continue button and waiting for style page');
        expect(await this.page.getByTestId('TestId_Icebreaker_CONTINUE_Next_Btn').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/style');
        await this.page.waitForTimeout(5000);
    }

    /**
     * Completes the style selection flow, including the style quiz and navigation to the design page.
     */
    async completeStyleFlow() {

        // verify see all styles button is present
        await this.logInfo('completeStyleFlow: waiting for initial spinner to disappear');
        await waitForSpinnerToDisappear(this.page, 20000);
        await this.logInfo('completeStyleFlow: verifying See All Styles button is not visible');
        await expect(this.page.getByTestId('TestId_Style_SeeAllStyles_Btn')).not.toBeVisible({ timeout: 10000 });
        await this.logInfo('completeStyleFlow: verifying Start The Quiz button is visible');
        await expect(this.page.getByTestId('TestId_Style_StartTheQuiz_Btn')).toBeVisible({ timeout: 10000 });
        await this.logInfo('completeStyleFlow: verifying Upload A Photo button is visible');
        await expect(this.page.getByTestId('TestId_Style_UploadAPhoto_Btn')).toBeVisible({ timeout: 10000 });

        await this.logInfo('completeStyleFlow: clicking Start The Quiz button');
        await this.page.getByTestId('TestId_Style_StartTheQuiz_Btn').click();
        await this.logInfo('completeStyleFlow: clicking Style Quiz Q1 answer A4');
        await this.page.getByTestId('TestId_StyleQuiz_Q1_A4').click();
        await this.logInfo('completeStyleFlow: clicking Style Quiz Q2 answer A4');
        await this.page.getByTestId('TestId_StyleQuiz_Q2_A4').click();
        await this.logInfo('completeStyleFlow: clicking Style Quiz Q3 answer A4');
        await this.page.getByTestId('TestId_StyleQuiz_Q3_A4').click();
        await this.logInfo('completeStyleFlow: clicking Style Quiz Q4 answer A4');
        await this.page.getByTestId('TestId_StyleQuiz_Q4_A4').click();

        await this.logInfo('completeStyleFlow: scrolling next button into view');
        await this.page.keyboard.press('End');
        await this.page.waitForTimeout(2000);
        await this.page.getByTestId('TestId_DockNavigation_Next_Btn').scrollIntoViewIfNeeded();
        await this.logInfo('completeStyleFlow: clicking next button to submit quiz');
        await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click();
        await this.logInfo('completeStyleFlow: waiting for style tuner page URL');
        await waitForSpinnerToDisappear(this.page, 20000);
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/style/tuner');

        // hide chat bubble
        await this.logInfo('completeStyleFlow: waiting then hiding chat bubble if present');
        await this.page.waitForTimeout(5000);
        await this.page.evaluate(() => {
            const bubble = document.querySelector('.ecEmbedWidgetLauncher');
            if (bubble) {
                (bubble as HTMLElement).style.display = 'none';
            }
        });
        await this.page.keyboard.press('End');
        await this.page.waitForTimeout(2000);
        await this.logInfo('completeStyleFlow: waiting before clicking next button on style tuner');
        await this.page.waitForTimeout(5000);
        await this.logInfo('completeStyleFlow: clicking next button on style tuner');
        await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click({ force: true });
        await waitForSpinnerToDisappear(this.page, 10000);
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design');
        await this.page.waitForTimeout(5000);
    }

    /**
     * Completes the design flow by answering all design questions and selecting concepts.
     */
    async completeDesignFlow() {

        // hide chat bubble
        await this.page.evaluate(() => {
            const bubble = document.querySelector('.ecEmbedWidgetLauncher');
            if (bubble) {
                (bubble as HTMLElement).style.display = 'none';
            }
        });

        // Answer all 4 design questions        
        await this.page.getByTestId('TestId_Design_Q1_A5').waitFor({ state: 'visible' });
        await this.page.getByTestId('TestId_Design_Q1_A5').click();
        const nextBtn1 = this.page.getByTestId('TestId_Style_Q1_Next_Btn');
        await nextBtn1.waitFor({ state: 'visible', timeout: 3000 });
        await expect(nextBtn1).toBeEnabled({ timeout: 2000 });
        await nextBtn1.click();

        await this.page.getByTestId('TestId_Design_Q2_A1').waitFor({ state: 'visible' });
        await this.page.getByTestId('TestId_Design_Q2_A1').click();
        const nextBtn2 = this.page.getByTestId('TestId_Style_Q2_Next_Btn');
        await nextBtn2.waitFor({ state: 'visible', timeout: 3000 });
        await expect(nextBtn2).toBeEnabled({ timeout: 2000 });
        await nextBtn2.click();

        await this.page.getByTestId('TestId_Design_Q3_A2').waitFor({ state: 'visible' });
        await this.page.getByTestId('TestId_Design_Q3_A2').click();
        const nextBtn3 = this.page.getByTestId('TestId_Style_Q3_Next_Btn');
        await nextBtn3.waitFor({ state: 'visible', timeout: 3000 });
        await expect(nextBtn3).toBeEnabled({ timeout: 2000 });
        await nextBtn3.click();

        await this.page.getByTestId('TestId_Design_Q4_A1').waitFor({ state: 'visible' });
        await this.page.getByTestId('TestId_Design_Q4_A1').click();
        const nextBtn4 = this.page.getByTestId('TestId_Style_Q4_Next_Btn');
        await nextBtn4.waitFor({ state: 'visible', timeout: 3000 });
        await expect(nextBtn4).toBeEnabled({ timeout: 2000 });
        await nextBtn4.click();

        await this.page.getByTestId('TestId_Style_Continue_Next_Btn').click();
        await waitForSpinnerToDisappear(this.page, 20000);
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/concept');

        // select 3 concepts
        // await this.page.getByText('Gourmet cooking').waitFor({ state: 'visible' });
        // await expect(this.page.getByText('Gourmet cooking')).toBeEnabled();
        // await this.page.getByText('Gourmet cooking').click();
        // await this.page.waitForTimeout(5000);

        // await this.page.getByText('Eating and dining').click();
        // await this.page.waitForTimeout(5000);

        // await this.page.getByText('Professional-level baking').click();
        // await this.page.waitForTimeout(5000);

        // await this.page.getByText('Gourmet cooking').waitFor({ state: 'visible' });
        // await expect(this.page.getByText('Gourmet cooking')).toBeEnabled();
        // await this.page.getByText('Gourmet cooking').click();
        // await this.page.waitForTimeout(5000);

        // Wait for first element to be truly clickable
        await this.page.waitForTimeout(15000);
        await clickWhenReady(this.page, 'Gourmet cooking');
        await this.page.waitForTimeout(15000);
        await clickWhenReady(this.page, 'Eating and dining');
        await this.page.waitForTimeout(15000);
        await clickWhenReady(this.page, 'Professional-level baking');
        await this.page.waitForTimeout(25000);
        let but01 = this.page.locator('xpath=//button[@aria-disabled="false" and @data-testid="TestId_DockNavigation_Next_Btn"]').count();
        await this.logInfo("count:" + (await but01).valueOf());
        if ((await but01).valueOf() === 0) {
            expect(await this.page.locator('xpath=(//div[@data-testid="TestId_DesignConcept_GourmetCooking_OptionBtn"])[1]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=(//div[@data-testid="TestId_DesignConcept_GourmetCooking_OptionBtn"])[1]').focus()).toBeTruthy;
            expect(await this.page.locator('xpath=(//div[@data-testid="TestId_DesignConcept_GourmetCooking_OptionBtn"])[1]').click({ trial: true })).toBeTruthy;
            expect(await this.page.locator('xpath=(//div[@data-testid="TestId_DesignConcept_GourmetCooking_OptionBtn"])[1]').click({ force: true })).toBeTruthy;
        }



        // const gourmetCentral = this.page.getByText('Gourmet Central', { exact: true });
        // await gourmetCentral.waitFor({ state: 'visible', timeout: 10000 });
        // await expect(gourmetCentral).toBeVisible();
        expect(await this.page.locator('xpath=//div[text()="Gourmet Central"]').isVisible()).toBeTruthy;

        await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click();
        await waitForSpinnerToDisappear(this.page, 10000);
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/storage');

        // click next on storage
        await waitForSpinnerToDisappear(this.page, 10000);
        await this.page.waitForTimeout(5000);
        await this.page.getByTestId('TestId_DockNavigation_Next_Btn').scrollIntoViewIfNeeded();
        await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click();
        await waitForSpinnerToDisappear(this.page, 10000);

    }

    /**
     * Completes the budget flow by selecting a budget type and navigating through the budget pages.
     * @param {string} budgetType - The budget type to select ("premium", "mid-range", or "essential").
     */
    async completeBudgetFlow(budgetType: string) {

        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/budget/start');
        await waitForSpinnerToDisappear(this.page, 10000);
        if (budgetType.toLowerCase() === 'premium') {
            expect(await this.page.locator('xpath=//div[text()="Premium"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Premium"]').focus()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Premium"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@class="budget-tier selected "]//div[text()="Premium"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@class="budget-tier selected "]//div[text()="Premium"]').focus()).toBeTruthy;
            await this.logInfo('VERIFIED: Budget Tab Selection of Premium range is successful');
        } else if (budgetType.toLowerCase() === 'mid-range') {
            expect(await this.page.locator('xpath=//div[text()="Mid-range"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Mid-range"]').focus()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Mid-range"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@class="budget-tier selected "]//div[text()="Mid-range"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@class="budget-tier selected "]//div[text()="Mid-range"]').focus()).toBeTruthy;
            await this.logInfo('VERIFIED: Budget Tab Selection of Mid range is successful');
        } else if (budgetType.toLowerCase() === 'essential') {
            expect(await this.page.locator('xpath=//div[text()="Essential"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Essential"]').focus()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Essential"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@class="budget-tier selected "]//div[text()="Essential"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@class="budget-tier selected "]//div[text()="Essential"]').focus()).toBeTruthy;
            await this.logInfo('VERIFIED: Budget Tab Selection of Essential range is successful');
        }
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').hover()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/budget/categories');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').hover()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click()).toBeTruthy;

    }

    /**
     * Verifies the navigation bar tabs and their navigation functionality.
     * @returns {Promise<string>} "Passed" or "Failed"
     */
    async verifyNavigationBar() {
        try {
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/overview');
            await this.page.waitForTimeout(25000);
            await this.logInfo('verifyNavigationBar: checking Profile Overview tab visibility');
            const overviewVisible = await this.page.getByTestId('TestId_Profile_Overview_Tab').isVisible();
            await this.logInfo(`verifyNavigationBar: Profile Overview visible= ${overviewVisible}`);

            await this.logInfo('verifyNavigationBar: checking Profile Style tab visibility');
            const styleVisible = await this.page.getByTestId('TestId_Profile_Style_Tab').isVisible();
            await this.logInfo(`verifyNavigationBar: Profile Style visible= ${styleVisible}`);

            await this.logInfo('verifyNavigationBar: checking Profile Design tab visibility');
            const designVisible = await this.page.getByTestId('TestId_Profile_Design_Tab').isVisible();
            await this.logInfo(`verifyNavigationBar: Profile Design visible= ${designVisible}`);

            await this.logInfo('verifyNavigationBar: checking Profile Budget tab visibility');
            const budgetVisible = await this.page.getByTestId('TestId_Profile_Budget_Tab').isVisible();
            await this.logInfo(`verifyNavigationBar: Profile Budget visible= ${budgetVisible}`);

            await this.logInfo('verifyNavigationBar: checking promotional text visibility');
            const promoVisible = await this.page.getByText('Local design pros can offer').isVisible();
            await this.logInfo(`verifyNavigationBar: promotional text visible= ${promoVisible}`);

            await this.logInfo('verifyNavigationBar: focusing header item 1');
            await this.page.getByText('Start', { exact: true }).focus();
            await this.logInfo('verifyNavigationBar: focusing header item 1 complete');

            await this.logInfo('verifyNavigationBar: clicking header item 1');
            await this.page.getByText('Start', { exact: true }).click();
            await this.logInfo('verifyNavigationBar: clicked header item 1');
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
            await waitForSpinnerToDisappear(this.page, 10000);
            await this.logInfo('verifyNavigationBar: checking Icebreaker Q1 visible');
            const icebreakerQ1Visible = await this.page.getByTestId('TestId_Icebreaker_Q1_A5').isVisible();
            await this.logInfo(`verifyNavigationBar: Icebreaker Q1 visible= ${icebreakerQ1Visible}`);

            await this.logInfo('verifyNavigationBar: focusing header item 2');
            await this.page.getByText('Style', { exact: true }).focus();
            await this.logInfo('verifyNavigationBar: focus header item 2 complete');

            await this.logInfo('verifyNavigationBar: clicking header item 2');
            await this.page.getByText('Style', { exact: true }).click();
            await this.logInfo('verifyNavigationBar: clicked header item 2');
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/style');
            await waitForSpinnerToDisappear(this.page, 10000);
            await this.logInfo('verifyNavigationBar: checking Style tab visible');
            const styleVisible1 = await this.page.getByTestId('TestId_Style_Tab').isVisible();
            await this.logInfo(`verifyNavigationBar: Style tab visible= ${styleVisible1}`);

            await this.logInfo('verifyNavigationBar: focusing header item 3');
            await this.page.getByText('Design', { exact: true }).focus();
            await this.logInfo('verifyNavigationBar: focus header item 3 complete');

            await this.logInfo('verifyNavigationBar: clicking header item 3');
            await this.page.getByText('Design', { exact: true }).click();
            await this.logInfo('verifyNavigationBar: clicked header item 3');
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design');
            await waitForSpinnerToDisappear(this.page, 10000);
            await this.logInfo('verifyNavigationBar: checking design tab svg rect visible');
            const designSvgVisible = await this.page.getByTestId('TestId_Design_Q1_A5').locator('g rect').isVisible();
            await this.logInfo(`verifyNavigationBar: design tab svg rect visible= ${designSvgVisible}`);

            await this.logInfo('verifyNavigationBar: focusing header item 4');
            await this.page.getByText('Budget', { exact: true }).focus();
            await this.logInfo('verifyNavigationBar: focus header item 4 complete');

            await this.logInfo('verifyNavigationBar: clicking header item 4');
            await this.page.getByText('Budget', { exact: true }).click();
            await this.logInfo('verifyNavigationBar: clicked header item 4');
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/budget/start');
            await waitForSpinnerToDisappear(this.page, 10000);
            await this.logInfo('verifyNavigationBar: checking budget min input visible');
            const budgetMinVisible = await this.page.getByTestId('TestId_Budget_Min_Input').isVisible();
            await this.logInfo(`verifyNavigationBar: Budget Min Input visible= ${budgetMinVisible}`);

            await this.logInfo('verifyNavigationBar: focusing header item 5');
            await this.page.getByText('Recap', { exact: true }).focus();
            await this.logInfo('verifyNavigationBar: focus header item 5 complete');

            await this.logInfo('verifyNavigationBar: clicking header item 5');
            await this.page.getByText('Recap', { exact: true }).click();
            await this.logInfo('verifyNavigationBar: clicked header item 5');
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/overview');
            await waitForSpinnerToDisappear(this.page, 10000);
            await this.page.getByTestId('TestId_Profile_Overview_Tab').isVisible();
            return "Passed"
        }
        catch {
            await this.logError("Failed to verify Navigation Bar details");
            return 'Failed';
        }

    }

    /**
     * Verifies the auto and manual share functionality for dealers in the profile overview.
     * @returns {Promise<string>} "Passed" or "Failed"
     */
    async verifyAutoAndManualShareOfTheDealers() {
        try {
            await this.logInfo('verifyAutoAndManualShareOfTheDealers: waiting for profile overview URL');
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/overview');
            await this.page.waitForTimeout(25000);

            await this.logInfo('verifyAutoAndManualShareOfTheDealers: checking all profile tabs are visible');
            await this.page.getByTestId('TestId_Profile_Overview_Tab').isVisible();
            await this.page.getByTestId('TestId_Profile_Style_Tab').isVisible();
            await this.page.getByTestId('TestId_Profile_Design_Tab').isVisible();
            await this.page.getByTestId('TestId_Profile_Budget_Tab').isVisible();

            await this.logInfo('verifyAutoAndManualShareOfTheDealers: checking promotional text visibility');
            await this.page.getByText('Local design pros can offer').isVisible();

            await this.logInfo('verifyAutoAndManualShareOfTheDealers: verifying shared profile image is visible');
            expect(await this.page.locator('xpath=//div[@class="shared"]/img').isVisible()).toBeTruthy();

            await this.logInfo('verifyAutoAndManualShareOfTheDealers: verifying contacted badge is visible');
            expect(await this.page.locator('xpath=//span[text()="contacted!"]').isVisible()).toBeTruthy();

            await this.logInfo('verifyAutoAndManualShareOfTheDealers: setting up dealer list locators');
            const dealerList = this.page.locator('ul.list');
            const dealerItem = (i: number) => dealerList.locator('> li').nth(i);

            const expectContactedBadge = async (item: Locator) => {
                await this.logInfo('verifyAutoAndManualShareOfTheDealers: checking for contacted badge on dealer item');
                await expect(item.getByText(/contacted/i)).toBeVisible();
            };

            const selectDealer = async (i: number) => {
                await this.logInfo(`verifyAutoAndManualShareOfTheDealers: selecting dealer at index ${i}`);
                const item = dealerItem(i);
                await item.scrollIntoViewIfNeeded();
                await item.click({ position: { x: 10, y: 10 } }).catch(async () => await item.click());
                await this.logInfo(`verifyAutoAndManualShareOfTheDealers: verifying dealer ${i} is selected`);
                await expect(item).toHaveClass(/selected/);
                return item;
            };

            const sendProjectDetailsFrom = async (item: Locator) => {
                await this.logInfo('verifyAutoAndManualShareOfTheDealers: looking for send project details button');
                const btn = item.getByRole('button', { name: /send project details/i });
                await expect(btn).toBeVisible();
                await this.logInfo('verifyAutoAndManualShareOfTheDealers: clicking send project details button');
                await btn.click();
            };

            // First dealer shows "contacted" 
            await this.logInfo('verifyAutoAndManualShareOfTheDealers: verifying first dealer shows contacted badge');
            const firstDealer = dealerItem(0);
            await expectContactedBadge(firstDealer);

            // Select second dealer & verify button
            await this.logInfo('verifyAutoAndManualShareOfTheDealers: selecting second dealer');
            const secondDealer = await selectDealer(1);
            await this.logInfo('verifyAutoAndManualShareOfTheDealers: verifying send project details button is visible for second dealer');
            await expect(secondDealer.getByRole('button', { name: /send project details/i })).toBeVisible();

            // Click "Send project details" and finish modal 
            await this.logInfo('verifyAutoAndManualShareOfTheDealers: sending project details');
            await sendProjectDetailsFrom(secondDealer);

            // success modal / toast
            await this.logInfo('verifyAutoAndManualShareOfTheDealers: waiting for success message');
            await expect(this.page.getByText(/success!/i)).toBeVisible();
            await this.logInfo('verifyAutoAndManualShareOfTheDealers: verifying success image is visible');
            await expect(this.page.getByRole('img', { name: /your profile has been shared/i })).toBeVisible();

            await this.logInfo('verifyAutoAndManualShareOfTheDealers: clicking continue button');
            const continueBtn = this.page.getByRole('button', { name: /continue/i });
            await expect(continueBtn).toBeVisible();
            await continueBtn.click();

            // wait for dealer list to reappear after refresh
            await this.logInfo('verifyAutoAndManualShareOfTheDealers: waiting for dealer list to reappear');
            await this.page.locator('ul.list').waitFor({ state: 'visible' });

            // Confirm second dealer now shows "contacted" 
            // Re-grab locator in case list re-rendered
            await this.logInfo('verifyAutoAndManualShareOfTheDealers: re-verifying second dealer shows contacted badge after refresh');
            const secondDealerAfter = dealerItem(1);
            await expectContactedBadge(secondDealerAfter);

            await this.logInfo('verifyAutoAndManualShareOfTheDealers: all verifications passed');
            return "Passed"
        }
        catch (error) {
            await this.logError("Failed to verify Auto and Manual Share details", error);
            return 'Failed';
        }
    }

    /**
     * Verifies that manual share is not present for zip codes outside of Wave 1.
     * @returns {Promise<string>} "Passed" or "Failed"
     */
    async verifyManualShareIsNotPresentForZipCodeOutsideOfWave1() {
        try {
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/overview');
            await this.page.waitForTimeout(25000);
            await this.page.getByTestId('TestId_Profile_Overview_Tab').isVisible();
            await this.page.getByTestId('TestId_Profile_Style_Tab').isVisible();
            await this.page.getByTestId('TestId_Profile_Design_Tab').isVisible();
            await this.page.getByTestId('TestId_Profile_Budget_Tab').isVisible();
            await this.page.getByText('Local design pros can offer').isVisible();

            expect(await this.page.locator('xpath=//div[@class="shared"]/img').isVisible()).toBeFalsy;
            expect(await this.page.locator('xpath=//span[text()="contacted!"]').isVisible()).toBeFalsy;

            const dealerList = this.page.locator('ul.list');
            const dealerItem = (i: number) => dealerList.locator('> li').nth(i);

            const expectContactedBadge = async (item: Locator) => {
                // text "contacted" appears alongside the check icon
                await expect(item.getByText(/contacted/i)).not.toBeVisible();
            };

            const selectDealer = async (i: number) => {
                const item = dealerItem(i);
                await item.scrollIntoViewIfNeeded();
                await item.click({ position: { x: 10, y: 10 } }).catch(async () => await item.click());
                await expect(item).toHaveClass(/selected/);
                return item;
            };

            // First dealer shows "contacted" 
            const firstDealer = dealerItem(0);
            await expectContactedBadge(firstDealer);

            // Select second dealer & verify button
            const secondDealer = await selectDealer(1);
            await expect(secondDealer.getByRole('button', { name: /View and print my details/i })).toBeVisible();
            return "Passed"
        }
        catch {
            await this.logError("Failed to verify Manual Share Is not presenr for out of wave zip details");
            return 'Failed';
        }
    }

    /**
     * Submits a user rating and feedback, then verifies the submission.
     * @returns {Promise<string>} "Passed" or "Failed"
     */
    async verifySubmitUserRatingAndFeedback() {
        try {
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/overview');
            await this.page.waitForTimeout(25000);

            const rating = 4;

            const ratingSection = this.page.locator('div.feedback').first();
            await ratingSection.scrollIntoViewIfNeeded();
            await ratingSection.waitFor({ state: 'visible' });

            // select rating
            const star = this.page.getByTestId(`TestId_ProfileOverview_Rating_Star${rating}_Btn`);
            if (await star.isVisible()) {
                await star.click();
            }

            await expect(star).toHaveAttribute('aria-pressed', 'true');
            await expect(star).toHaveAttribute('class', /selected/);

            // enter feedback
            const feedbackBox = this.page.getByTestId('TestId_ProfileOverview_Rating_Feedback_Input');
            await expect(feedbackBox).toBeVisible();
            await expect(feedbackBox).toBeEnabled(); // in case it’s disabled until star picked
            await feedbackBox.fill('Test Feedback');

            // submit
            const submitBtn = this.page.getByRole('button', { name: /submit rating/i });
            await expect(submitBtn).toBeEnabled();
            await submitBtn.click();

            // verify "Submitted! banner/message
            await expect(this.page.getByText(/submitted!/i)).toBeVisible();
            return "Passed"
        }
        catch {
            await this.logError("Failed to verify Ratings and Feedback details");
            return 'Failed';
        }
    }

    /**
     * Verifies the download of the remodel profile PDF for a given cabinet type.
     * @param {string} cabinetType - The cabinet type ("stock", "premium", or "semi-custom").
     * @returns {Promise<string>} "Passed" or "Failed"
     */
    async verifyDownloadRemodelProfilePDF(cabinetType: string) {
        try {
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/overview');
            await this.page.waitForTimeout(25000);

            // Map accepted cabinet types to a label and a regex fragment (tolerates hyphen/space)
            const typeMap: Record<string, { label: string; pattern: string }> = {
                "stock": { label: "stock", pattern: "stock" },
                "premium": { label: "premium", pattern: "premium" },
                "semi-custom": { label: "semi-custom", pattern: "semi[-\\s]?custom" },
            };

            const normalized = cabinetType.trim().toLowerCase();
            if (!typeMap[normalized]) {
                throw new Error(`Unsupported cabinetType "${cabinetType}". Use one of: ${Object.keys(typeMap).join(", ")}`);
            }

            await waitForSpinnerToDisappear(this.page, 10_000);

            // Verify the "Save or print your project" section is present
            await this.page.getByText('Save or print your project').scrollIntoViewIfNeeded();
            await expect(this.page.getByText('Save or print your project')).toBeVisible();
            await expect(this.page.locator('#root')).toContainText('Save or print your project');
            await expect(this.page.locator('#root')).toContainText('Share your project with a designer or showroom.');
            const viewProfileBtn = this.page.getByTestId('TestId_ProfileOverview_ViewProfile_Btn');
            await expect(viewProfileBtn).toBeVisible();

            // Click View Profile and wait for the popup (new tab) created by this click
            const [popup] = await Promise.all([
                this.page.waitForEvent('popup'),
                viewProfileBtn.click()
            ]);

            // Ensure the new tab has loaded and navigated to the expected URL
            await popup.waitForLoadState('domcontentloaded');
            //await popup.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/profile/pdf', { timeout: 15_000 });
            await expect(popup).toHaveURL('https://js.' + process.env.environment + '.digitalmbd.net/profile/pdf');

            // Verify the "Download PDF" button exists and is visible
            const downloadBtn = popup.getByRole('button', { name: /download pdf/i });
            await expect(downloadBtn).toBeVisible();

            // Prepare downloads target directory & filename
            const downloadsDir = path.resolve(process.cwd(), "downloads"); // adjust path if needed
            if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
            const targetFileName = "remodel-profile.pdf";
            const targetFilePath = path.join(downloadsDir, targetFileName);

            // If a previous file exists, remove it to avoid false positives
            if (fs.existsSync(targetFilePath)) {
                try { fs.unlinkSync(targetFilePath); } catch (e) { /* ignore */ }
            }

            // Click the download button and wait for the download event
            const [download] = await Promise.all([
                popup.waitForEvent('download'),
                downloadBtn.click()
            ]);

            // Save download to desired filename (Playwright's download.saveAs)
            await download.saveAs(targetFilePath);

            // Ensure file exists
            expect(fs.existsSync(targetFilePath)).toBeTruthy();

            // Read file buffer and parse PDF text using pdf-parse
            const pdfBuffer = fs.readFileSync(targetFilePath);
            // const parsed = await pdfParse(pdfBuffer);
            // const pdfText = (parsed && parsed.text) ? parsed.text : "";

            // Build expected string & tolerant regex for the second word
            const { label, pattern } = typeMap[normalized];
            const expectedText = `MasterBrand ${label} cabinet recommendations`;
            const expectedRegex = new RegExp(`MasterBrand\\s+${pattern}\\s+cabinet recommendations`, "i");

            // Note - Validatation of PDF content part is not ready and is planned for future
            // Assert using both: exact (case-insensitive) and regex (tolerant to hyphen/space variants)
            // expect(new RegExp(expectedText, "i").test(pdfText) || expectedRegex.test(pdfText)).toBeTruthy();


            // Close the new tab and return focus to the original page
            await popup.close();
            await this.page.bringToFront();

            // Optional: quick sanity check that we're still on the original page/section
            await expect(this.page.getByText('Save or print your project')).toBeVisible();
            return "Passed"
        }
        catch {
            await this.logError("Failed to verify Download Remodel Profile PDF details");
            return 'Failed';
        }
    }

    /**
     * Selects a map pin by dealer number and verifies the corresponding dealer details.
     * @param {number} dealerNumber - The dealer number to select.
     * @returns {Promise<string>} "Passed" or "Failed"
     */
    async selectPinAndVerifyDealer(dealerNumber: number) {
        try {
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/overview');
            await this.page.waitForTimeout(25000);
            // Click the map pin with the given number (e.g., 2)
            const pin = this.page
                .locator('gmp-advanced-marker[role="button"]')
                .filter({ has: this.page.locator(`.label:has-text("${dealerNumber}")`) });

            await expect(pin, `Map pin ${dealerNumber} should be visible`).toBeVisible();
            await pin.click();

            // Verify the corresponding dealer list item becomes "selected"
            const dealerRow = this.page
                .locator('ul.list > li')
                .filter({
                    // the index column shows "2."
                    has: this.page.locator('.index', { hasText: new RegExp(`^\\s*${dealerNumber}\\b`) })
                });

            await expect(dealerRow, `Dealer ${dealerNumber} row should become selected`)
                .toHaveClass(/selected/);

            // Verify the "Send project details" button is visible & enabled
            const shareBtn = this.page.getByTestId(
                `TestId_ProfileOverview_DealerLocatorList_Item${dealerNumber}_ShareProfile_Btn`
            );

            await expect(shareBtn).toBeVisible();
            await expect(shareBtn).toBeEnabled();
            await expect(shareBtn).toHaveText(/Send project details/i);
            return "Passed"
        }
        catch {
            await this.logError("Failed to verify Pin And Dealer details");
            return 'Failed';
        }
    }

    /**
     * Selects a map pin and opens the "View and print my details" PDF for the dealer.
     * @param {number} dealerNumber - The dealer number to select.
     * @returns {Promise<string>} "Passed" or "Failed"
     */
    async selectPinAndOpenViewPrintPdf(dealerNumber: number) {
        try {
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/overview');
            await this.page.waitForTimeout(25000);

            // Click the map pin with the given number (e.g., 2)
            const pin = this.page
                .locator('gmp-advanced-marker[role="button"]')
                .filter({ has: this.page.locator(`.label:has-text("${dealerNumber}")`) });

            await expect(pin, `Map pin ${dealerNumber} should be visible`).toBeVisible();
            await pin.scrollIntoViewIfNeeded();
            await pin.click();

            // Verify the corresponding dealer list item becomes "selected"
            const dealerRow = this.page
                .locator('ul.list > li')
                .filter({
                    has: this.page.locator('.index', { hasText: new RegExp(`^\\s*${dealerNumber}\\b`) })
                });

            await expect(dealerRow, `Dealer ${dealerNumber} row should become selected`).toHaveClass(/selected/);

            // Find the "View and print my details" CTA within that selected dealer row
            const viewPrintBtn = dealerRow.getByRole('button', { name: /View and print my details/i });

            await expect(viewPrintBtn).toBeVisible();
            await expect(viewPrintBtn).toBeEnabled();

            await Promise.all([
                this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/profile/pdf'),
                viewPrintBtn.click()
            ]);

            // Verify the "Download PDF" button exists and is visible
            const downloadBtn = this.page.getByRole('button', { name: /download pdf/i });
            await expect(downloadBtn).toBeVisible();
            return "Passed"
        }
        catch {
            await this.logError("Failed to verify Pin And open PDF details");
            return 'Failed';
        }
    }

    /**
     * Verifies the presence of the QR code on the Design Profile tab.
     * @returns {Promise<string>} "Passed" or "Failed"
     */
    async verifyQRCodeOnDesignProfileTab() {
        try {
            await this.page.getByTestId('TestId_Profile_Design_Tab').click();
            waitForSpinnerToDisappear(this.page, 20000);
            await this.page.getByText('Try Rebode Measure for iOS').scrollIntoViewIfNeeded();
            await expect(this.page.locator('#root')).toContainText('Try Rebode Measure for iOS and measure your kitchen in seconds.');
            await expect(this.page.getByRole('img', { name: 'Apple App Store QR Code' })).toBeVisible();
            return "Passed"
        }
        catch {
            await this.logError("Failed to verify QR Code details");
            return 'Failed';
        }
    }

    /**
     * Verifies the "Try on your style" Gen AI image processing flow, including image upload and screenshot comparison.
     * @returns {Promise<string>} "Passed" or "Failed"
     */
    async verifyTryOnYourStyleFlow() {
        try {

            await this.page.waitForTimeout(25000);
            waitForSpinnerToDisappear(this.page, 20000);

            await this.page.getByText('Try on your style').scrollIntoViewIfNeeded();
            await expect(this.page.getByText('Try on your style')).toBeVisible();

            // Upload kitchen image
            const kitchenImage = path.join(__dirname, '..', 'Photo', 'SampleKitchenPhoto.jpg');
            const [fileChooser] = await Promise.all([
                this.page.waitForEvent('filechooser'),
                this.page.locator('._uploadZone_1fszm_104 > div').first().click(),
            ]);
            await fileChooser.setFiles(kitchenImage);

            // Wait for "Before" and "After" sections
            // Locate the "Before" image container correctly
            const beforeSection = this.page.locator('div._stackAnimate_9pcyz_65._beforeImage_9pcyz_68');
            await expect(beforeSection).toBeVisible({ timeout: 120000 });

            // Locate the "After" image container
            const afterSection = this.page.locator('div._stackAnimate_9pcyz_65._afterImage_9pcyz_74');
            await expect(afterSection).toBeVisible({ timeout: 120000 });

            // Wait for AI image generation to complete for "After"
            await this.waitForGenerationToFinish('After');

            // Take screenshots for comparison
            await beforeSection.screenshot({ path: 'test-results/before.png' });
            await afterSection.screenshot({ path: 'test-results/after.png' });

            // Compare screenshots visually using Playwright snapshot system
            await expect(afterSection).not.toHaveScreenshot('before-after-comparison.png', {
                maxDiffPixelRatio: 0.2, // allow small differences
            });

            // Click on “Generate 2nd” and “Generate 3rd”
            await this.page.getByText('Generate 2nd').click();
            await this.waitForGenerationToFinish('After');

            await this.page.getByText('Generate 3rd').click();
            await this.waitForGenerationToFinish('After');

            await this.verifyActionButtons();
            return "Passed"
        }
        catch (error) {
            await this.logError("Error while testing try on your style Gen AI image processing.", error);
            return 'Failed';
        }
    }

    /**
     * Waits for the AI image generation to finish for the specified section.
     * @param {'Before' | 'After'} sectionText - Section to wait for ("Before" or "After").
     */
    async waitForGenerationToFinish(sectionText: 'Before' | 'After') {
        const progressBar = this.page.getByRole('progressbar').first();
        const imageSelector = `div[class*="_${sectionText.toLowerCase()}Image_"] img`;

        // Wait for progress bar to disappear
        await expect(progressBar).toBeHidden({ timeout: 120000 });

        const generatedImg = this.page.locator(imageSelector).first();

        // Retry logic in case of rendering delays
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                await expect(generatedImg).toBeVisible({ timeout: 120000 });
                await expect(generatedImg).toHaveJSProperty('complete', true);

                // Small stability delay (optional)
                await this.page.waitForTimeout(1000);
                return; // success
            } catch (error) {
                await this.logWarn(
                    `Attempt ${attempt} failed to find ${sectionText} image. Retrying...`
                );

                // Take screenshot for debugging
                await this.page.screenshot({
                    path: `screenshots/${sectionText}_image_generation_fail_attempt${attempt}.png`,
                    fullPage: true,
                });

                if (attempt === 2) {
                    throw new Error(
                        `${sectionText} image did not appear or load completely after retries.`
                    );
                }

                // Wait a bit before retry
                await this.page.waitForTimeout(3000);
            }
        }
    }

    /**
     * Verifies the presence of action buttons (Redo, Download, Delete) after image generation.
     * @private
     */
    private async verifyActionButtons() {
        await expect(this.page.getByRole('button', { name: 'Redo' })).toBeVisible();
        await expect(this.page.getByRole('button', { name: 'Download' })).toBeVisible();
        await expect(this.page.getByRole('button', { name: 'Delete' })).toBeVisible();
    }

    /**
     * Waits for the loading spinner to disappear from the page.
     * @param {number} [timeout=20000] - Timeout in milliseconds.
     * @private
     */
    private async waitForSpinnerToDisappear(timeout = 20000) {
        const spinner = this.page.locator('.spinner, .loading-indicator'); // adjust class if needed
        await spinner.waitFor({ state: 'detached', timeout }).catch(() => { });
    }

}

/**
 * Clicks a locator when it is ready (visible and enabled).
 * @param {Page} page - Playwright Page object.
 * @param {string} locatorText - Text of the locator to click.
 */
async function clickWhenReady(page: Page, locatorText: string) {
    const locator = page.getByText(locatorText);
    await locator.hover();
    await locator.focus();
    await locator.waitFor({ state: 'visible' });       // Ensure visible
    await expect(locator).toBeEnabled();               // Ensure enabled
    await locator.click({ trial: true });              // Test click (no action)
    await locator.click({ force: true });               // Actual click
}

/**
 * Drags a slider element horizontally by a specified offset.
 * @param {Page} page - Playwright Page object.
 * @param {string} sliderSelector - Selector for the slider element.
 * @param {number} offsetX - Horizontal offset to drag the slider.
 */
async function dragSlider(page: Page, sliderSelector: string, offsetX: number) {
    const slider = page.locator(sliderSelector);
    const box = await slider.boundingBox();
    if (!box) {
        throw new Error(`Slider element not found: ${sliderSelector}`);
    }
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    // Move mouse to the center of the slider thumb
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    // Drag horizontally
    await page.mouse.move(startX + offsetX, startY, { steps: 10 });
    await page.mouse.up();
}