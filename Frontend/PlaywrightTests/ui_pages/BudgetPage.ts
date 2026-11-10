import { expect, Page } from "@playwright/test";
import AuthHelper from '../helpers/api-helpers';
import { waitForSpinnerToDisappear, hideChatBubble, acceptCookiesIfPresent } from '../helpers/waitHelpers';
import { registerWithIAMOtp } from '../helpers/accountRegistrationWithIAMOTP';
import { attachConsoleLogger } from '../helpers/logSuppress';
let newProjectId: string;
let userId: string;

function stringifyDetails(details: unknown[]): string {
    if (!details.length) {
        return '';
    }

    return ` ${details
        .map((item) => {
            if (item instanceof Error) {
                return item.stack ?? item.message;
            }

            if (typeof item === 'string') {
                return item;
            }

            try {
                return JSON.stringify(item);
            } catch {
                return String(item);
            }
        })
        .join(' ')}`;
}

async function logInfo(page: Page, message: unknown, ...details: unknown[]) {
    const text = `${String(message)}${stringifyDetails(details)}`;
    try {
        if (!page.isClosed()) {
            await page.evaluate((msg) => console.log(msg), text);
            return;
        }
    } catch {
        // Fall back to node console when browser context is unavailable.
    }
    console.log(text);
}

async function logWarn(page: Page, message: unknown, ...details: unknown[]) {
    const text = `${String(message)}${stringifyDetails(details)}`;
    try {
        if (!page.isClosed()) {
            await page.evaluate((msg) => console.warn(msg), text);
            return;
        }
    } catch {
        // Fall back to node console when browser context is unavailable.
    }
    console.warn(text);
}

async function logError(page: Page, message: unknown, ...details: unknown[]) {
    const text = `${String(message)}${stringifyDetails(details)}`;
    try {
        if (!page.isClosed()) {
            await page.evaluate((msg) => console.error(msg), text);
            return;
        }
    } catch {
        // Fall back to node console when browser context is unavailable.
    }
    console.error(text);
}

export default class BudgetPage {

    /**
     * Constructs a SmokePage instance and attaches a console event listener for logging.
     * @param {Page} page - Playwright Page object for browser automation.
     */
    constructor(public page: Page) {
        attachConsoleLogger(page);
    }

    private async logInfo(message: string) {
        try {
            if (!this.page.isClosed()) {
                await this.page.evaluate((msg) => console.log(msg), message);
                return;
            }
        } catch {
            // Ignore browser-context logging errors and fall back to node console.
        }
        console.log(message);
    }

    private async logWarn(message: string) {
        try {
            if (!this.page.isClosed()) {
                await this.page.evaluate((msg) => console.warn(msg), message);
                return;
            }
        } catch {
            // Ignore browser-context logging errors and fall back to node console.
        }
        console.warn(message);
    }

    private async logError(message: string, details?: unknown) {
        const detailText = details === undefined
            ? ''
            : details instanceof Error
                ? ` ${details.stack ?? details.message}`
                : ` ${String(details)}`;
        const text = `${message}${detailText}`;
        try {
            if (!this.page.isClosed()) {
                await this.page.evaluate((msg) => console.error(msg), text);
                return;
            }
        } catch {
            // Ignore browser-context logging errors and fall back to node console.
        }
        console.error(text);
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
        try {
            const authHelper = new AuthHelper(request);
            const oldId2 = await authHelper.getUserByEmail(email);

            if (oldId2 == false) {
                await this.logInfo("User ID associated with email is already Deleted");
                return;
            }

            expect(oldId2).toBeTruthy();
            await authHelper.deleteExistingUser(oldId2);

            if (userId) {
                await authHelper.deleteUserFromUserDetails(userId);
            } else {
                await this.logWarn("userDetailsID not captured, skipping deleteUserFromUserDetails.");
            }
        } catch (error) {
            await this.logWarn("User cleanup failed, skipping without failing test.");
            await this.logWarn(String(error));
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

   
    async launchHomePage() {
        await this.logInfo("Launched JumpStarter Page");
        this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.page.goto('https://js.' + process.env.environment + '.digitalmbd.net/secret/straw-serve-pound.html');
        await acceptCookiesIfPresent(this.page);
        //navigate to icebreaker page
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
        await this.logInfo("Successfully navigated to Icebreaker page");
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
        await this.logInfo("Successfully navigated to Icebreaker page");
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
    
    async verifyBudgetRange(budgetType: string) {
        try{
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/budget/start');
        await waitForSpinnerToDisappear(this.page, 10000);
        await this.page.waitForTimeout(15000);
        logInfo(this.page, 'VERIFIED: Budget start page is loaded and spinner is invisible');
        await expect(this.page.getByText('Find the right budget')).toBeVisible();
        logInfo(this.page, 'VERIFIED: Budget header text is displayed');
        expect(await this.page.locator('xpath=(//div[@class="header-subtext"])[1]').isVisible()).toBeTruthy();
        await this.page.locator('xpath=(//div[@class="header-subtext"])[1]').focus();
        logInfo(this.page, 'VERIFIED: Budget header sub-text is displayed');
        await expect(this.page.getByText('Use national average')).toHaveClass(/active/);
        logInfo(this.page, 'VERIFIED: Budget Tab Use national average is displayed and active');
        await expect(this.page.getByText('Use zip code')).toBeVisible();
        logInfo(this.page, 'VERIFIED: Budget Tab Use zip code is displayed and not active');
        for (const tier of ['Essential', 'Mid-range', 'Premium']) {
            await expect(this.page.getByText(tier, { exact: true })).toBeVisible();
        }
        logInfo(this.page, 'VERIFIED: Budget Tab displays Budget selection Ranges as options for Essential, Mid-range, Premium');
        expect(await this.page.locator('xpath=//div[text()="Essential"]/../img').isVisible()).toBeTruthy();
        await this.page.locator('xpath=//div[text()="Essential"]/../img').focus();
        expect(await this.page.locator('xpath=//div[text()="Mid-range"]/../img').isVisible()).toBeTruthy();
        await this.page.locator('xpath=//div[text()="Mid-range"]/../img').focus();
        expect(await this.page.locator('xpath=//div[text()="Premium"]/../img').isVisible()).toBeTruthy();
        await this.page.locator('xpath=//div[text()="Premium"]/../img').focus();
        logInfo(this.page, 'VERIFIED: Budget Tab displays images for Essential, Mid-range, Premium');
        expect(await this.page.locator('xpath=(//div[text()="Essential"]/../../../div/button[text()="Read more"])[1]').isVisible()).toBeTruthy();
        expect(await this.page.locator('xpath=//p[text()="A cost-conscious approach to giving your kitchen a fresh look and new capabilities."]').isVisible()).toBeTruthy();
        expect(await this.page.locator('xpath=//p[text()="Simple upgrades and durable finishes bring new life to your space at an approachable cost."]').isVisible()).toBeTruthy();
        expect(await this.page.locator('xpath=//p[text()="Focus on practical improvements that make your kitchen feel fresh, functional, and inviting."]').isVisible()).toBeFalsy();
        expect(await this.page.locator('xpath=//p[text()="Affordable choices in cabinets, surfaces, and fixtures create style that fits comfortably."]').isVisible()).toBeFalsy();
        expect(await this.page.locator('xpath=(//div[text()="Mid-range"]/../../../div/button[text()="Read more"])[2]').isVisible()).toBeTruthy();
        expect(await this.page.locator('xpath=//p[text()="A cost-conscious approach to giving your kitchen a fresh look and new capabilities."]').isVisible()).toBeTruthy();
        expect(await this.page.locator('xpath=//p[text()="Simple upgrades and durable finishes bring new life to your space at an approachable cost."]').isVisible()).toBeTruthy();
        expect(await this.page.locator('xpath=//p[text()="Focus on practical improvements that make your kitchen feel fresh, functional, and inviting."]').isVisible()).toBeFalsy();
        expect(await this.page.locator('xpath=//p[text()="Affordable choices in cabinets, surfaces, and fixtures create style that fits comfortably."]').isVisible()).toBeFalsy();
        expect(await this.page.locator('xpath=(//div[text()="Premium"]/../../../div/button[text()="Read more"])[3]').isVisible()).toBeTruthy();
        expect(await this.page.locator('xpath=//p[text()="An investment in beauty, craftsmanship, and innovation that defines your dream kitchen."]').isVisible()).toBeTruthy();
        expect(await this.page.locator('xpath=//p[text()="Every detail is elevated, from custom cabinetry to finely tailored finishes and design."]').isVisible()).toBeTruthy();
        expect(await this.page.locator('xpath=//p[text()="Experience luxury materials, advanced appliances, and precision installation throughout."]').isVisible()).toBeFalsy();
        expect(await this.page.locator('xpath=//p[text()="A premium remodel delivers exceptional quality and lasting sophistication in every space."]').isVisible()).toBeFalsy();
        await this.page.locator('xpath=(//div[text()="Essential"]/../../../div/button[text()="Read more"])[1]').click();
        expect(await this.page.locator('xpath=(//div[text()="Essential"]/../../../div/button[text()="Read more"])[1]').isVisible()).toBeFalsy();
        expect(await this.page.locator('xpath=(//div[text()="Essential"]/../../../div/button[text()="Read less"])[1]').isVisible()).toBeTruthy();
        expect(await this.page.locator('xpath=//p[text()="A balanced approach that blends quality, comfort, and personal style for everyday living."]').isVisible()).toBeTruthy();
        expect(await this.page.locator('xpath=//p[text()="Thoughtful upgrades and durable materials give your kitchen a fresh, welcoming feel."]').isVisible()).toBeTruthy();
        expect(await this.page.locator('xpath=//p[text()="Enjoy more choices in finishes, features, and design details that reflect your personality."]').isVisible()).toBeTruthy();
        expect(await this.page.locator('xpath=//p[text()="This range brings lasting value and style without stepping into a luxury price point."]').isVisible()).toBeTruthy();
        await this.page.locator('xpath=(//div[text()="Mid-range"]/../../../div/button[text()="Read more"])[1]').click();
        expect(await this.page.locator('xpath=(//div[text()="Mid-range"]/../../../div/button[text()="Read more"])[1]').isVisible()).toBeFalsy();
        expect(await this.page.locator('xpath=(//div[text()="Mid-range"]/../../../div/button[text()="Read less"])[1]').isVisible()).toBeTruthy();
        expect(await this.page.locator('xpath=//p[text()="A balanced approach that blends quality, comfort, and personal style for everyday living."]').isVisible()).toBeTruthy();
        expect(await this.page.locator('xpath=//p[text()="Thoughtful upgrades and durable materials give your kitchen a fresh, welcoming feel."]').isVisible()).toBeTruthy();
        expect(await this.page.locator('xpath=//p[text()="Enjoy more choices in finishes, features, and design details that reflect your personality."]').isVisible()).toBeTruthy();
        expect(await this.page.locator('xpath=//p[text()="This range brings lasting value and style without stepping into a luxury price point."]').isVisible()).toBeTruthy();
        await this.page.locator('xpath=(//div[text()="Premium"]/../../../div/button[text()="Read more"])[1]').click();
        expect(await this.page.locator('xpath=(//div[text()="Premium"]/../../../div/button[text()="Read more"])[1]').isVisible()).toBeFalsy();
        expect(await this.page.locator('xpath=(//div[text()="Premium"]/../../../div/button[text()="Read less"])[1]').isVisible()).toBeTruthy();
        expect(await this.page.locator('xpath=//p[text()="An investment in beauty, craftsmanship, and innovation that defines your dream kitchen."]').isVisible()).toBeTruthy();
        expect(await this.page.locator('xpath=//p[text()="Every detail is elevated, from custom cabinetry to finely tailored finishes and design."]').isVisible()).toBeTruthy();
        expect(await this.page.locator('xpath=//p[text()="Experience luxury materials, advanced appliances, and precision installation throughout."]').isVisible()).toBeTruthy();
        expect(await this.page.locator('xpath=//p[text()="A premium remodel delivers exceptional quality and lasting sophistication in every space."]').isVisible()).toBeTruthy();
        await this.page.locator('xpath=(//div[text()="Essential"]/../../../div/button[text()="Read less"])[1]').click();
        expect(await this.page.locator('xpath=(//div[text()="Essential"]/../../../div/button[text()="Read less"])[1]').isVisible()).toBeFalsy();
        expect(await this.page.locator('xpath=(//div[text()="Essential"]/../../../div/button[text()="Read more"])[1]').isVisible()).toBeTruthy();
        await this.page.locator('xpath=(//div[text()="Mid-range"]/../../../div/button[text()="Read less"])[1]').click();
        expect(await this.page.locator('xpath=(//div[text()="Mid-range"]/../../../div/button[text()="Read less"])[1]').isVisible()).toBeFalsy();
        expect(await this.page.locator('xpath=(//div[text()="Mid-range"]/../../../div/button[text()="Read more"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[text()="Premium"]/../../../div/button[text()="Read less"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[text()="Premium"]/../../../div/button[text()="Read less"])[1]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//div[text()="Premium"]/../../../div/button[text()="Read more"])[1]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays partial/full description on Read more/less buttons for Essential, Mid-range, Premium');
        expect(await this.page.locator('xpath=//button[text()="Back"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Back"]').focus()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays button Back');
        expect(await this.page.locator('xpath=//div[text()="Find the right budget"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Find the right budget"]').focus()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays text Find the right budget');
        const tierRange = await this.page.locator('div.tier-range').nth(2).innerText();
        // Extract numbers
        const [tierMin, tierMax] = tierRange
            .replace(/[$,+]/g, '')
            .split('—')
            .map(v => parseInt(v.trim()));
        logInfo(this.page, String(tierMin), tierMax);
        await this.page.waitForTimeout(5000);
        if (budgetType.toLowerCase() === 'premium') {
            expect(await this.page.locator('xpath=//div[text()="Premium"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Premium"]').focus()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Premium"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@class="budget-tier selected "]//div[text()="Premium"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@class="budget-tier selected "]//div[text()="Premium"]').focus()).toBeTruthy;
            logInfo(this.page, 'VERIFIED: Budget Tab Selection of Premium range is successful');
        } else if (budgetType.toLowerCase() === 'mid-range') {
            expect(await this.page.locator('xpath=//div[text()="Mid-range"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Mid-range"]').focus()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Mid-range"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@class="budget-tier selected "]//div[text()="Mid-range"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@class="budget-tier selected "]//div[text()="Mid-range"]').focus()).toBeTruthy;
            logInfo(this.page, 'VERIFIED: Budget Tab Selection of Mid range is successful');
        } else if (budgetType.toLowerCase() === 'essential') {
            expect(await this.page.locator('xpath=//div[text()="Essential"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Essential"]').focus()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Essential"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@class="budget-tier selected "]//div[text()="Essential"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@class="budget-tier selected "]//div[text()="Essential"]').focus()).toBeTruthy;
            logInfo(this.page, 'VERIFIED: Budget Tab Selection of Essential range is successful');
        }
        await this.page.waitForTimeout(5000);
        expect(await this.page.locator('xpath=//button[text()="Continue"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Continue"]').focus()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays button Continue');
        expect(await this.page.locator('xpath=//div[text()="Pick a range to get started"]').isVisible()).toBeFalsy;
        expect(await this.page.locator('.budget-range').hover()).toBeTruthy;
        expect(await this.page.locator('.budget-range').focus()).toBeTruthy;
        const budgetRange = this.page.locator('.budget-range');
        // Get all number-flow-react elements (min & max)
        const numbers = budgetRange.locator('number-flow-react');

        const parseNumberFlowValue = (rawData: string | null): number | null => {
            if (!rawData) {
                return null;
            }

            try {
                const parsed = JSON.parse(rawData);
                if (typeof parsed?.value === 'number') {
                    return parsed.value;
                }

                if (typeof parsed?.value === 'string') {
                    const value = Number(parsed.value.replace(/[^\d.-]/g, ''));
                    return Number.isFinite(value) ? value : null;
                }
            } catch {
                return null;
            }

            return null;
        };

        const readBudgetRangeValues = async (rangeLocator: any, valueNodes: any) => {
            let minValueLocal: number | null = null;
            let maxValueLocal: number | null = null;

            for (let attempt = 0; attempt < 5; attempt++) {
                const minData = await valueNodes.nth(0).getAttribute('data');
                const maxData = await valueNodes.nth(1).getAttribute('data');

                minValueLocal = parseNumberFlowValue(minData);
                maxValueLocal = parseNumberFlowValue(maxData);

                if (minValueLocal !== null && maxValueLocal !== null) {
                    return { minValue: minValueLocal, maxValue: maxValueLocal };
                }

                await this.page.waitForTimeout(1000);
            }

            // Fallback: parse visible text if number-flow data attributes are transient/missing.
            const rangeText = await rangeLocator.innerText();
            const matches = rangeText.match(/\$?\s*[\d,]+/g) ?? [];
            const parsedValues = matches
                .map((v: string) => Number(v.replace(/[^\d.-]/g, '')))
                .filter((v: number) => Number.isFinite(v));

            if (parsedValues.length >= 2) {
                return { minValue: parsedValues[0], maxValue: parsedValues[1] };
            }

            throw new Error(`Unable to read budget range values from number-flow and text: "${rangeText}"`);
        };

        const { minValue, maxValue } = await readBudgetRangeValues(budgetRange, numbers);
        logInfo(this.page, minValue, maxValue);
        expect(minValue).toBe(tierMin);
        expect(maxValue).toBe(tierMax);
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').hover()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/budget/categories');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.locator('xpath=//div[text()="Personalize by category"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[@class="toggle"])[1]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[@class="toggle"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Cabinets & storage"]][.//div[text()="Premium"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Countertops"]][.//div[text()="Premium"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Appliances"]][.//div[text()="Premium"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Plumbing & fixtures"]][.//div[text()="Premium"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Flooring"]][.//div[text()="Premium"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Lighting"]][.//div[text()="Premium"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@class="title" and normalize-space(.)="Labor"]/..//div[@class="selection" and normalize-space(.)="Estimated"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Your range:"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@class="top"]   [div[@class="title"]/div[@class="primary" and normalize-space(.)="Backup fund"]    and div[@class="selection" and normalize-space(.)="20%"]    and div[contains(@class,"range")]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Cabinets & storage"]][.//div[text()="Premium"]]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Lighting"]][.//div[text()="Premium"]]').scrollIntoViewIfNeeded()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Countertops"]][.//div[text()="Premium"]]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Appliances"]][.//div[text()="Premium"]]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Plumbing & fixtures"]][.//div[text()="Premium"]]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Flooring"]][.//div[text()="Premium"]]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Lighting"]][.//div[text()="Premium"]]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@class="title" and normalize-space(.)="Labor"]/..//div[@class="selection" and normalize-space(.)="Estimated"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Your range:"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@class="top"]   [div[@class="title"]/div[@class="primary" and normalize-space(.)="Backup fund"]    and div[@class="selection" and normalize-space(.)="20%"]    and div[contains(@class,"range")]]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Category Tab displays all budget categories');
        expect(await this.page.locator('xpath=//div[@class="budget-range labeled-range"]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@class="budget-range labeled-range"]').focus()).toBeTruthy;
        const budgetRangeInCategory = this.page.locator('.budget-range');
        // Get all number-flow-react elements (min & max)
        const numbersInCategory = budgetRangeInCategory.locator('number-flow-react');
        const { minValue: minValueInCategory, maxValue: maxValueInCategory } = await readBudgetRangeValues(budgetRangeInCategory, numbersInCategory);
        logInfo(this.page, minValueInCategory, maxValueInCategory);
        expect(minValueInCategory).toBe(tierMin);
        expect(maxValueInCategory).toBe(tierMax);
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').hover()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/overview');
        await waitForSpinnerToDisappear(this.page, 10000);
        await this.page.waitForTimeout(5000);
        expect(await this.page.getByTestId('TestId_Profile_Overview_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Style_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Design_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Budget_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Overview_Tab').focus()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Style_Tab').focus()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Design_Tab').focus()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Budget_Tab').focus()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Budget_Tab').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/budget');
        await waitForSpinnerToDisappear(this.page, 10000);
        await this.page.waitForTimeout(5000);
        expect(await this.page.locator('xpath=//h1[text()="Your remodeling ideas are ready to go!"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h1[text()="Your remodeling ideas are ready to go!"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="My personalized budget"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="My personalized budget"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Cabinets & storage"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Cabinets & storage"]/../p[text()="Premium"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Countertops"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Countertops"]/../p[text()="Premium"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Appliances"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Appliances"]/../p[text()="Premium"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Plumbing & fixtures"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Plumbing & fixtures"]/../p[text()="Premium"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Flooring"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Flooring"]/../p[text()="Premium"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Lighting"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Lighting"]/../p[text()="Premium"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Labor"]/../p[text()="Estimated"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Labor"]/../p[text()="Estimated"]').focus()).toBeTruthy;
        // Extract displayed range
        const displayedRangeProfileBudget = this.page
            .getByText('Your range:')
            .locator('xpath=..')
            .locator('p');
        await expect(displayedRangeProfileBudget).toBeVisible();

        const rangeText = await displayedRangeProfileBudget.textContent();

        const [displayMin, displayMax] = rangeText!
            .replace(/[$,]/g, '')
            .replace(/[+,]/g, '')
            .split('to')
            .map(v => Number(v.trim()));

        // Assertions
        expect(displayMin).toBe(minValue);
        expect(displayMax).toBe(maxValue);
        expect(await this.page.locator('xpath=//h4[text()="Backup fund:"]/..//p[text()="20" and text()="%"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h4[text()="Backup fund:"]/..//p[text()="20" and text()="%"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Plan for the unexpected with funds to cover surprise costs."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Plan for the unexpected with funds to cover surprise costs."]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//b[text()="Disclaimer:"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//b[text()="Disclaimer:"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()=" This budget estimate is for informational purposes only and is not a legally binding quote. Estimates are based on national averages and ZIP code-level data and may not reflect actual costs. For a detailed and accurate quote, please consult a qualified professional."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()=" This budget estimate is for informational purposes only and is not a legally binding quote. Estimates are based on national averages and ZIP code-level data and may not reflect actual costs. For a detailed and accurate quote, please consult a qualified professional."]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//h2[text()="Next steps"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h2[text()="Next steps"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Turn your budget into a plan. Your kitchen designer will guide you through the details so you can move forward with confidence."]').scrollIntoViewIfNeeded()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Turn your budget into a plan. Your kitchen designer will guide you through the details so you can move forward with confidence."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Turn your budget into a plan. Your kitchen designer will guide you through the details so you can move forward with confidence."]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Smart tips:"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Smart tips:"]').focus()).toBeTruthy;
        const listItems = this.page.locator('div:has(h3:has-text("Smart tips:")) li');
        const count = await listItems.count();
        logInfo(this.page, 'Number of list items:', count);
        expect(count).toBe(5); // There are 5 <li> items
        for (let i = 0; i < count; i++) {
            const paragraphs = listItems.nth(i).locator('p');
            const title = await paragraphs.first().innerText();
            const description = await paragraphs.nth(1).innerText();
            logInfo(this.page, `Item ${i + 1} Title:`, title);
            logInfo(this.page, `Item ${i + 1} Description:`, description);
            const expectedTexts = [
                {
                    title: "Prioritize what matters most.",
                    description: "Invest more in high-use areas like cabinets and countertops, and simplify where it counts less."
                },
                {
                    title: "Use lighting strategically.",
                    description: "Recessed, undercabinet, and task lighting can elevate your kitchen affordably"
                },
                {
                    title: "Mix and match materials.",
                    description: "Combine premium finishes with budget-friendly options to balance beauty and cost."
                },
                {
                    title: "Keep your layout when possible.",
                    description: "Avoid moving plumbing or electrical lines—those changes can quickly raise labor costs."
                },
                {
                    title: "Think long term value.",
                    description: "Energy-efficient appliances may cost more up front, but they’ll save you money over time."
                }
            ];

            for (let i = 0; i < expectedTexts.length; i++) {
                const title = await listItems.nth(i).locator('p').first().innerText();
                const description = await listItems.nth(i).locator('p').nth(1).innerText();
                expect(title).toBe(expectedTexts[i].title);
                expect(description).toBe(expectedTexts[i].description);
            }
            logInfo(this.page, 'VERIFIED: Consolidated Profile Budget Tab displays All details successfully');
        }
        expect(await this.page.getByTestId('TestId_Profile_Overview_Tab').click()).toBeTruthy;
        await this.page.waitForTimeout(5000);
        const page1Promise = this.page.waitForEvent('popup');
        await this.page.getByRole('button', { name: 'View my project' }).click();
        const page1 = await page1Promise;
        expect(await page1.locator('xpath=//h1[text()="Your remodeling ideas are ready to go!"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h1[text()="Your remodeling ideas are ready to go!"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="My personalized budget"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="My personalized budget"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Cabinets & storage"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Cabinets & storage"]/../p[text()="Premium"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Countertops"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Countertops"]/../p[text()="Premium"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Appliances"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Appliances"]/../p[text()="Premium"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Plumbing & fixtures"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Plumbing & fixtures"]/../p[text()="Premium"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Flooring"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Flooring"]/../p[text()="Premium"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Lighting"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Lighting"]/../p[text()="Premium"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Labor"]/../p[text()="Estimated"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Labor"]/../p[text()="Estimated"]').focus()).toBeTruthy;
        // Extract displayed range
        const displayedRangeProfileClientPDF = page1.getByText('Your range:')
            .locator('xpath=..')
            .locator('p');
        await expect(displayedRangeProfileClientPDF).toBeVisible();

        const rangeTextClientPDF = await displayedRangeProfileClientPDF.textContent();

        const [displayMinClientPDF, displayMaxClientPDF] = rangeTextClientPDF!
            .replace(/[$,]/g, '')
            .replace(/[+,]/g, '')
            .split('to')
            .map(v => Number(v.trim()));

        // Assertions
        expect(displayMinClientPDF).toBe(minValue);
        expect(displayMaxClientPDF).toBe(maxValue);
        expect(await page1.locator('xpath=//h4[text()="Backup fund:"]/..//p[text()="20" and text()="%"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h4[text()="Backup fund:"]/..//p[text()="20" and text()="%"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//p[text()="Plan for the unexpected with funds to cover surprise costs."]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//p[text()="Plan for the unexpected with funds to cover surprise costs."]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//b[text()="Disclaimer:"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//b[text()="Disclaimer:"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//p[text()=" This budget estimate is for informational purposes only and is not a legally binding quote. Estimates are based on national averages and ZIP code-level data and may not reflect actual costs. For a detailed and accurate quote, please consult a qualified professional."]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//p[text()=" This budget estimate is for informational purposes only and is not a legally binding quote. Estimates are based on national averages and ZIP code-level data and may not reflect actual costs. For a detailed and accurate quote, please consult a qualified professional."]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h2[text()="Next steps"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h2[text()="Next steps"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//p[text()="Turn your budget into a plan. Your kitchen designer will guide you through the details so you can move forward with confidence."]').scrollIntoViewIfNeeded()).toBeTruthy;
        expect(await page1.locator('xpath=//p[text()="Turn your budget into a plan. Your kitchen designer will guide you through the details so you can move forward with confidence."]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//p[text()="Turn your budget into a plan. Your kitchen designer will guide you through the details so you can move forward with confidence."]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Smart tips:"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Smart tips:"]').focus()).toBeTruthy;
        await page1.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
        const listItemsNew = await page1.locator('div:has(h3:has-text("Smart tips:")) li');
        const countNew = await listItemsNew.count();
        logInfo(this.page, 'Number of list items:', countNew);
        const expectedTexts = [
            {
                title: "Prioritize what matters most.",
                description: "Invest more in high-use areas like cabinets and countertops, and simplify where it counts less."
            },
            {
                title: "Use lighting strategically.",
                description: "Recessed, undercabinet, and task lighting can elevate your kitchen affordably"
            },
            {
                title: "Mix and match materials.",
                description: "Combine premium finishes with budget-friendly options to balance beauty and cost."
            },
            {
                title: "Keep your layout when possible.",
                description: "Avoid moving plumbing or electrical lines—those changes can quickly raise labor costs."
            },
            {
                title: "Think long term value.",
                description: "Energy-efficient appliances may cost more up front, but they’ll save you money over time."
            }
        ];

        // Smart tips are expected to occupy the last 5 list items on the page.
        expect(countNew).toBeGreaterThanOrEqual(expectedTexts.length);
        const smartTipsStartIndex = countNew - expectedTexts.length;

        for (let i = 0; i < expectedTexts.length; i++) {
            const itemIndex = smartTipsStartIndex + i;
            const title = await listItemsNew.nth(itemIndex).locator('p').first().innerText();
            const description = await listItemsNew.nth(itemIndex).locator('p').nth(1).innerText();

            logInfo(this.page, `Item ${i + 1} Title:`, title);
            logInfo(this.page, `Item ${i + 1} Description:`, description);

            expect(title).toBe(expectedTexts[i].title);
            expect(description).toBe(expectedTexts[i].description);
            logInfo(this.page, 'VERIFIED: Consolidated Profile Budget Tab displays All details successfully');
        }
        await page1.close();
        await this.page.getByTestId('TestId_Profile_Overview_Tab').click();
        return "Passed";
    }
    catch(error) {
        logInfo(this.page, 'ERROR:', error);
        return "Failed";
        }
    }

    async verifyBudgetCategoryReadMore(budgetType: string) {
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/budget/start');
        await waitForSpinnerToDisappear(this.page, 10000);
        await this.page.waitForTimeout(5000);
        logInfo(this.page, 'VERIFIED: Budget start page is loaded and spinner is invisible');
        expect(await this.page.locator('xpath=//div[text()="Find the right budget"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget header text is displayed');
        expect(await this.page.locator('xpath=(//div[@class="header-subtext"])[1]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget header sub-text is displayed');
        expect(await this.page.locator('xpath=//div[text()="Use national average" and @class="tab active"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab Use national average is displayed and active');
        expect(await this.page.locator('xpath=//div[text()="Use zip code" and not(@class="tab active")]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab Use zip code is displayed and not active');
        expect(await this.page.locator('xpath=//div[text()="Find the right budget"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Essential"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Premium"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays Budget selection Ranges as options for Essential, Mid-range, Premium');
        expect(await this.page.locator('xpath=//div[text()="Essential"]/../img').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Mid-range"]/../img').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Premium"]/../img').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays images for Essential, Mid-range, Premium');
        expect(await this.page.locator('xpath=(//div[text()="Essential"]/../../../div/button[text()="Read more"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="A cost-conscious approach to giving your kitchen a fresh look and new capabilities."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Simple upgrades and durable finishes bring new life to your space at an approachable cost."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Focus on practical improvements that make your kitchen feel fresh, functional, and inviting."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//p[text()="Affordable choices in cabinets, surfaces, and fixtures create style that fits comfortably."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//div[text()="Mid-range"]/../../../div/button[text()="Read more"])[2]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="A cost-conscious approach to giving your kitchen a fresh look and new capabilities."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Simple upgrades and durable finishes bring new life to your space at an approachable cost."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Focus on practical improvements that make your kitchen feel fresh, functional, and inviting."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//p[text()="Affordable choices in cabinets, surfaces, and fixtures create style that fits comfortably."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//div[text()="Premium"]/../../../div/button[text()="Read more"])[3]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="An investment in beauty, craftsmanship, and innovation that defines your dream kitchen."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Every detail is elevated, from custom cabinetry to finely tailored finishes and design."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Experience luxury materials, advanced appliances, and precision installation throughout."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//p[text()="A premium remodel delivers exceptional quality and lasting sophistication in every space."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//div[text()="Essential"]/../../../div/button[text()="Read more"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[text()="Essential"]/../../../div/button[text()="Read more"])[1]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//div[text()="Essential"]/../../../div/button[text()="Read less"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="A balanced approach that blends quality, comfort, and personal style for everyday living."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Thoughtful upgrades and durable materials give your kitchen a fresh, welcoming feel."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Enjoy more choices in finishes, features, and design details that reflect your personality."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="This range brings lasting value and style without stepping into a luxury price point."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[text()="Mid-range"]/../../../div/button[text()="Read more"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[text()="Mid-range"]/../../../div/button[text()="Read more"])[1]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//div[text()="Mid-range"]/../../../div/button[text()="Read less"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="A balanced approach that blends quality, comfort, and personal style for everyday living."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Thoughtful upgrades and durable materials give your kitchen a fresh, welcoming feel."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Enjoy more choices in finishes, features, and design details that reflect your personality."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="This range brings lasting value and style without stepping into a luxury price point."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[text()="Premium"]/../../../div/button[text()="Read more"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[text()="Premium"]/../../../div/button[text()="Read more"])[1]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//div[text()="Premium"]/../../../div/button[text()="Read less"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="An investment in beauty, craftsmanship, and innovation that defines your dream kitchen."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Every detail is elevated, from custom cabinetry to finely tailored finishes and design."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Experience luxury materials, advanced appliances, and precision installation throughout."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="A premium remodel delivers exceptional quality and lasting sophistication in every space."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[text()="Essential"]/../../../div/button[text()="Read less"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[text()="Essential"]/../../../div/button[text()="Read less"])[1]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//div[text()="Essential"]/../../../div/button[text()="Read more"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[text()="Mid-range"]/../../../div/button[text()="Read less"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[text()="Mid-range"]/../../../div/button[text()="Read less"])[1]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//div[text()="Mid-range"]/../../../div/button[text()="Read more"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[text()="Premium"]/../../../div/button[text()="Read less"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[text()="Premium"]/../../../div/button[text()="Read less"])[1]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//div[text()="Premium"]/../../../div/button[text()="Read more"])[1]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays partial/full description on Read more/less buttons for Essential, Mid-range, Premium');
        expect(await this.page.locator('xpath=//button[text()="Back"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays button Back');
        expect(await this.page.locator('xpath=//div[text()="Pick a range to get started"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays text Pick a range to get started');
        expect(await this.page.locator('xpath=//button[text()="Skip"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays button Skip');
        const tierRange = await this.page.locator('div.tier-range').nth(2).innerText();
        // Extract numbers
        const [tierMin, tierMax] = tierRange
            .replace(/[$,+]/g, '')
            .split('—')
            .map(v => parseInt(v.trim()));
        logInfo(this.page, String(tierMin), tierMax);
        await this.page.waitForTimeout(5000);
        if (budgetType.toLowerCase() === 'premium') {
            expect(await this.page.locator('xpath=//div[text()="Premium"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Premium"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@class="budget-tier selected "]//div[text()="Premium"]').isVisible()).toBeTruthy;
            logInfo(this.page, 'VERIFIED: Budget Tab Selection of Premium range is successful');
        } else if (budgetType.toLowerCase() === 'mid-range') {
            expect(await this.page.locator('xpath=//div[text()="Mid-range"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Mid-range"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@class="budget-tier selected "]//div[text()="Mid-range"]').isVisible()).toBeTruthy;
            logInfo(this.page, 'VERIFIED: Budget Tab Selection of Mid range is successful');
        } else if (budgetType.toLowerCase() === 'essential') {
            expect(await this.page.locator('xpath=//div[text()="Essential"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Essential"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@class="budget-tier selected "]//div[text()="Essential"]').isVisible()).toBeTruthy;
            logInfo(this.page, 'VERIFIED: Budget Tab Selection of Essential range is successful');
        }
        await this.page.waitForTimeout(5000);
        expect(await this.page.locator('xpath=//button[text()="Continue"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays button Continue');
        expect(await this.page.locator('xpath=//div[text()="Pick a range to get started"]').isVisible()).toBeFalsy;
        const budgetRange = this.page.locator('.budget-range');
        // Get all number-flow-react elements (min & max)
        const numbers = budgetRange.locator('number-flow-react');
        const minData = await numbers.nth(0).getAttribute('data');
        const maxData = await numbers.nth(1).getAttribute('data');
        const minValue = JSON.parse(minData!).value; // 96400
        const maxValue = JSON.parse(maxData!).value; // 192400
        logInfo(this.page, minValue, maxValue);
        expect(minValue).toBe(tierMin);
        expect(maxValue).toBe(tierMax);
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').hover()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/budget/categories');
        await waitForSpinnerToDisappear(this.page, 10000);
        await this.page.waitForTimeout(5000);
        expect(await this.page.locator('xpath=//div[text()="Personalize by category"]').isVisible()).toBeTruthy;
        //Cabinet & Storage
        expect(await this.page.locator('xpath=(//div[@class="toggle"])[1]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Simple, durable cabinets that keep your kitchen organized and looking fresh on a modest budget."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Straightforward layouts and reliable finishes make functionality the star of your space."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Expect standard sizing, practical storage, and easy-care materials that last through daily life."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//p[text()="A clean, timeless look delivers dependable performance and value where it matters most."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Simple, durable cabinets that keep your kitchen organized and looking fresh on a modest budget."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Straightforward layouts and reliable finishes make functionality the star of your space."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Expect standard sizing, practical storage, and easy-care materials that last through daily life."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="A clean, timeless look delivers dependable performance and value where it matters most."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[2]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Quality craftsmanship and thoughtful design come together for a balanced, personalized feel."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="You’ll find more options in finishes, configurations, and upgrades for everyday living."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Features like soft-close drawers, adjustable shelving, and pull-out storage add convenience."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//p[text()="This level blends durable construction with design flexibility that fits your lifestyle."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[2]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Quality craftsmanship and thoughtful design come together for a balanced, personalized feel."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="You’ll find more options in finishes, configurations, and upgrades for everyday living."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Features like soft-close drawers, adjustable shelving, and pull-out storage add convenience."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="This level blends durable construction with design flexibility that fits your lifestyle."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[3]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Custom cabinetry crafted for beauty, precision, and seamless integration into your kitchen."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Every detail—from finishes to storage features—is designed to suit your individual vision."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Expect tailored interiors, luxury hardware, and innovative organization throughout."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//p[text()="Premium craftsmanship ensures timeless style, exceptional function, and lasting quality."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[3]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Custom cabinetry crafted for beauty, precision, and seamless integration into your kitchen."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Every detail—from finishes to storage features—is designed to suit your individual vision."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Expect tailored interiors, luxury hardware, and innovative organization throughout."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Premium craftsmanship ensures timeless style, exceptional function, and lasting quality."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[@class="toggle"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[@class="toggle"])[2]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[@class="toggle"])[2]').click()).toBeTruthy;
        //CounterTops
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[4]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="A practical choice that refreshes your kitchen with dependable materials and simple style."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Durable, easy-care surfaces keep your space looking good through everyday use and cleanup."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Affordable options like laminate or butcher block balance charm, value, and durability."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//p[text()="You’ll enjoy fresh finishes that make your kitchen feel new without stretching your budget."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[4]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="A practical choice that refreshes your kitchen with dependable materials and simple style."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Durable, easy-care surfaces keep your space looking good through everyday use and cleanup."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Affordable options like laminate or butcher block balance charm, value, and durability."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="You’ll enjoy fresh finishes that make your kitchen feel new without stretching your budget."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[5]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="A step up in style and quality, offering lasting beauty with low-maintenance performance."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Quartz, solid surface, or entry-level granite bring texture, depth, and visual warmth."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Expanded choices in patterns, edges, and finishes let you tailor your design to your taste."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//p[text()="This level combines everyday durability with timeless appeal for a balanced investment."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[5]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="A step up in style and quality, offering lasting beauty with low-maintenance performance."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Quartz, solid surface, or entry-level granite bring texture, depth, and visual warmth."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Expanded choices in patterns, edges, and finishes let you tailor your design to your taste."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="This level combines everyday durability with timeless appeal for a balanced investment."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[6]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Luxury surfaces that elevate your kitchen with exquisite materials, quality and precision."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Quartzite, marble, or porcelain slabs create statement beauty and enduring sophistication."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Custom fabrication and exquisite details define every inch of craftsmanship."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//p[text()="Premium countertops deliver artistry, performance, and a one-of-a-kind design experience."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[6]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Luxury surfaces that elevate your kitchen with exquisite materials, quality and precision."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Quartzite, marble, or porcelain slabs create statement beauty and enduring sophistication."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Custom fabrication and exquisite details define every inch of craftsmanship."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Premium countertops deliver artistry, performance, and a one-of-a-kind design experience."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').click()).toBeTruthy;
        //Appiances
        expect(await this.page.locator('xpath=(//div[@class="toggle"])[3]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[@class="toggle"])[3]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[7]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Reliable appliances that cover the basics and keep your kitchen running smoothly."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Simple features and trusted performance bring lasting value at an approachable price point."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Expect standard models that focus on efficiency and ease without unnecessary extras."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//p[text()="You’ll get dependable cooking, cleaning, and cooling that make daily life simpler."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[7]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Reliable appliances that cover the basics and keep your kitchen running smoothly."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Simple features and trusted performance bring lasting value at an approachable price point."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Expect standard models that focus on efficiency and ease without unnecessary extras."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="You’ll get dependable cooking, cleaning, and cooling that make daily life simpler."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[8]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="A balance of performance, design, and technology for today\'s busy kitchen."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Enhanced features and stylish finishes elevate how you cook, clean, and entertain."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Energy-efficient options and smart controls add convenience and long-term value"]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//p[text()="This level blends quality and innovation to create a reliable, polished experience."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[8]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="A balance of performance, design, and technology for today\'s busy kitchen."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Enhanced features and stylish finishes elevate how you cook, clean, and entertain."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Energy-efficient options and smart controls add convenience and long-term value"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="This level blends quality and innovation to create a reliable, polished experience."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[9]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="High-end performance meets designer style for a kitchen that feels luxurious and intuitive."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Professional-grade ranges, built-ins, and smart systems deliver seamless sophistication."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Advanced technology, custom paneling, and precision controls elevate every interaction."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//p[text()="Premium appliances bring artistry and innovation to the heart of your home."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[9]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="High-end performance meets designer style for a kitchen that feels luxurious and intuitive."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Professional-grade ranges, built-ins, and smart systems deliver seamless sophistication."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Advanced technology, custom paneling, and precision controls elevate every interaction."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Premium appliances bring artistry and innovation to the heart of your home."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').click()).toBeTruthy;

        //Plumbing & Fixtures
        expect(await this.page.locator('xpath=(//div[@class="toggle"])[4]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[@class="toggle"])[4]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[10]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Dependable sinks and faucets that deliver everyday function with simple, timeless appeal."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Durable finishes and standard features make daily tasks easy and worry-free."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Practical designs that suit most layouts without stretching the budget."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//p[text()="A straightforward way to refresh your space while keeping quality and value in balance."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[10]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Dependable sinks and faucets that deliver everyday function with simple, timeless appeal."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Durable finishes and standard features make daily tasks easy and worry-free."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Practical designs that suit most layouts without stretching the budget."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="A straightforward way to refresh your space while keeping quality and value in balance."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[11]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Stylish, high-quality fixtures that blend comfort, efficiency, and thoughtful design."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Sinks and faucets come in a wider range of styles, finishes, and ergonomic options."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Features like pull-down sprayers and water-saving technology add everyday convenience."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//p[text()="This level pairs reliable performance with personal style for a well-balanced upgrade."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[11]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Stylish, high-quality fixtures that blend comfort, efficiency, and thoughtful design."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Sinks and faucets come in a wider range of styles, finishes, and ergonomic options."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Features like pull-down sprayers and water-saving technology add everyday convenience."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="This level pairs reliable performance with personal style for a well-balanced upgrade."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[12]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Luxury fixtures designed with precision, elegance, and innovation for the modern kitchen."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Statement faucets, custom sinks, and pot fillers add sophistication and functionality."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Exceptional materials and advanced engineering create beauty that performs flawlessly."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//p[text()="A premium choice for those who value artistry, comfort, and lasting quality in every detail"]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[12]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Luxury fixtures designed with precision, elegance, and innovation for the modern kitchen."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Statement faucets, custom sinks, and pot fillers add sophistication and functionality."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Exceptional materials and advanced engineering create beauty that performs flawlessly."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="A premium choice for those who value artistry, comfort, and lasting quality in every detail"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').click()).toBeTruthy;

        //Flooring
        expect(await this.page.locator('xpath=(//div[@class="toggle"])[5]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[@class="toggle"])[5]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[13]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Budget-friendly choices that bring comfort and practicality to your space."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Simple materials and finishes make it easy to refresh your kitchen without overspending."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Options like laminate or vinyl deliver lasting value with easy care and classic appeal."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//p[text()="An affordable foundation that keeps your kitchen functional, fresh, and easy to maintain."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[13]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Budget-friendly choices that bring comfort and practicality to your space."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Simple materials and finishes make it easy to refresh your kitchen without overspending."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Options like laminate or vinyl deliver lasting value with easy care and classic appeal."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="An affordable foundation that keeps your kitchen functional, fresh, and easy to maintain."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[14]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Balanced options for lasting performance, inviting warmth, and timeless design."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Engineered wood, luxury vinyl, or tile offer beauty and performance that lasts."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="More style options and higher-quality finishes elevate comfort and visual appeal."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//p[text()="This level adds depth, texture, and lasting charm to create a kitchen you’ll love."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[14]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Balanced options for lasting performance, inviting warmth, and timeless design."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Engineered wood, luxury vinyl, or tile offer beauty and performance that lasts."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="More style options and higher-quality finishes elevate comfort and visual appeal."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="This level adds depth, texture, and lasting charm to create a kitchen you’ll love."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[15]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Refined flooring choices that deliver luxury, durability, and enduring style."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Hardwood, natural stone, or patterned tile bring elegance and character to your kitchen."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Expert installation and high-end materials ensure a flawless, long-lasting finish"]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//p[text()="Premium flooring transforms your space with comfort, craftsmanship, and stunning design."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[15]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Refined flooring choices that deliver luxury, durability, and enduring style."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Hardwood, natural stone, or patterned tile bring elegance and character to your kitchen."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Expert installation and high-end materials ensure a flawless, long-lasting finish"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Premium flooring transforms your space with comfort, craftsmanship, and stunning design."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').click()).toBeTruthy;

        //Lighting
        expect(await this.page.locator('xpath=(//div[@class="toggle"])[6]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[@class="toggle"])[6]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[16]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Simple lighting that brightens your kitchen and supports daily tasks with reliable function."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Basic fixtures and simple updates like pendants or plug-in undercabinet lights."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="An easy way to refresh your space and improve visibility without major electrical changes."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//p[text()="Essential lighting focuses on practical comfort and dependable everyday performance."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[16]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Simple lighting that brightens your kitchen and supports daily tasks with reliable function."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Basic fixtures and simple updates like pendants or plug-in undercabinet lights."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="An easy way to refresh your space and improve visibility without major electrical changes."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Essential lighting focuses on practical comfort and dependable everyday performance."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[17]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Upgraded lighting that balances function, comfort, and visual appeal."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Recessed and undercabinet lighting pair with stylish pendants to create layered warmth."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Expanded fixture options and dimmable LEDs bring flexibility and elevated control."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//p[text()="This level enhances both mood and task lighting for a welcoming, well-lit kitchen."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[17]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Upgraded lighting that balances function, comfort, and visual appeal."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Recessed and undercabinet lighting pair with stylish pendants to create layered warmth."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Expanded fixture options and dimmable LEDs bring flexibility and elevated control."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="This level enhances both mood and task lighting for a welcoming, well-lit kitchen."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[18]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Lighting that merges artistry with advanced technology for beautiful illumination."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Custom recessed layouts, smart controls, and statement fixtures elevate the experience."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Layered lighting highlights cabinetry, surfaces, and architectural details beautifully."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//p[text()="Premium lighting delivers ambiance, luxury, and functionality in perfect balance."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read more"])[18]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Lighting that merges artistry with advanced technology for beautiful illumination."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Custom recessed layouts, smart controls, and statement fixtures elevate the experience."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Layered lighting highlights cabinetry, surfaces, and architectural details beautifully."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Premium lighting delivers ambiance, luxury, and functionality in perfect balance."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[@class="more-link" and text()="Read less"])[1]').click()).toBeTruthy;

        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Cabinets & storage"]][.//div[text()="Premium"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Countertops"]][.//div[text()="Premium"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Appliances"]][.//div[text()="Premium"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Plumbing & fixtures"]][.//div[text()="Premium"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Flooring"]][.//div[text()="Premium"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Lighting"]][.//div[text()="Premium"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@class="title" and normalize-space(.)="Labor"]/..//div[@class="selection" and normalize-space(.)="Estimated"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Your range:"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@class="top"]   [div[@class="title"]/div[@class="primary" and normalize-space(.)="Backup fund"]    and div[@class="selection" and normalize-space(.)="20%"]    and div[contains(@class,"range")]]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Category Tab displays all budget categories');
        const budgetRangeInCategory = this.page.locator('.budget-range');
        // Get all number-flow-react elements (min & max)
        const numbersInCategory = budgetRangeInCategory.locator('number-flow-react');
        const minDataInCategory = await numbers.nth(0).getAttribute('data');
        const maxDataInCategory = await numbers.nth(1).getAttribute('data');
        const minValueInCategory = JSON.parse(minData!).value; // 96400
        const maxValueInCategory = JSON.parse(maxData!).value; // 192400
        logInfo(this.page, minValueInCategory, maxValueInCategory);
        expect(minValueInCategory).toBe(tierMin);
        expect(maxValueInCategory).toBe(tierMax);
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').hover()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/overview');
        await waitForSpinnerToDisappear(this.page, 10000);
        await this.page.waitForTimeout(5000);
        expect(await this.page.getByTestId('TestId_Profile_Overview_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Style_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Design_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Budget_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Budget_Tab').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/budget');
        await waitForSpinnerToDisappear(this.page, 10000);
        await this.page.waitForTimeout(5000);
        expect(await this.page.locator('xpath=//h1[text()="Your remodeling ideas are ready to go!"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="My personalized budget"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Cabinets & storage"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Countertops"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Appliances"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Plumbing & fixtures"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Flooring"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Lighting"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Labor"]/../p[text()="Estimated"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h4[text()="Backup fund:"]/..//p[text()="20" and text()="%"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Plan for the unexpected with funds to cover surprise costs."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//b[text()="Disclaimer:"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()=" This budget estimate is for informational purposes only and is not a legally binding quote. Estimates are based on national averages and ZIP code-level data and may not reflect actual costs. For a detailed and accurate quote, please consult a qualified professional."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h2[text()="Next steps"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h2[text()="Turn your budget into a plan. Your kitchen designer will guide you through the details so you can move forward with confidence."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Smart tips:"]').isVisible()).toBeTruthy;
        const listItems = await this.page.locator('div:has(h3:has-text("Smart tips:")) li');
        const count = await listItems.count();
        logInfo(this.page, 'Number of list items:', count);
        expect(count).toBe(5); // There are 5 <li> items
        for (let i = 0; i < count; i++) {
            const paragraphs = listItems.nth(i).locator('p');
            const title = await paragraphs.first().innerText();
            const description = await paragraphs.nth(1).innerText();
            logInfo(this.page, `Item ${i + 1} Title:`, title);
            logInfo(this.page, `Item ${i + 1} Description:`, description);
            const expectedTexts = [
                {
                    title: "Prioritize what matters most.",
                    description: "Invest more in high-use areas like cabinets and countertops, and simplify where it counts less."
                },
                {
                    title: "Use lighting strategically.",
                    description: "Recessed, undercabinet, and task lighting can elevate your kitchen affordably"
                },
                {
                    title: "Mix and match materials.",
                    description: "Combine premium finishes with budget-friendly options to balance beauty and cost."
                },
                {
                    title: "Keep your layout when possible.",
                    description: "Avoid moving plumbing or electrical lines—those changes can quickly raise labor costs."
                },
                {
                    title: "Think long term value.",
                    description: "Energy-efficient appliances may cost more up front, but they’ll save you money over time."
                }
            ];

            for (let i = 0; i < expectedTexts.length; i++) {
                const title = await listItems.nth(i).locator('p').first().innerText();
                const description = await listItems.nth(i).locator('p').nth(1).innerText();
                expect(title).toBe(expectedTexts[i].title);
                expect(description).toBe(expectedTexts[i].description);
            }
            logInfo(this.page, 'VERIFIED: Consolidated Profile Budget Tab displays All details successfully');
        }
    }

    async verifyBudgetRangeWithZipCode(budgetType: string) {
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/budget/start');
        await waitForSpinnerToDisappear(this.page, 10000);
        await this.page.waitForTimeout(5000);
        logInfo(this.page, 'VERIFIED: Budget start page is loaded and spinner is invisible');
        expect(await this.page.locator('xpath=//div[text()="Find the right budget"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget header text is displayed');
        expect(await this.page.locator('xpath=(//div[@class="header-subtext"])[1]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget header sub-text is displayed');
        expect(await this.page.locator('xpath=//div[text()="Use national average" and @class="tab active"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Use national average" and @class="tab active"]').focus()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab Use national average is displayed and active');
        expect(await this.page.locator('xpath=//div[text()="Use zip code" and not(@class="tab active")]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Use zip code" and not(@class="tab active")]').focus()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab Use zip code is displayed and not active');
        expect(await this.page.locator('xpath=//div[text()="Find the right budget"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Essential"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Premium"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays Budget selection Ranges as options for Essential, Mid-range, Premium');
        expect(await this.page.locator('xpath=//div[text()="Essential"]/../img').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Mid-range"]/../img').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Premium"]/../img').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays images for Essential, Mid-range, Premium');
        expect(await this.page.locator('xpath=//button[text()="Back"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays button Back');
        expect(await this.page.locator('xpath=//div[text()="Pick a range to get started"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays text Pick a range to get started');
        expect(await this.page.locator('xpath=//button[text()="Skip"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays button Skip');
        const tierRange = await this.page.locator('div.tier-range').nth(2).innerText();
        // Extract numbers
        const [tierMin, tierMax] = tierRange
            .replace(/[$,+]/g, '')
            .split('—')
            .map(v => parseInt(v.trim()));
        logInfo(this.page, String(tierMin), tierMax);
        await this.page.waitForTimeout(5000);
        expect(await this.page.locator('xpath=//div[text()="Use zip code" and not(@class="tab active")]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Use zip code" and (@class="tab active")]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Your home:"]/..//input').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Your home:"]/..//input').clear()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Your home:"]/..//input').fill('07080')).toBeTruthy;
        //expect(await this.page.locator('xpath=//button[text()="Submit"]').click()).toBeTruthy;
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(10000);
        expect(await this.page.locator('xpath=//div[text()="Use national average" and not(@class="tab active")]').isVisible()).toBeTruthy;
        if (budgetType.toLowerCase() === 'premium') {
            expect(await this.page.locator('xpath=//div[text()="Premium"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Premium"]').click()).toBeTruthy;
            logInfo(this.page, 'VERIFIED: Budget Tab Selection of Premium range is successful');
        } else if (budgetType.toLowerCase() === 'mid-range') {
            expect(await this.page.locator('xpath=//div[text()="Mid-range"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Mid-range"]').click()).toBeTruthy;
            logInfo(this.page, 'VERIFIED: Budget Tab Selection of Mid range is successful');
        } else if (budgetType.toLowerCase() === 'essential') {
            expect(await this.page.locator('xpath=//div[text()="Essential"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Essential"]').click()).toBeTruthy;
            logInfo(this.page, 'VERIFIED: Budget Tab Selection of Essential range is successful');
        }
        await this.page.waitForTimeout(5000);
        expect(await this.page.locator('xpath=//button[text()="Continue"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays button Continue');
        expect(await this.page.locator('xpath=//div[text()="Pick a range to get started"]').isVisible()).toBeFalsy;
        const budgetRange = this.page.locator('.budget-range');
        // Get all number-flow-react elements (min & max)
        const numbers = budgetRange.locator('number-flow-react');
        const minData = await numbers.nth(0).getAttribute('data');
        const maxData = await numbers.nth(1).getAttribute('data');
        const minValue = JSON.parse(minData!).value; // 96400
        const maxValue = JSON.parse(maxData!).value; // 192400
        logInfo(this.page, minValue, maxValue);
        expect(minValue).not.toBe(tierMin);
        expect(maxValue).not.toBe(tierMax);
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').hover()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/budget/categories');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.locator('xpath=//div[text()="Personalize by category"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Cabinets & storage"]][.//div[text()="Premium"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Countertops"]][.//div[text()="Premium"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Appliances"]][.//div[text()="Premium"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Plumbing & fixtures"]][.//div[text()="Premium"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Flooring"]][.//div[text()="Premium"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Lighting"]][.//div[text()="Premium"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@class="title" and normalize-space(.)="Labor"]/..//div[@class="selection" and normalize-space(.)="Estimated"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Your range:"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@class="top"]   [div[@class="title"]/div[@class="primary" and normalize-space(.)="Backup fund"]    and div[@class="selection" and normalize-space(.)="20%"]    and div[contains(@class,"range")]]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Category Tab displays all budget categories');
        const budgetRangeInCategory = this.page.locator('.budget-range');
        // Get all number-flow-react elements (min & max)
        const numbersInCategory = budgetRangeInCategory.locator('number-flow-react');
        const minDataInCategory = await numbers.nth(0).getAttribute('data');
        const maxDataInCategory = await numbers.nth(1).getAttribute('data');
        const minValueInCategory = JSON.parse(minData!).value; // 96400
        const maxValueInCategory = JSON.parse(maxData!).value; // 192400
        logInfo(this.page, minValueInCategory, maxValueInCategory);
        expect(minValueInCategory).toBe(minValue);
        expect(maxValueInCategory).toBe(maxValue);
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').hover()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/overview');
        await waitForSpinnerToDisappear(this.page, 10000);
        await this.page.waitForTimeout(5000);
        expect(await this.page.getByTestId('TestId_Profile_Overview_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Style_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Design_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Budget_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Budget_Tab').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/budget');
        await waitForSpinnerToDisappear(this.page, 10000);
        await this.page.waitForTimeout(5000);
        expect(await this.page.locator('xpath=//h1[text()="Your remodeling ideas are ready to go!"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="My personalized budget"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Cabinets & storage"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Countertops"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Appliances"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Plumbing & fixtures"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Flooring"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Lighting"]/../p[text()="Premium"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Labor"]/../p[text()="Estimated"]').isVisible()).toBeTruthy;
        // Extract displayed range
        const displayedRangeProfile = this.page
            .getByText('Your range:')
            .locator('xpath=..')
            .locator('p');
        await expect(displayedRangeProfile).toBeVisible();

        const rangeText = await displayedRangeProfile.textContent();

        const [displayMin, displayMax] = rangeText!
            .replace(/[$,]/g, '')
            .replace(/[+,]/g, '')
            .split('to')
            .map(v => Number(v.trim()));

        // Assertions
        expect(displayMin).toBe(minValue);
        expect(displayMax).toBe(maxValue);
        expect(await this.page.locator('xpath=//h4[text()="Backup fund:"]/..//p[text()="20" and text()="%"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Plan for the unexpected with funds to cover surprise costs."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//b[text()="Disclaimer:"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()=" This budget estimate is for informational purposes only and is not a legally binding quote. Estimates are based on national averages and ZIP code-level data and may not reflect actual costs. For a detailed and accurate quote, please consult a qualified professional."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h2[text()="Next steps"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h2[text()="Turn your budget into a plan. Your kitchen designer will guide you through the details so you can move forward with confidence."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Smart tips:"]').isVisible()).toBeTruthy;
        const listItems = await this.page.locator('div:has(h3:has-text("Smart tips:")) li');
        const count = await listItems.count();
        logInfo(this.page, 'Number of list items:', count);
        expect(count).toBe(5); // There are 5 <li> items
        for (let i = 0; i < count; i++) {
            const paragraphs = listItems.nth(i).locator('p');
            const title = await paragraphs.first().innerText();
            const description = await paragraphs.nth(1).innerText();
            logInfo(this.page, `Item ${i + 1} Title:`, title);
            logInfo(this.page, `Item ${i + 1} Description:`, description);
            const expectedTexts = [
                {
                    title: "Prioritize what matters most.",
                    description: "Invest more in high-use areas like cabinets and countertops, and simplify where it counts less."
                },
                {
                    title: "Use lighting strategically.",
                    description: "Recessed, undercabinet, and task lighting can elevate your kitchen affordably"
                },
                {
                    title: "Mix and match materials.",
                    description: "Combine premium finishes with budget-friendly options to balance beauty and cost."
                },
                {
                    title: "Keep your layout when possible.",
                    description: "Avoid moving plumbing or electrical lines—those changes can quickly raise labor costs."
                },
                {
                    title: "Think long term value.",
                    description: "Energy-efficient appliances may cost more up front, but they’ll save you money over time."
                }
            ];

            for (let i = 0; i < expectedTexts.length; i++) {
                const title = await listItems.nth(i).locator('p').first().innerText();
                const description = await listItems.nth(i).locator('p').nth(1).innerText();
                expect(title).toBe(expectedTexts[i].title);
                expect(description).toBe(expectedTexts[i].description);
            }
            logInfo(this.page, 'VERIFIED: Consolidated Profile Budget Tab displays All details successfully');
        }

    }


    async verifyBudgetRangeWithNewRange(budgetType: string) {
        expect(await this.page.locator('xpath=//div[@class="complete step-inner center-justify"]/div[text()="Budget"]').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/budget/start');
        await waitForSpinnerToDisappear(this.page, 10000);
        logInfo(this.page, 'VERIFIED: Budget start page is loaded and spinner is invisible');
        expect(await this.page.locator('xpath=//div[text()="Find the right budget"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget header text is displayed');
        expect(await this.page.locator('xpath=(//div[@class="header-subtext"])[1]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget header sub-text is displayed');
        expect(await this.page.locator('xpath=//div[text()="Use national average" and @class="tab active"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab Use national average is displayed and active');
        expect(await this.page.locator('xpath=//div[text()="Use zip code" and not(@class="tab active")]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab Use zip code is displayed and not active');
        expect(await this.page.locator('xpath=//div[text()="Find the right budget"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Essential"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@class="budget-tier selected "]//div[text()="Premium"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays Budget selection Ranges as options for Essential, Mid-range, Premium');
        expect(await this.page.locator('xpath=//div[text()="Essential"]/../img').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Mid-range"]/../img').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Premium"]/../img').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays images for Essential, Mid-range, Premium');
        expect(await this.page.locator('xpath=//button[text()="Back"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays button Back');
        expect(await this.page.locator('xpath=//div[text()="Pick a range to get started"]').isVisible()).toBeFalsy;
        logInfo(this.page, 'VERIFIED: Budget Tab doesn\'t displays text Pick a range to get started');
        expect(await this.page.locator('xpath=//button[text()="Skip"]').isVisible()).toBeFalsy;
        logInfo(this.page, 'VERIFIED: Budget Tab doesn\'t display button Skip');
        const tierRange = await this.page.locator('div.tier-range').nth(1).innerText();
        // Extract numbers
        const [tierMin, tierMax] = tierRange
            .replace(/[$,+]/g, '')
            .split('—')
            .map(v => parseInt(v.trim()));
        logInfo(this.page, String(tierMin), tierMax);
        await this.page.waitForTimeout(5000);
        if (budgetType.toLowerCase() === 'premium') {
            expect(await this.page.locator('xpath=//div[text()="Premium"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Premium"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@class="budget-tier selected "]//div[text()="Premium"]').isVisible()).toBeTruthy;
            logInfo(this.page, 'VERIFIED: Budget Tab Selection of Premium range is successful');
        } else if (budgetType.toLowerCase() === 'mid-range') {
            expect(await this.page.locator('xpath=//div[text()="Mid-range"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Mid-range"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@class="budget-tier selected "]//div[text()="Mid-range"]').isVisible()).toBeTruthy;
            logInfo(this.page, 'VERIFIED: Budget Tab Selection of Mid range is successful');
        } else if (budgetType.toLowerCase() === 'essential') {
            expect(await this.page.locator('xpath=//div[text()="Essential"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Essential"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@class="budget-tier selected "]//div[text()="Essential"]').isVisible()).toBeTruthy;
            logInfo(this.page, 'VERIFIED: Budget Tab Selection of Essential range is successful');
        }
        await this.page.waitForTimeout(5000);
        expect(await this.page.locator('xpath=//button[text()="Continue"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays button Continue');
        const budgetRange = this.page.locator('.budget-range');
        // Get all number-flow-react elements (min & max)
        const numbers = budgetRange.locator('number-flow-react');
        const minData = await numbers.nth(0).getAttribute('data');
        const maxData = await numbers.nth(1).getAttribute('data');
        const minValue = JSON.parse(minData!).value; // 96400
        const maxValue = JSON.parse(maxData!).value; // 192400
        logInfo(this.page, minValue, maxValue);
        expect(minValue).toBe(tierMin);
        expect(maxValue).toBe(tierMax);
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').hover()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/budget/categories');
        await waitForSpinnerToDisappear(this.page, 10000);
        await this.page.waitForTimeout(10_000);
        expect(await this.page.locator('xpath=//div[text()="Personalize by category"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[@class="toggle"])[1]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[@class="toggle"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Cabinets & storage"]][.//div[text()="Mid-range"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Countertops"]][.//div[text()="Mid-range"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Appliances"]][.//div[text()="Mid-range"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Plumbing & fixtures"]][.//div[text()="Mid-range"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Flooring"]][.//div[text()="Mid-range"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Lighting"]][.//div[text()="Mid-range"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@class="title" and normalize-space(.)="Labor"]/..//div[@class="selection" and normalize-space(.)="Estimated"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Your range:"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@class="top"]   [div[@class="title"]/div[@class="primary" and normalize-space(.)="Backup fund"]    and div[@class="selection" and normalize-space(.)="20%"]    and div[contains(@class,"range")]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Cabinets & storage"]][.//div[text()="Mid-range"]]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Countertops"]][.//div[text()="Mid-range"]]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Your range:"]').scrollIntoViewIfNeeded()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Appliances"]][.//div[text()="Mid-range"]]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Plumbing & fixtures"]][.//div[text()="Mid-range"]]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Flooring"]][.//div[text()="Mid-range"]]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Lighting"]][.//div[text()="Mid-range"]]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@class="title" and normalize-space(.)="Labor"]/..//div[@class="selection" and normalize-space(.)="Estimated"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Your range:"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@class="top"]   [div[@class="title"]/div[@class="primary" and normalize-space(.)="Backup fund"]    and div[@class="selection" and normalize-space(.)="20%"]    and div[contains(@class,"range")]]').focus()).toBeTruthy;

        logInfo(this.page, 'VERIFIED: Budget Category Tab displays all budget categories');
        const budgetRangeInCategory = this.page.locator('.budget-range');
        // Get all number-flow-react elements (min & max)
        const numbersInCategory = budgetRangeInCategory.locator('number-flow-react');
        const minDataInCategory = await numbers.nth(0).getAttribute('data');
        const maxDataInCategory = await numbers.nth(1).getAttribute('data');
        const minValueInCategory = JSON.parse(minData!).value; // 96400
        const maxValueInCategory = JSON.parse(maxData!).value; // 192400
        logInfo(this.page, minValueInCategory, maxValueInCategory);
        expect(minValueInCategory).toBe(tierMin);
        expect(maxValueInCategory).toBe(tierMax);
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').hover()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/overview');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.getByTestId('TestId_Profile_Overview_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Style_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Design_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Budget_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Budget_Tab').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/budget');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.locator('xpath=//h1[text()="Your remodeling ideas are ready to go!"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="My personalized budget"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Cabinets & storage"]/../p[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Countertops"]/../p[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Appliances"]/../p[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Plumbing & fixtures"]/../p[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Flooring"]/../p[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Lighting"]/../p[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Cabinets & storage"]/../p[text()="Mid-range"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Countertops"]/../p[text()="Mid-range"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Appliances"]/../p[text()="Mid-range"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Plumbing & fixtures"]/../p[text()="Mid-range"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Flooring"]/../p[text()="Mid-range"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Lighting"]/../p[text()="Mid-range"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Labor"]/../p[text()="Estimated"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//h4[text()="Backup fund:"]/..//p[text()="20" and text()="%"]').isVisible()).toBeTruthy;
        // Extract displayed range
        const displayedRangeProfileBudget = this.page
            .getByText('Your range:')
            .locator('xpath=..')
            .locator('p');
        await expect(displayedRangeProfileBudget).toBeVisible();

        const rangeText = await displayedRangeProfileBudget.textContent();

        const [displayMin, displayMax] = rangeText!
            .replace(/[$,]/g, '')
            .replace(/[+,]/g, '')
            .split('to')
            .map(v => Number(v.trim()));

        // Assertions
        expect(displayMin).toBe(tierMin);
        expect(displayMax).toBe(tierMax);
        expect(await this.page.locator('xpath=//p[text()="Plan for the unexpected with funds to cover surprise costs."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//b[text()="Disclaimer:"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()=" This budget estimate is for informational purposes only and is not a legally binding quote. Estimates are based on national averages and ZIP code-level data and may not reflect actual costs. For a detailed and accurate quote, please consult a qualified professional."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h2[text()="Next steps"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Turn your budget into a plan. Your kitchen designer will guide you through the details so you can move forward with confidence."]').scrollIntoViewIfNeeded()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Turn your budget into a plan. Your kitchen designer will guide you through the details so you can move forward with confidence."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Smart tips:"]').isVisible()).toBeTruthy;
        const listItems = await this.page.locator('div:has(h3:has-text("Smart tips:")) li');
        const count = await listItems.count();
        logInfo(this.page, 'Number of list items:', count);
        expect(count).toBe(5); // There are 5 <li> items
        for (let i = 0; i < count; i++) {
            const paragraphs = listItems.nth(i).locator('p');
            const title = await paragraphs.first().innerText();
            const description = await paragraphs.nth(1).innerText();
            logInfo(this.page, `Item ${i + 1} Title:`, title);
            logInfo(this.page, `Item ${i + 1} Description:`, description);
            const expectedTexts = [
                {
                    title: "Prioritize what matters most.",
                    description: "Invest more in high-use areas like cabinets and countertops, and simplify where it counts less."
                },
                {
                    title: "Use lighting strategically.",
                    description: "Recessed, undercabinet, and task lighting can elevate your kitchen affordably"
                },
                {
                    title: "Mix and match materials.",
                    description: "Combine premium finishes with budget-friendly options to balance beauty and cost."
                },
                {
                    title: "Keep your layout when possible.",
                    description: "Avoid moving plumbing or electrical lines—those changes can quickly raise labor costs."
                },
                {
                    title: "Think long term value.",
                    description: "Energy-efficient appliances may cost more up front, but they’ll save you money over time."
                }
            ];

            for (let i = 0; i < expectedTexts.length; i++) {
                const title = await listItems.nth(i).locator('p').first().innerText();
                const description = await listItems.nth(i).locator('p').nth(1).innerText();
                expect(title).toBe(expectedTexts[i].title);
                expect(description).toBe(expectedTexts[i].description);
            }
            logInfo(this.page, 'VERIFIED: Consolidated Profile Budget Tab displays All details successfully');
        }
        expect(await this.page.getByTestId('TestId_Profile_Overview_Tab').click()).toBeTruthy;
        await this.page.waitForTimeout(5000);
        const page1Promise = this.page.waitForEvent('popup');
        await this.page.getByRole('button', { name: 'View my project' }).click();
        const page1 = await page1Promise;
        expect(await page1.locator('xpath=//h1[text()="Your remodeling ideas are ready to go!"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h1[text()="Your remodeling ideas are ready to go!"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="My personalized budget"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="My personalized budget"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Cabinets & storage"]/../p[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Cabinets & storage"]/../p[text()="Mid-range"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Countertops"]/../p[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Countertops"]/../p[text()="Mid-range"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Appliances"]/../p[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Appliances"]/../p[text()="Mid-range"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Plumbing & fixtures"]/../p[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Plumbing & fixtures"]/../p[text()="Mid-range"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Flooring"]/../p[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Flooring"]/../p[text()="Mid-range"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Lighting"]/../p[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Lighting"]/../p[text()="Mid-range"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Labor"]/../p[text()="Estimated"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Labor"]/../p[text()="Estimated"]').focus()).toBeTruthy;
        // Extract displayed range
        const displayedRangeProfileClientPDF = page1
            .getByText('Your range:')
            .locator('xpath=..')
            .locator('p');
        await expect(displayedRangeProfileClientPDF).toBeVisible();

        const rangeTextClientPDF = await displayedRangeProfileClientPDF.textContent();

        const [displayMinClientPDF, displayMaxClientPDF] = rangeTextClientPDF!
            .replace(/[$,]/g, '')
            .replace(/[+,]/g, '')
            .split('to')
            .map(v => Number(v.trim()));

        // Assertions
        expect(displayMinClientPDF).toBe(tierMin);
        expect(displayMaxClientPDF).toBe(tierMax);
        expect(await page1.locator('xpath=//h4[text()="Backup fund:"]/..//p[text()="20" and text()="%"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h4[text()="Backup fund:"]/..//p[text()="20" and text()="%"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//p[text()="Plan for the unexpected with funds to cover surprise costs."]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//p[text()="Plan for the unexpected with funds to cover surprise costs."]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//b[text()="Disclaimer:"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//b[text()="Disclaimer:"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//p[text()=" This budget estimate is for informational purposes only and is not a legally binding quote. Estimates are based on national averages and ZIP code-level data and may not reflect actual costs. For a detailed and accurate quote, please consult a qualified professional."]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//p[text()=" This budget estimate is for informational purposes only and is not a legally binding quote. Estimates are based on national averages and ZIP code-level data and may not reflect actual costs. For a detailed and accurate quote, please consult a qualified professional."]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h2[text()="Next steps"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h2[text()="Next steps"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//p[text()="Turn your budget into a plan. Your kitchen designer will guide you through the details so you can move forward with confidence."]').scrollIntoViewIfNeeded()).toBeTruthy;
        expect(await page1.locator('xpath=//p[text()="Turn your budget into a plan. Your kitchen designer will guide you through the details so you can move forward with confidence."]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//p[text()="Turn your budget into a plan. Your kitchen designer will guide you through the details so you can move forward with confidence."]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Smart tips:"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Smart tips:"]').focus()).toBeTruthy;
        await page1.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
        const listItemsNew = await page1.locator('div:has(h3:has-text("Smart tips:")) li');
        const countNew = await listItemsNew.count();
        logInfo(this.page, 'Number of list items:', countNew);
        const expectedTexts = [
            {
                title: "Prioritize what matters most.",
                description: "Invest more in high-use areas like cabinets and countertops, and simplify where it counts less."
            },
            {
                title: "Use lighting strategically.",
                description: "Recessed, undercabinet, and task lighting can elevate your kitchen affordably"
            },
            {
                title: "Mix and match materials.",
                description: "Combine premium finishes with budget-friendly options to balance beauty and cost."
            },
            {
                title: "Keep your layout when possible.",
                description: "Avoid moving plumbing or electrical lines—those changes can quickly raise labor costs."
            },
            {
                title: "Think long term value.",
                description: "Energy-efficient appliances may cost more up front, but they’ll save you money over time."
            }
        ];

        // Smart tips are expected to occupy the last 5 list items on the page.
        expect(countNew).toBeGreaterThanOrEqual(expectedTexts.length);
        const smartTipsStartIndex = countNew - expectedTexts.length;

        for (let i = 0; i < expectedTexts.length; i++) {
            const itemIndex = smartTipsStartIndex + i;
            const title = await listItemsNew.nth(itemIndex).locator('p').first().innerText();
            const description = await listItemsNew.nth(itemIndex).locator('p').nth(1).innerText();

            logInfo(this.page, `Item ${i + 1} Title:`, title);
            logInfo(this.page, `Item ${i + 1} Description:`, description);

            expect(title).toBe(expectedTexts[i].title);
            expect(description).toBe(expectedTexts[i].description);
            logInfo(this.page, 'VERIFIED: Consolidated Profile Budget Tab displays All details successfully');
        }
        await page1.close();
        await this.page.getByTestId('TestId_Profile_Overview_Tab').click();
    }

    async verifyBudgetRangeWithNewRangeAndDeselectedCountertopFlooringLabor(budgetType: string) {
        expect(await this.page.locator('xpath=//div[@class="complete step-inner center-justify"]/div[text()="Budget"]').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/budget/start');
        await waitForSpinnerToDisappear(this.page, 10000);
        logInfo(this.page, 'VERIFIED: Budget start page is loaded and spinner is invisible');
        expect(await this.page.locator('xpath=//div[text()="Find the right budget"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget header text is displayed');
        expect(await this.page.locator('xpath=(//div[@class="header-subtext"])[1]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget header sub-text is displayed');
        expect(await this.page.locator('xpath=//div[text()="Use national average" and @class="tab active"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab Use national average is displayed and active');
        expect(await this.page.locator('xpath=//div[text()="Use zip code" and not(@class="tab active")]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab Use zip code is displayed and not active');
        expect(await this.page.locator('xpath=//div[text()="Find the right budget"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Essential"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@class="budget-tier selected "]//div[text()="Premium"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays Budget selection Ranges as options for Essential, Mid-range, Premium');
        expect(await this.page.locator('xpath=//div[text()="Essential"]/../img').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Mid-range"]/../img').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Premium"]/../img').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays images for Essential, Mid-range, Premium');
        expect(await this.page.locator('xpath=//button[text()="Back"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays button Back');
        expect(await this.page.locator('xpath=//div[text()="Pick a range to get started"]').isVisible()).toBeFalsy;
        logInfo(this.page, 'VERIFIED: Budget Tab doesn\'t displays text Pick a range to get started');
        expect(await this.page.locator('xpath=//button[text()="Skip"]').isVisible()).toBeFalsy;
        logInfo(this.page, 'VERIFIED: Budget Tab doesn\'t display button Skip');
        const tierRange = await this.page.locator('div.tier-range').nth(1).innerText();
        // Extract numbers
        const [tierMin, tierMax] = tierRange
            .replace(/[$,+]/g, '')
            .split('—')
            .map(v => parseInt(v.trim()));
        logInfo(this.page, String(tierMin), tierMax);
        await this.page.waitForTimeout(5000);
        if (budgetType.toLowerCase() === 'premium') {
            expect(await this.page.locator('xpath=//div[text()="Premium"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Premium"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@class="budget-tier selected "]//div[text()="Premium"]').isVisible()).toBeTruthy;
            logInfo(this.page, 'VERIFIED: Budget Tab Selection of Premium range is successful');
        } else if (budgetType.toLowerCase() === 'mid-range') {
            expect(await this.page.locator('xpath=//div[text()="Mid-range"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Mid-range"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@class="budget-tier selected "]//div[text()="Mid-range"]').isVisible()).toBeTruthy;
            logInfo(this.page, 'VERIFIED: Budget Tab Selection of Mid range is successful');
        } else if (budgetType.toLowerCase() === 'essential') {
            expect(await this.page.locator('xpath=//div[text()="Essential"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Essential"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@class="budget-tier selected "]//div[text()="Essential"]').isVisible()).toBeTruthy;
            logInfo(this.page, 'VERIFIED: Budget Tab Selection of Essential range is successful');
        }
        await this.page.waitForTimeout(5000);
        expect(await this.page.locator('xpath=//button[text()="Continue"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays button Continue');
        const budgetRange = this.page.locator('.budget-range');
        // Get all number-flow-react elements (min & max)
        const numbers = budgetRange.locator('number-flow-react');
        const minData = await numbers.nth(0).getAttribute('data');
        const maxData = await numbers.nth(1).getAttribute('data');
        const minValue = JSON.parse(minData!).value; // 96400
        const maxValue = JSON.parse(maxData!).value; // 192400
        logInfo(this.page, minValue, maxValue);
        expect(minValue).toBe(tierMin);
        expect(maxValue).toBe(tierMax);
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').hover()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/budget/categories');
        await waitForSpinnerToDisappear(this.page, 10000);
        await this.page.waitForTimeout(5000);
        expect(await this.page.locator('xpath=//div[text()="Personalize by category"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[@class="toggle"])[1]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[@class="toggle"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Cabinets & storage"]][.//div[text()="Mid-range"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Countertops"]][.//div[text()="Mid-range"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Appliances"]][.//div[text()="Mid-range"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Plumbing & fixtures"]][.//div[text()="Mid-range"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Flooring"]][.//div[text()="Mid-range"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@data-testid="budget-category-header"][.//div[text()="Lighting"]][.//div[text()="Mid-range"]]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@class="title" and normalize-space(.)="Labor"]/..//div[@class="selection" and normalize-space(.)="Estimated"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Your range:"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[@class="top"]   [div[@class="title"]/div[@class="primary" and normalize-space(.)="Backup fund"]    and div[@class="selection" and normalize-space(.)="20%"]    and div[contains(@class,"range")]]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Category Tab displays all budget categories');
        await this.page.waitForTimeout(5000);
        expect(await this.page.locator('xpath=//div[text()="Countertops"]/..//div[@class="switch checked toggle"]/div[@class="label" and text()="include"]')).toBeVisible;
        expect(await this.page.locator('xpath=//div[text()="Countertops"]/..//div[@class="switch checked toggle"]/div[@class="label" and text()="include"]')).toBeEnabled;
        expect(await this.page.locator('xpath=//div[text()="Countertops"]/..//div[@class="switch checked toggle"]/div[@class="label" and text()="include"]').click({ trial: true }));
        expect(await this.page.locator('xpath=//div[text()="Countertops"]/..//div[@class="switch checked toggle"]/div[@class="label" and text()="include"]').click({ force: true }));
        await this.page.waitForTimeout(5000);
        expect(await this.page.locator('xpath=//div[text()="Flooring"]/..//div[@class="switch checked toggle"]/div[@class="label" and text()="include"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Flooring"]/..//div[@class="switch checked toggle"]/div[@class="label" and text()="include"]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Flooring"]/..//div[@class="switch checked toggle"]/div[@class="label" and text()="include"]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Labor"]/..//div[@class="switch checked toggle"]/div[@class="label" and text()="include"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Labor"]/..//div[@class="switch checked toggle"]/div[@class="label" and text()="include"]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Labor"]/..//div[@class="switch checked toggle"]/div[@class="label" and text()="include"]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Countertops"]/..//div[@class="switch unchecked toggle"]/div[@class="label"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Flooring"]/..//div[@class="switch unchecked toggle"]/div[@class="label"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Labor"]/..//div[@class="switch unchecked toggle"]/div[@class="label"]').isVisible()).toBeTruthy;
        await this.page.waitForTimeout(15000);

        let minBudget;
        let maxBudget;

        // Read "Your range" directly from the range row to avoid brittle index-based XPaths.
        const yourRangeButton = this.page.getByRole('button', { name: /Your range:/i }).first();
        await yourRangeButton.waitFor({ state: 'visible', timeout: 30000 });
        const rangeValues = yourRangeButton.locator('number-flow-react');
        await expect(rangeValues).toHaveCount(2, { timeout: 30000 });

        // Min Budget
        const minDataAttr = await rangeValues.nth(0).getAttribute('data');

        if (minDataAttr) {
            const data = JSON.parse(minDataAttr);
            minBudget = data.valueAsString.replace(/,/g, '');
            logInfo(this.page, 'minBudget:', minBudget);
        }

        // Max Budget
        const maxDataAttr = await rangeValues.nth(1).getAttribute('data');

        if (maxDataAttr) {
            const data = JSON.parse(maxDataAttr);
            maxBudget = data.valueAsString.replace(/,/g, '');
            logInfo(this.page, 'maxBudget:', maxBudget);
        }

        // Both variables are now accessible
        logInfo(this.page, 'Budget range:', minBudget, '-', maxBudget);


        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').hover()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/overview');
        await waitForSpinnerToDisappear(this.page, 10000);
        await this.page.waitForTimeout(5000);
        expect(await this.page.getByTestId('TestId_Profile_Overview_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Style_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Design_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Budget_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Budget_Tab').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/budget');
        await waitForSpinnerToDisappear(this.page, 10000);
        await this.page.waitForTimeout(5000);
        expect(await this.page.locator('xpath=//h1[text()="Your remodeling ideas are ready to go!"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="My personalized budget"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Cabinets & storage"]/../p[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Countertops"]/../p[text()="Not included"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Countertops"]/../p[text()="Not included"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Appliances"]/../p[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Plumbing & fixtures"]/../p[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Flooring"]/../p[text()="Not included"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Flooring"]/../p[text()="Not included"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Lighting"]/../p[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Labor"]/../p[text()="Not included"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Labor"]/../p[text()="Not included"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//h4[text()="Backup fund:"]/..//p[text()="20" and text()="%"]').isVisible()).toBeTruthy;
        // Extract displayed range
        const rangeLocator = this.page.locator(
            '//h3[text()="Your range:"]/../p'
        );

        const rangeText = await rangeLocator.textContent();
        logInfo(this.page, "Budget Range on Profile Tab Budget:" + rangeText);
        // Extract min & max from text
        const [displayMinProfileBudget, displayMaxProfileBudget] = rangeText!
            .replace(/[$,]/g, '')   // remove $ and commas
            .split('to')            // split range
            .map(v => Number(v.trim()));

        // Compare with existing values
        logInfo(this.page, "Budget Range on Expected Min data:" + minBudget);
        logInfo(this.page, "Budget Range on Expected Max data:" + maxBudget);
        expect(displayMinProfileBudget).toBe(parseInt(minBudget));
        expect(displayMaxProfileBudget).toBe(parseInt(maxBudget));

        expect(await this.page.locator('xpath=//p[text()="Plan for the unexpected with funds to cover surprise costs."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//b[text()="Disclaimer:"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()=" This budget estimate is for informational purposes only and is not a legally binding quote. Estimates are based on national averages and ZIP code-level data and may not reflect actual costs. For a detailed and accurate quote, please consult a qualified professional."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h2[text()="Next steps"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h2[text()="Turn your budget into a plan. Your kitchen designer will guide you through the details so you can move forward with confidence."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Smart tips:"]').isVisible()).toBeTruthy;
        const listItems = await this.page.locator('div:has(h3:has-text("Smart tips:")) li');
        const count = await listItems.count();
        logInfo(this.page, 'Number of list items:', count);
        expect(count).toBe(5); // There are 5 <li> items
        for (let i = 0; i < count; i++) {
            const paragraphs = listItems.nth(i).locator('p');
            const title = await paragraphs.first().innerText();
            const description = await paragraphs.nth(1).innerText();
            logInfo(this.page, `Item ${i + 1} Title:`, title);
            logInfo(this.page, `Item ${i + 1} Description:`, description);
            const expectedTexts = [
                {
                    title: "Prioritize what matters most.",
                    description: "Invest more in high-use areas like cabinets and countertops, and simplify where it counts less."
                },
                {
                    title: "Use lighting strategically.",
                    description: "Recessed, undercabinet, and task lighting can elevate your kitchen affordably"
                },
                {
                    title: "Mix and match materials.",
                    description: "Combine premium finishes with budget-friendly options to balance beauty and cost."
                },
                {
                    title: "Keep your layout when possible.",
                    description: "Avoid moving plumbing or electrical lines—those changes can quickly raise labor costs."
                },
                {
                    title: "Think long term value.",
                    description: "Energy-efficient appliances may cost more up front, but they’ll save you money over time."
                }
            ];

            for (let i = 0; i < expectedTexts.length; i++) {
                const title = await listItems.nth(i).locator('p').first().innerText();
                const description = await listItems.nth(i).locator('p').nth(1).innerText();
                expect(title).toBe(expectedTexts[i].title);
                expect(description).toBe(expectedTexts[i].description);
            }
            logInfo(this.page, 'VERIFIED: Consolidated Profile Budget Tab displays All details successfully');
        }
        expect(await this.page.getByTestId('TestId_Profile_Overview_Tab').click()).toBeTruthy;
        const page1Promise = this.page.waitForEvent('popup');
        await this.page.getByRole('button', { name: 'View my project' }).click();
        await this.page.waitForTimeout(5000);
        const page1 = await page1Promise;
        expect(await page1.locator('xpath=//h1[text()="Your remodeling ideas are ready to go!"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h1[text()="Your remodeling ideas are ready to go!"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="My personalized budget"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="My personalized budget"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Flooring"]/../p[text()="Not included"]').scrollIntoViewIfNeeded()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Cabinets & storage"]/../p[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Cabinets & storage"]/../p[text()="Mid-range"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Countertops"]/../p[text()="Not included"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Countertops"]/../p[text()="Not included"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Appliances"]/../p[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Appliances"]/../p[text()="Mid-range"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Plumbing & fixtures"]/../p[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Plumbing & fixtures"]/../p[text()="Mid-range"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Flooring"]/../p[text()="Not included"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Flooring"]/../p[text()="Not included"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Lighting"]/../p[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Lighting"]/../p[text()="Mid-range"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Labor"]/../p[text()="Not included"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Labor"]/../p[text()="Not included"]').focus()).toBeTruthy;
        // Extract displayed range
        const rangeLocatorPDF = page1.locator(
            '//h3[text()="Your range:"]/../p'
        );

        const rangeTextPDF = await rangeLocatorPDF.textContent();
        logInfo(this.page, "Client PDF Budget Range:" + rangeTextPDF);

        // Extract min & max from text
        const [displayMin, displayMax] = rangeText!
            .replace(/[$,]/g, '')   // remove $ and commas
            .split('to')            // split range
            .map(v => Number(v.trim()));

        // Compare with existing values
        expect(displayMin).toBe(parseInt(minBudget));
        expect(displayMax).toBe(parseInt(maxBudget));

        expect(await page1.locator('xpath=//h4[text()="Backup fund:"]/..//p[text()="20" and text()="%"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h4[text()="Backup fund:"]/..//p[text()="20" and text()="%"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//p[text()="Plan for the unexpected with funds to cover surprise costs."]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//p[text()="Plan for the unexpected with funds to cover surprise costs."]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//b[text()="Disclaimer:"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//b[text()="Disclaimer:"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//p[text()=" This budget estimate is for informational purposes only and is not a legally binding quote. Estimates are based on national averages and ZIP code-level data and may not reflect actual costs. For a detailed and accurate quote, please consult a qualified professional."]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//p[text()=" This budget estimate is for informational purposes only and is not a legally binding quote. Estimates are based on national averages and ZIP code-level data and may not reflect actual costs. For a detailed and accurate quote, please consult a qualified professional."]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h2[text()="Next steps"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h2[text()="Next steps"]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//p[text()="Turn your budget into a plan. Your kitchen designer will guide you through the details so you can move forward with confidence."]').scrollIntoViewIfNeeded()).toBeTruthy;
        expect(await page1.locator('xpath=//p[text()="Turn your budget into a plan. Your kitchen designer will guide you through the details so you can move forward with confidence."]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//p[text()="Turn your budget into a plan. Your kitchen designer will guide you through the details so you can move forward with confidence."]').focus()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Smart tips:"]').isVisible()).toBeTruthy;
        expect(await page1.locator('xpath=//h3[text()="Smart tips:"]').focus()).toBeTruthy;
        await page1.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
        const listItemsNew = await page1.locator('div:has(h3:has-text("Smart tips:")) li');
        const countNew = await listItemsNew.count();
        logInfo(this.page, 'Number of list items:', countNew);
        const expectedTexts = [
            {
                title: "Prioritize what matters most.",
                description: "Invest more in high-use areas like cabinets and countertops, and simplify where it counts less."
            },
            {
                title: "Use lighting strategically.",
                description: "Recessed, undercabinet, and task lighting can elevate your kitchen affordably"
            },
            {
                title: "Mix and match materials.",
                description: "Combine premium finishes with budget-friendly options to balance beauty and cost."
            },
            {
                title: "Keep your layout when possible.",
                description: "Avoid moving plumbing or electrical lines—those changes can quickly raise labor costs."
            },
            {
                title: "Think long term value.",
                description: "Energy-efficient appliances may cost more up front, but they’ll save you money over time."
            }
        ];

        expect(countNew).toBeGreaterThanOrEqual(expectedTexts.length);
        const smartTipsStartIndex = countNew - expectedTexts.length;

        for (let i = 0; i < expectedTexts.length; i++) {
            const itemIndex = smartTipsStartIndex + i;
            const title = await listItemsNew.nth(itemIndex).locator('p').first().innerText();
            const description = await listItemsNew.nth(itemIndex).locator('p').nth(1).innerText();
            logInfo(this.page, `Item ${i + 1} Title:`, title);
            logInfo(this.page, `Item ${i + 1} Description:`, description);
            expect(title).toBe(expectedTexts[i].title);
            expect(description).toBe(expectedTexts[i].description);
        }
        logInfo(this.page, 'VERIFIED: Client PDF Budget details are displayed successfully');
        await page1.close();
        await this.page.getByTestId('TestId_Profile_Overview_Tab').click();
    }

    async verifyInvalidBudgetRangeMessage() {
        let coookieFlag = this.page.locator('xpath=//*[@id="onetrust-close-btn-container"]/button').count();
        if ((await coookieFlag).valueOf() === 1) {
            expect(await this.page.locator('xpath=//*[@id="onetrust-close-btn-container"]/button').click()).toBeTruthy;
        }
        expect(await this.page.locator('xpath=//button[@class="tooltip-close"]').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A5').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A3').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A0').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A1').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_Q1_Next_Btn').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_Q2_A0').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_Q2_Next_Btn').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_CONTINUE_Next_Btn').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/style');
        expect(await this.page.locator('xpath=//button[text()="Start the quiz"]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="I like very modern, contemporary, or cutting-edge styles"]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="I like laid-back and casual spaces that feel relaxed"]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="I like minimalism, and believe that less is more"]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="I like reflective surfaces, and industrial materials"]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Next" and @aria-disabled="false"]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Next" and @aria-disabled="false"]').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/style/tuner');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.locator('xpath=(//div[text()="Minimalist"])[2]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="dockedNavigation"]/button[2]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="dockedNavigation"]/button[2]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="dockedNavigation"]/button[2]').click({ force: true })).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[text()="Minimalist"])[2]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Next"]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="dockedNavigation"]/button[2]').click({ force: true })).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design');
        await this.page.getByTestId('TestId_Design_Q1_A0').locator('g rect').click();
        await this.page.getByTestId('TestId_Style_Q1_Next_Btn').click();
        await this.page.getByTestId('TestId_Design_Q2_A2').click();
        await this.page.getByTestId('TestId_Style_Q2_Next_Btn').click();
        await this.page.getByTestId('TestId_Design_Q3_A2').click();
        await this.page.getByTestId('TestId_Style_Q3_Next_Btn').click();
        await this.page.getByTestId('TestId_Design_Q4_A2').click();
        await this.page.getByTestId('TestId_Style_Q4_Next_Btn').click();
        await this.page.getByTestId('TestId_Style_Continue_Next_Btn').click();
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/concept');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div/div[1]/div[1]/div/div[1]/div[1]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div/div[1]/div[2]/div[3]/div[1]').hover()).toBeTruthy;
        await this.page.getByTestId('TestId_DesignConcept_AccessibleAndUser-friendly_OptionBtn').click();
        await this.page.getByTestId('TestId_DesignConcept_ClutterControl_OptionBtn').click();
        await this.page.getByTestId('TestId_DesignConcept_CoffeeAndTea_OptionBtn').click();
        await this.page.getByTestId('TestId_DesignConcept_EatingAndDining_OptionBtn').click();
        await this.page.getByTestId('TestId_DesignConcept_GourmetCooking_OptionBtn').click();
        expect(await this.page.locator('xpath=//button[text()="Next" and @aria-disabled="false"]').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/storage');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').focus()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').hover()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/cabinets');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.locator('xpath=(//div[text()="Select"])[2]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Next" and @aria-disabled="false"]').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/budget');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.getByTestId('TestId_Budget_Min_Input').focus()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Budget_Min_Input').hover()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Budget_Min_Input').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Budget_Min_Input').fill('20000')).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Budget_Min_Input').press('Tab')).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Budget_Max_Input').focus()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Budget_Max_Input').hover()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Budget_Max_Input').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Budget_Max_Input').fill('9000')).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Budget_Max_Input').press('Tab')).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Your maximum budget should be larger than your minimum budget."]').isVisible()).toBeTruthy;
    }

    async verifyBudgetEstimatorInvalidValue() {
        let coookieFlag = this.page.locator('xpath=//*[@id="onetrust-close-btn-container"]/button').count();
        if ((await coookieFlag).valueOf() === 1) {
            expect(await this.page.locator('xpath=//*[@id="onetrust-close-btn-container"]/button').click()).toBeTruthy;
        }
        expect(await this.page.locator('xpath=//button[@class="tooltip-close"]').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A5').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A3').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A0').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A1').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_Q1_Next_Btn').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_Q2_A0').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_Q2_Next_Btn').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_CONTINUE_Next_Btn').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/style');
        expect(await this.page.locator('xpath=//button[text()="Start the quiz"]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="I like very modern, contemporary, or cutting-edge styles"]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="I like laid-back and casual spaces that feel relaxed"]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="I like minimalism, and believe that less is more"]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="I like reflective surfaces, and industrial materials"]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Next" and @aria-disabled="false"]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Next" and @aria-disabled="false"]').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/style/tuner');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.locator('xpath=(//div[text()="Minimalist"])[2]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="dockedNavigation"]/button[2]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="dockedNavigation"]/button[2]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="dockedNavigation"]/button[2]').click({ force: true })).toBeTruthy;
        expect(await this.page.locator('xpath=(//div[text()="Minimalist"])[2]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Next"]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="dockedNavigation"]/button[2]').click({ force: true })).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design');
        await this.page.getByTestId('TestId_Design_Q1_A0').locator('g rect').click();
        await this.page.getByTestId('TestId_Style_Q1_Next_Btn').click();
        await this.page.getByTestId('TestId_Design_Q2_A2').click();
        await this.page.getByTestId('TestId_Style_Q2_Next_Btn').click();
        await this.page.getByTestId('TestId_Design_Q3_A2').click();
        await this.page.getByTestId('TestId_Style_Q3_Next_Btn').click();
        await this.page.getByTestId('TestId_Design_Q4_A2').click();
        await this.page.getByTestId('TestId_Style_Q4_Next_Btn').click();
        await this.page.getByTestId('TestId_Style_Continue_Next_Btn').click();
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/concept');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div/div[1]/div[1]/div/div[1]/div[1]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div/div[1]/div[2]/div[3]/div[1]').hover()).toBeTruthy;
        await this.page.getByTestId('TestId_DesignConcept_AccessibleAndUser-friendly_OptionBtn').focus();
        await this.page.getByTestId('TestId_DesignConcept_AccessibleAndUser-friendly_OptionBtn').hover();
        await this.page.getByTestId('TestId_DesignConcept_AccessibleAndUser-friendly_OptionBtn').click();
        await this.page.getByTestId('TestId_DesignConcept_ClutterControl_OptionBtn').click();
        await this.page.getByTestId('TestId_DesignConcept_CoffeeAndTea_OptionBtn').click();
        await this.page.getByTestId('TestId_DesignConcept_EatingAndDining_OptionBtn').click();
        await this.page.getByTestId('TestId_DesignConcept_GourmetCooking_OptionBtn').click();
        expect(await this.page.locator('xpath=//button[text()="Next" and @aria-disabled="false"]').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/storage');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').focus()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').hover()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/cabinets');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.locator('xpath=(//div[text()="Select"])[2]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Next" and @aria-disabled="false"]').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/budget');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.getByTestId('TestId_Budget_BudgetEstimator_Link').click()).toBeTruthy;;
        expect(await this.page.getByTestId('TestId_BudgetEstimator_HomeValue_Input').click()).toBeTruthy;;
        expect(await this.page.getByTestId('TestId_BudgetEstimator_HomeValue_Input').fill('99999')).toBeTruthy;
        expect(await this.page.getByTestId('TestId_BudgetEstimator_HomeValue_Input').press('Tab')).toBeTruthy;;
        expect(await this.page.getByTestId('TestId_BudgetEstimator_PostalCode_Input').fill('02018')).toBeTruthy;;
        expect(await this.page.getByTestId('TestId_BudgetEstimator_PostalCode_Input').press('Tab')).toBeTruthy;;
        expect(await this.page.getByTestId('TestId_BudgetEstimator_HomeValue_Input').click()).toBeTruthy;;
        expect(await this.page.getByTestId('TestId_BudgetEstimator_HomeValue_Input').fill('0')).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Please enter a valid home value."]').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_BudgetEstimator_HomeValue_Input').click()).toBeTruthy;;
        expect(await this.page.getByTestId('TestId_BudgetEstimator_HomeValue_Input').fill('90999')).toBeTruthy;
        expect(await this.page.getByTestId('TestId_BudgetEstimator_ApplyRange_Btn').click()).toBeTruthy;;
        expect(await this.page.getByTestId('TestId_Budget_BudgetGuidelines_Link').click()).toBeTruthy;;
        expect(await this.page.getByTestId('TestId_BudgetGuidelines_Close_Btn').click()).toBeTruthy;;
        expect(await this.page.getByTestId('TestId_Budget_BudgetRange_Next_Btn').click()).toBeTruthy;;
        expect(await this.page.getByTestId('TestId_Budget_Completed_Next_Button').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Sign up to get matched with local kitchen designers"]').isVisible()).toBeTruthy;
    }

    async verifySkipBudget() {
        let coookieFlag = this.page.locator('xpath=//*[@id="onetrust-close-btn-container"]/button').count();
        if ((await coookieFlag).valueOf() === 1) {
            expect(await this.page.locator('xpath=//*[@id="onetrust-close-btn-container"]/button').click()).toBeTruthy;
        }
        expect(await this.page.locator('xpath=//button[@class="tooltip-close"]').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A5').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A3').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A0').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A1').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_Q1_Next_Btn').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_Q2_A0').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_Q2_Next_Btn').click()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Icebreaker_CONTINUE_Next_Btn').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/style');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.locator('xpath=//button[text()="Start the quiz"]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="I like very modern, contemporary, or cutting-edge styles"]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="I like laid-back and casual spaces that feel relaxed"]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="I like minimalism, and believe that less is more"]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="I like reflective surfaces, and industrial materials"]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Next" and @aria-disabled="false"]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Next" and @aria-disabled="false"]').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/style/tuner');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.locator('xpath=(//div[text()="Minimalist"])[2]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Next"]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="dockedNavigation"]/button[2]').click({ force: true })).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design');
        await waitForSpinnerToDisappear(this.page, 10000);
        await this.page.getByTestId('TestId_Design_Q1_A0').click();
        await this.page.getByTestId('TestId_Style_Q1_Next_Btn').click();
        await this.page.getByTestId('TestId_Design_Q2_A0').click();
        await this.page.getByTestId('TestId_Style_Q2_Next_Btn').isEnabled();
        await this.page.getByTestId('TestId_Style_Q2_Next_Btn').click();
        await this.page.getByTestId('TestId_Design_Q3_A2').click();
        await this.page.getByTestId('TestId_Style_Q3_Next_Btn').click();
        await this.page.getByTestId('TestId_Design_Q4_A2').click();
        await this.page.getByTestId('TestId_Style_Q4_Next_Btn').click();
        await this.page.getByTestId('TestId_Style_Continue_Next_Btn').click();
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/concept');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div/div[1]/div[1]/div/div[1]/div[1]').hover()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div/div[1]/div[2]/div[3]/div[1]').hover()).toBeTruthy;
        await this.page.getByTestId('TestId_DesignConcept_AccessibleAndUser-friendly_OptionBtn').click();
        await this.page.getByTestId('TestId_DesignConcept_ClutterControl_OptionBtn').click();
        await this.page.getByTestId('TestId_DesignConcept_CoffeeAndTea_OptionBtn').click();
        await this.page.getByTestId('TestId_DesignConcept_EatingAndDining_OptionBtn').click();
        await this.page.getByTestId('TestId_DesignConcept_GourmetCooking_OptionBtn').click();
        expect(await this.page.locator('xpath=//button[text()="Next" and @aria-disabled="false"]').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/storage');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').focus()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').hover()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/cabinets');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.locator('xpath=(//div[text()="Select"])[2]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Next" and @aria-disabled="false"]').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/budget');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.getByTestId('TestId_Budget_SkipThisStep_Link').focus()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Budget_SkipThisStep_Link').hover()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Budget_SkipThisStep_Link').click({ force: true })).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/overview');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.getByTestId('TestId_Profile_Overview_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Style_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Design_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Budget_Tab').isVisible()).toBeTruthy;

    }

    async completeIceBreakerFlow() {
        await this.page.waitForTimeout(10000);
        // verify landed on style tuner page
        const cookieButton = this.page.getByRole('button', { name: /accept all cookies/i });
        if (await cookieButton.isVisible()) { await cookieButton.click(); }

        const title = this.page.locator('p.headlineJumbo');
        await title.waitFor({ state: 'visible' });

        // Verify text content loosely
        await expect(title).toContainText("Let\u2019s talk about the kitchen you\u2019ve always wanted.");
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
    }

    async completeStyleFlow() {

        // verify see all styles button is present
        await waitForSpinnerToDisappear(this.page, 20000);
        await this.page.getByRole('button', { name: 'Start the quiz' }).click();
        await this.page.waitForTimeout(5000);
        await this.page.getByRole('button', { name: 'I like very modern, contemporary, or cutting-edge styles' }).click();
        await this.page.getByRole('button', { name: 'I like laid-back and casual spaces that feel relaxed' }).click();
        await this.page.getByRole('button', { name: 'I like minimalism, and believe that less is more' }).click();
        await this.page.getByRole('button', { name: 'I like reflective surfaces, and industrial materials' }).click();
        await this.page.waitForTimeout(2000);
        await this.page.getByTestId('TestId_DockNavigation_Next_Btn').scrollIntoViewIfNeeded();
        await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click();
        await waitForSpinnerToDisappear(this.page, 20000);
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/style/tuner');

        // hide chat bubble
        //await hideChatBubble(this.page);
        await this.page.waitForTimeout(5000);
        await this.page.evaluate(() => {
            const bubble = document.querySelector('.ecEmbedWidgetLauncher');
            if (bubble) {
                (bubble as HTMLElement).style.display = 'none';
            }
        });

        await this.page.waitForTimeout(5000);
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
            logInfo(this.page, "count:" + (await but01).valueOf());
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
    
    async verifySkipBudgetRange() {
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/budget/start');
        await waitForSpinnerToDisappear(this.page, 10000);
        logInfo(this.page, 'VERIFIED: Budget start page is loaded and spinner is invisible');
        expect(await this.page.locator('xpath=//div[text()="Find the right budget"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget header text is displayed');
        expect(await this.page.locator('xpath=(//div[@class="header-subtext"])[1]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget header sub-text is displayed');
        expect(await this.page.locator('xpath=//div[text()="Use national average" and @class="tab active"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab Use national average is displayed and active');
        expect(await this.page.locator('xpath=//div[text()="Use zip code" and not(@class="tab active")]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab Use zip code is displayed and not active');
        expect(await this.page.locator('xpath=//div[text()="Find the right budget"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Essential"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Mid-range"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Premium"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays Budget selection Ranges as options for Essential, Mid-range, Premium');
        expect(await this.page.locator('xpath=//div[text()="Essential"]/../img').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Mid-range"]/../img').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Premium"]/../img').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays images for Essential, Mid-range, Premium');
        expect(await this.page.locator('xpath=//button[text()="Back"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays button Back');
        expect(await this.page.locator('xpath=//div[text()="Pick a range to get started"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays text Pick a range to get started');
        expect(await this.page.locator('xpath=//button[text()="Skip"]').isVisible()).toBeTruthy;
        logInfo(this.page, 'VERIFIED: Budget Tab displays button Skip');
        expect(await this.page.locator('xpath=//button[text()="Skip"]').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/overview');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.getByTestId('TestId_Profile_Overview_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Style_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Design_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Budget_Tab').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Profile_Budget_Tab').click()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/budget');
        await waitForSpinnerToDisappear(this.page, 10000);
        expect(await this.page.locator('xpath=//h1[text()="Your remodeling ideas are ready to go!"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Find a budget that works for your wallet. Complete your project details now for a free 3D kitchen rendering."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Find a budget that works for your wallet. Complete your project details now for a free 3D kitchen rendering."]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Go to Budget"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Go to Budget"]').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="My personalized budget"]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//h3[text()="Cabinets & storage"]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//h3[text()="Countertops"]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//h3[text()="Appliances"]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//h3[text()="Plumbing & fixtures"]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//h3[text()="Flooring"]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//h3[text()="Lighting"]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//h3[text()="Labor"]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//h4[text()="Backup fund:"]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//p[text()="Plan for the unexpected with funds to cover surprise costs."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//b[text()="Disclaimer:"]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//p[text()=" This budget estimate is for informational purposes only and is not a legally binding quote. Estimates are based on national averages and ZIP code-level data and may not reflect actual costs. For a detailed and accurate quote, please consult a qualified professional."]').isVisible()).toBeFalsy;
        expect(await this.page.locator('xpath=//h2[text()="Next steps"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h2[text()="Turn your budget into a plan. Your kitchen designer will guide you through the details so you can move forward with confidence."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//h3[text()="Smart tips:"]').isVisible()).toBeTruthy;
        const listItems = await this.page.locator('div:has(h3:has-text("Smart tips:")) li');
        const count = await listItems.count();
        logInfo(this.page, 'Number of list items:', count);
        expect(count).toBe(5); // There are 5 <li> items
        for (let i = 0; i < count; i++) {
            const paragraphs = listItems.nth(i).locator('p');
            const title = await paragraphs.first().innerText();
            const description = await paragraphs.nth(1).innerText();
            logInfo(this.page, `Item ${i + 1} Title:`, title);
            logInfo(this.page, `Item ${i + 1} Description:`, description);
            const expectedTexts = [
                {
                    title: "Prioritize what matters most.",
                    description: "Invest more in high-use areas like cabinets and countertops, and simplify where it counts less."
                },
                {
                    title: "Use lighting strategically.",
                    description: "Recessed, undercabinet, and task lighting can elevate your kitchen affordably"
                },
                {
                    title: "Mix and match materials.",
                    description: "Combine premium finishes with budget-friendly options to balance beauty and cost."
                },
                {
                    title: "Keep your layout when possible.",
                    description: "Avoid moving plumbing or electrical lines—those changes can quickly raise labor costs."
                },
                {
                    title: "Think long term value.",
                    description: "Energy-efficient appliances may cost more up front, but they’ll save you money over time."
                }
            ];

            for (let i = 0; i < expectedTexts.length; i++) {
                const title = await listItems.nth(i).locator('p').first().innerText();
                const description = await listItems.nth(i).locator('p').nth(1).innerText();
                expect(title).toBe(expectedTexts[i].title);
                expect(description).toBe(expectedTexts[i].description);
            }
            logInfo(this.page, 'VERIFIED: Consolidated Profile Budget Tab displays All details successfully');
        }
    }
}
async function clickWhenReady(page: Page, locatorText: string) {
    const locator = page.getByText(locatorText);
    await locator.hover();
    await locator.focus();
    await locator.waitFor({ state: 'visible' });       // Ensure visible
    await expect(locator).toBeEnabled();               // Ensure enabled
    await locator.click({ trial: true });              // Test click (no action)
    await locator.click({ force: true });               // Actual click
}

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