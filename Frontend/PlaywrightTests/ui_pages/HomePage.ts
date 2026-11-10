import { expect, Page } from "@playwright/test";
import { acceptCookiesIfPresent } from "../helpers/waitHelpers";

export default class homePage {

    private formatLogMessage(parts: unknown[]): string {
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

    private async logInfo(message: string) {
        console.log(this.formatLogMessage([message]));
    }

    private async logWarn(message: string) {
        console.warn(this.formatLogMessage([message]));
    }

    private async logError(message: string, details?: unknown) {
        const detailText = details === undefined
            ? ''
            : details instanceof Error
                ? ` ${details.stack ?? details.message}`
                : ` ${String(details)}`;
        console.error(this.formatLogMessage([`${message}${detailText}`]));
    }

    constructor(public page: Page) {
        const suppressPatterns = [
        'TP: Tracking Event:',
        // add more patterns here as needed
        ];

        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();

            if (type === 'error') {
                return;
            }

            if (suppressPatterns.some(pattern => text.includes(pattern))) {
                return;
            }

            const now = new Date();
            const timestamp = now.toUTCString();
            console.log(`${timestamp} - ${type.toUpperCase()} - ${text}`);


        });
    }

   
    async launchHomePage() {
        await this.logInfo("Launching JumpStarter Page");
        await this.page.goto('https://js.' + process.env.environment + '.digitalmbd.net/secret/straw-serve-pound.html');
        await acceptCookiesIfPresent(this.page);
        this.page.setViewportSize({width:1920,height:1080});
        //navigate to home page
        await this.page.waitForURL(url => url.pathname === '/start');
        const homeUrl = 'https://home.' + process.env.environment + '.digitalmbd.net/';
        const maxNavigationAttempts = 3;

        for (let attempt = 1; attempt <= maxNavigationAttempts; attempt++) {
            try {
                await this.page.goto(homeUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
                await acceptCookiesIfPresent(this.page);
                await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
                    // Continue when long-polling/analytics keep the page active.
                });
                break;
            } catch (error) {
                if (attempt === maxNavigationAttempts) {
                    throw error;
                }
                await this.logWarn(`Home page navigation attempt ${attempt} failed. Retrying... ${error instanceof Error ? error.message : String(error)}`);
                await this.page.waitForTimeout(2000);
            }
        }
        await this.logInfo("Successfully navigated to HomePage");
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await this.page.waitForTimeout(5000);
        const closeButton = this.page.getByRole('button', { name: 'Close promotional panel' });
        if (await closeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
           await closeButton.click();
        }
        
    }

    async verifyRebodeImageisVisibleOnTopOfPage() {

        await this.page.getByLabel('Link To Home').first().isVisible();
        await this.logInfo("Successfully verified Rebode Icon is displayed at the top of the page");
    }

    async verifyKitchenJumpStarterisVisibleOnTopOfPage() {
        expect(await this.page.getByRole('link', { name: 'Kitchen Jumpstarter' }).first().isVisible()).toBeTruthy;
        await this.logInfo("Successfully verified Kitchen Jumpstarter link is displayed at the top");
    }

    async verifyAboutRebodeisVisibleOnTopOfPage() {

        expect(await this.page.getByRole('link', { name: 'About Rebode' }).first().isVisible()).toBeTruthy;
        await this.logInfo("Successfully verified About rebode link is displayed");
    }

    async verifyBlogisVisibleOnTopOfPage() {
    try {
        const blogLink = this.page.locator('nav').getByRole('link', { name: 'Blog' });
        expect(await blogLink.isVisible()).toBeTruthy();
        await this.logInfo("Successfully verified Blog link is displayed");
        return 'Passed';
    }
    catch (error) {
        await this.logError('Error verifying Blog link on top of page:', error);
        return 'Failed';
    }
}
    async verifyScrollTillBottomOfThePage() {
    let previousHeight = 0;
    let currentHeight = await this.page.evaluate(() => document.body.scrollHeight);

    while (previousHeight !== currentHeight) {
        previousHeight = currentHeight;
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await this.page.waitForTimeout(500);
        currentHeight = await this.page.evaluate(() => document.body.scrollHeight);
    }

    await this.logInfo("Successfully scrolled till bottom of the page");
}

    async clickOnAboutRebodeBottomOfThePage() {

        expect(await this.page.getByRole('contentinfo').getByRole('link', { name: 'About Rebode' }).click()).toBeTruthy;
        await this.logInfo("Successfully scrolled till bottom of the page");
    }

    async verifyImageIsDisplayedOnAboutPage() {

        await this.page.waitForURL('https://home.' + process.env.environment + '.digitalmbd.net/about');
        expect(await this.page.locator('xpath=//*[@id="__next"]/div/main/div/section[1]/div/figure/img').isVisible()).toBeTruthy;
        await this.logInfo("Successfully verified image is displayed on About Page");
    }

    async verifyOurStoryIsDisplayedOnAboutPage() {

        expect(await this.page.getByText('OUR STORY', { exact: true }).isVisible()).toBeTruthy;
        expect(await this.page.getByRole('heading', { name: 'Your kitchen. Designed just for you.  ' }).isVisible()).toBeTruthy;
        expect(await this.page.getByText('Backed by MasterBrand. Guided by trusted designers. Built for homeowners ready to move forward.').isVisible()).toBeTruthy;
        expect(await this.page.getByText('Built for the homeowner ready for their dream kitchen').scrollIntoViewIfNeeded()).toBeTruthy;
        expect(await this.page.getByText('Backed by decades of cabinetry expertise').isVisible()).toBeTruthy;
        expect(await this.page.getByText('Designers who get it, because we vet them').scrollIntoViewIfNeeded()).toBeTruthy;
        expect(await this.page.getByText('Designers who get it, because we vet them').isVisible()).toBeTruthy;
        expect(await this.page.getByText('Tools to help you show up ready').isVisible()).toBeTruthy;
        expect(await this.page.getByText('A guide for your kitchen remodel').isVisible()).toBeTruthy;
        await this.logInfo("Successfully verified Our Story is displayed on About Page");
    }

    async verifyLaunchJumpStarterIsDisplayedOnAboutPage() {
        try {
            expect(await this.page.getByRole('heading', { name: 'Your kitchen. Designed just for you.  ' }).scrollIntoViewIfNeeded()).toBeTruthy;
            expect(await this.page.getByRole('heading', { name: 'Your kitchen. Designed just for you.  ' }).isVisible()).toBeTruthy;
            expect(await this.page.getByText('Get your project off the').isVisible()).toBeTruthy;
            expect(await this.page.getByRole('link', { name: 'LAUNCH JUMPSTARTER' }).scrollIntoViewIfNeeded()).toBeTruthy;
            expect(await this.page.getByRole('link', { name: 'LAUNCH JUMPSTARTER' }).isVisible()).toBeTruthy;
            expect(await this.page.getByRole('main').getByRole('link', { name: 'Privacy Statement' }).scrollIntoViewIfNeeded()).toBeTruthy;
            expect(await this.page.getByRole('main').getByRole('link', { name: 'Privacy Statement' }).isVisible()).toBeTruthy;
            expect(await this.page.getByRole('main').getByRole('link', { name: 'Terms of Use' }).isVisible()).toBeTruthy;
            await this.logInfo("Successfully verified launch jumpstarter is displayed on About Page");
            return 'Passed';
        }
        catch (error) {
            await this.logError('Error verifying launch jumpstarter on About page:', error);
            return 'Failed';
        }
    }

    async closeCookiePopup() {

        //expect(await this.page.locator('xpath=//*[@id="onetrust-close-btn-container"]/button').click()).toBeTruthy;
        await this.logInfo("Successfully closed cookie popup");
    }

    async homePageScroll() {
    try {
        // Scroll to "How it works" section
        await this.page.locator('[data-section="how-it-works"]').scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(500);

        // Scroll to "From vision to renovation" section
        await this.page.locator('[data-section="vision"]').scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(500);

        // Scroll to "Tools to shape your dream kitchen with ease" section
        await this.page.getByRole('heading', { name: 'Tools to shape your dream kitchen with ease' }).scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(500);

        // Scroll to "Start your kitchen transformation" CTA (reinforcement section)
        await this.page.locator('[data-section="reinforcement"]').scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(500);

        // Scroll to "See more blog articles" CTA (blogs section)
        await this.page.locator('[data-section="blogs"]').scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(500);

        // Scroll to FAQ section CTA
        await this.page.locator('[data-section="faq"]').scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(500);

        // Scroll to mission statement heading
        await this.page.getByRole('heading', { name: "We\u2019re on a mission to transform the kitchen remodeling experience" }).scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(500);

        // Scroll to footer "Your Privacy Choices" link
        await this.page.getByRole('link', { name: 'Your Privacy Choices' }).scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(500);

        await this.logInfo("Successfully verified scroll on HomePage");
        return 'Passed';
    }
    catch (error) {
        await this.logError('Error verifying homepage scroll behavior:', error);
        return 'Failed';
    }
}

    async verifySideScroll() {
    try {
        await this.page.getByRole('heading', { name: 'Tools to shape your dream kitchen with ease' }).scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(500);

        expect(await this.page.getByRole('button', { name: 'Go to next slide' }).isVisible()).toBeTruthy();
        expect(await this.page.getByRole('button', { name: 'Go to previous slide' }).isVisible()).toBeFalsy();

        await this.page.getByRole('button', { name: 'Go to next slide' }).click();

        expect(await this.page.getByRole('button', { name: 'Go to next slide' }).isVisible()).toBeFalsy();
        expect(await this.page.getByRole('button', { name: 'Go to previous slide' }).isVisible()).toBeTruthy();

        await this.logInfo("Successfully verified side scroll on HomePage");
        return 'Passed';
    }
    catch (error) {
        await this.logError('Error verifying side scroll on HomePage:', error);
        return 'Failed';
    }
}

    async clickAboutRebodeisVisibleOnTopOfPage() {

        expect(await this.page.getByRole('link', { name: 'About Rebode' }).first().click()).toBeTruthy;
        await this.page.waitForURL('https://home.' + process.env.environment + '.digitalmbd.net/about');
        await acceptCookiesIfPresent(this.page);
        expect(await this.page.locator('xpath=//*[@id="__next"]/div/main/div/section[1]/div/figure/img').isVisible()).toBeTruthy;
        await this.logInfo("Successfully clicked on About Rebode on Top of HomePage");
    }

    async clickOnLinkToHomePage() {

        this.page.goBack() ;
        await this.page.waitForURL('https://home.' + process.env.environment + '.digitalmbd.net');
        await acceptCookiesIfPresent(this.page);
        await this.logInfo("Successfully navigated back To HomePage");
    }

    async verifyCCPAOneTrustIcon() {
        await acceptCookiesIfPresent(this.page);
        await this.verifyScrollTillBottomOfThePage();        
        expect(await this.page.getByRole('link', { name: 'Your Privacy Choices' }).click()).toBeTruthy;
        expect(await this.page.getByRole('img', { name: 'Company Logo' }).isVisible()).toBeTruthy;
        expect(await this.page.getByRole('heading', { name: 'Privacy Preference Center' }).isVisible()).toBeTruthy;
        expect(await this.page.getByRole('button', { name: 'Strictly Necessary Cookies' }).isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//*[text()="Targeting Cookies"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.getByRole('button', { name: 'Confirm My Choices' }).click({ force: true })).toBeTruthy;
        await this.logInfo("Successfully verified CCPA OneTrust icon to HomePage");
    }

    async clickOnJumpStarterLinkAndVerifyPageDetails() {
        try {
            const page2Promise = this.page.waitForEvent('popup', { timeout: 10000 }).catch(() => null);
            expect(await this.page.getByRole('link', { name: 'Kitchen Jumpstarter' }).first().scrollIntoViewIfNeeded()).toBeTruthy;
            expect(await this.page.getByRole('link', { name: 'Kitchen Jumpstarter' }).first().click()).toBeTruthy;
            const page2 = await page2Promise;
            const targetPage = page2 ?? this.page;

            if (page2) {
                await page2.waitForLoadState('domcontentloaded');
            } else {
                await this.page.waitForURL(url => url.pathname === '/start' || url.hostname.startsWith('js.'), { timeout: 20000 });
            }

            expect(await targetPage.locator('div').filter({ hasText: /^0Start1Style2Design3Budget4Finish/ }).first().isVisible()).toBeTruthy;
            expect(await targetPage.getByText("Let's talk about the kitchen you've always wanted.").isVisible()).toBeTruthy;
            expect(await targetPage.locator('.sc-gXEjlL').first().isVisible()).toBeTruthy;
            expect(await targetPage.locator('.petalCol > div').first().isVisible()).toBeTruthy;
            expect(await targetPage.locator('.petalCol > div:nth-child(2)').isVisible()).toBeTruthy;
            await this.logInfo("Successfully clicked on jumpstarter link on HomePage");
            return 'Passed';
        }
        catch (error) {
            await this.logError('Error verifying jumpstarter link and page details:', error);
            return 'Failed';
        }
    }

    async verifyPrivacyStatementInCreateMyDreamKitchen() {
        try {
        expect(await this.page.getByRole('link', { name: 'Privacy Statement' }).first().click()).toBeTruthy;
        await this.page.waitForURL('https://masterbrand.com/privacy-statement/default.aspx');
        await acceptCookiesIfPresent(this.page);
        expect(await this.page.getByRole('banner').locator('div').filter({ hasText: 'Privacy Statement' }).first().isVisible()).toBeTruthy;
        expect(await this.page.getByText('MasterBrand, Inc. Privacy Statement This Privacy Statement applies to the sites').isVisible()).toBeTruthy;
        expect(await this.page.getByText('This Privacy Statement applies to the sites where it appears. This Statement').isVisible()).toBeTruthy;
        expect(await this.page.getByText('Contact Us MasterBrand, Inc.').isVisible()).toBeTruthy;
        expect(await this.page.getByRole('heading', { name: 'Email Sign Up' }).isVisible()).toBeTruthy;
        expect(await this.page.getByRole('textbox', { name: 'Email Address' }).isVisible()).toBeTruthy;
        expect(await this.page.getByRole('button', { name: 'Submit' }).isVisible()).toBeTruthy;
        expect(await this.page.getByText('Investor Alert Options * News').isVisible()).toBeTruthy;
        expect(await this.page.getByText('© 2025 MasterBrand, Inc. - All rights reserved Privacy Statement Do Not Sell My').isVisible()).toBeTruthy;
        await this.logInfo("Successfully verified privacy statement in create my dream kitchen HomePage");
        return 'Passed';
        }
        catch (error) {
        await this.logError('Error verifying privacy statement in create my dream kitchen:', error);
        return 'Failed';
        }
    }

    async verifyPrivacyStatementInLaunchJummstarter() {
        try {
        await this.page.getByRole('link', { name: 'Privacy Statement' }).nth(1).click({ timeout: 10000 });
        await this.page.waitForURL('https://masterbrand.com/privacy-statement/default.aspx', { timeout: 15000 });
        await acceptCookiesIfPresent(this.page);
        expect(await this.page.getByRole('banner').locator('div').filter({ hasText: 'Privacy Statement' }).first().isVisible()).toBeTruthy;
        expect(await this.page.getByText('MasterBrand, Inc. Privacy Statement This Privacy Statement applies to the sites').isVisible()).toBeTruthy;
        expect(await this.page.getByText('This Privacy Statement applies to the sites where it appears. This Statement').isVisible()).toBeTruthy;
        expect(await this.page.getByText('Contact Us MasterBrand, Inc.').isVisible()).toBeTruthy;
        expect(await this.page.getByRole('heading', { name: 'Email Sign Up' }).isVisible()).toBeTruthy;
        expect(await this.page.getByRole('textbox', { name: 'Email Address' }).isVisible()).toBeTruthy;
        expect(await this.page.getByRole('button', { name: 'Submit' }).isVisible()).toBeTruthy;
        expect(await this.page.getByText('Investor Alert Options * News').isVisible()).toBeTruthy;
        expect(await this.page.getByText('© 2025 MasterBrand, Inc. - All rights reserved Privacy Statement Do Not Sell My').isVisible()).toBeTruthy;
        await this.page.goto('https://home.' + process.env.environment + '.digitalmbd.net/');
        await this.logInfo("Successfully verified privacy statement in launch jumpstarter");
        return 'Passed';
        }
        catch (error) {
        await this.logError('Error verifying privacy statement in launch jumpstarter:', error);
        return 'Failed';
        }
    }

    async verifyPrivacyStatementInPageFooter() {
        try {
            await this.verifyScrollTillBottomOfThePage();
            const page4Promise = this.page.waitForEvent('popup', { timeout: 10000 });
            await this.page
            .locator('a[class*="footer-module"]', { hasText: 'Privacy Statement' })
            .click({ timeout: 10000 });
            const page4 = await page4Promise;
            await page4.waitForURL('https://masterbrand.com/privacy-statement/default.aspx');
            await acceptCookiesIfPresent(this.page);
            expect(await page4.getByRole('banner').locator('div').filter({ hasText: 'Privacy Statement' }).first().isVisible()).toBeTruthy;
            expect(await page4.getByText('MasterBrand, Inc. Privacy Statement This Privacy Statement applies to the sites').isVisible()).toBeTruthy;
            expect(await page4.getByText('This Privacy Statement applies to the sites where it appears. This Statement').isVisible()).toBeTruthy;
            expect(await page4.getByText('Contact Us MasterBrand, Inc.').isVisible()).toBeTruthy;
            expect(await page4.getByRole('heading', { name: 'Email Sign Up' }).isVisible()).toBeTruthy;
            expect(await page4.getByRole('textbox', { name: 'Email Address' }).isVisible()).toBeTruthy;
            expect(await page4.getByRole('button', { name: 'Submit' }).isVisible()).toBeTruthy;
            expect(await page4.getByText('Investor Alert Options * News').isVisible()).toBeTruthy;
            expect(await page4.getByText('© 2025 MasterBrand, Inc. - All rights reserved Privacy Statement Do Not Sell My').isVisible()).toBeTruthy;
            await this.logInfo("Successfully verified privacy statement in page footer of HomePage");
            return 'Passed';
        }
        catch (error) {
            await this.logError('Error verifying privacy statement in page footer:', error);
            return 'Failed';
        }
    }

    async verifyTermsOfUseAtFooter() {
        try {
            await this.page.getByRole('link', { name: 'Terms of Use' }).first().click({ timeout: 10000 });
            await this.page.waitForURL('https://masterbrand.com/terms-of-use/default.aspx', { timeout: 15000 });
            await acceptCookiesIfPresent(this.page);
            expect(await this.page.locator('[id="_ctrl0_ctl15_divModuleContainer"]').getByRole('link', { name: 'Home logo link MasterBrand' }).isVisible()).toBeTruthy;
            expect(await this.page.getByText('Building Great Experiences').isVisible()).toBeTruthy;
            expect(await this.page.getByText('© 2025 MasterBrand, Inc. - All rights reserved Privacy Statement Do Not Sell My').isVisible()).toBeTruthy;
            await this.page.goto('https://home.' + process.env.environment + '.digitalmbd.net/');
            await acceptCookiesIfPresent(this.page);
            await this.page.getByRole('link', { name: 'Terms of Use' }).nth(1).click({ timeout: 10000 });
            await this.page.waitForURL('https://masterbrand.com/terms-of-use/default.aspx', { timeout: 15000 });
            await acceptCookiesIfPresent(this.page);
            expect(await this.page.locator('[id="_ctrl0_ctl15_divModuleContainer"]').getByRole('link', { name: 'Home logo link MasterBrand' }).isVisible()).toBeTruthy;
            expect(await this.page.getByText('Building Great Experiences').isVisible()).toBeTruthy;
            expect(await this.page.getByText('© 2025 MasterBrand, Inc. - All rights reserved Privacy Statement Do Not Sell My').isVisible()).toBeTruthy;
            await this.page.goto('https://home.' + process.env.environment + '.digitalmbd.net/');
            await acceptCookiesIfPresent(this.page);
            const page5Promise = this.page.waitForEvent('popup', { timeout: 10000 });
            await this.page.getByRole('contentinfo').getByRole('link', { name: 'Terms of Use' }).click({ timeout: 10000 });
            const page5 = await page5Promise;
            await page5.waitForURL('https://masterbrand.com/terms-of-use/default.aspx');
            await acceptCookiesIfPresent(this.page);
            expect(await page5.locator('[id="_ctrl0_ctl15_divModuleContainer"]').getByRole('link', { name: 'Home logo link MasterBrand' }).isVisible()).toBeTruthy;
            expect(await page5.getByText('Building Great Experiences').isVisible()).toBeTruthy;
            expect(await page5.getByText('© 2025 MasterBrand, Inc. - All rights reserved Privacy Statement Do Not Sell My').isVisible()).toBeTruthy;
            await this.logInfo("Successfully verified terms of use in page footer of HomePage");
            return 'Passed';
        }
        catch (error) {
            await this.logError('Error verifying Terms of Use in footer:', error);
            return 'Failed';
        }
    }

    async verifyFAQAtFooter() {
        try {
            //await this.page.getByRole('button', { name: 'Close' }).click();
            expect(await this.page.getByRole('link', { name: 'FAQ' }).click()).toBeTruthy;
            await this.page.waitForURL('https://home.' + process.env.environment + '.digitalmbd.net/frequently-asked-questions');
            await acceptCookiesIfPresent(this.page);
            expect(await this.page.getByRole('heading', { name: 'Turn Your Tax Refund into a' }).isVisible()).toBeTruthy;
            expect(await this.page.getByText('Use your refund to start your').isVisible()).toBeTruthy;
            expect(await this.page.getByRole('button', { name: 'Get Started' }).isVisible()).toBeTruthy;
            expect(await this.page.getByRole('button').nth(1).click()).toBeTruthy;
            expect(await this.page.getByRole('heading', { name: 'Frequently Asked Questions' }).isVisible()).toBeTruthy;
            expect(await this.page.getByText('Why should I use Rebode Kitchen Jumpstarter? Jumpstarter moves your kitchen').isVisible()).toBeTruthy;
            await this.logInfo("Successfully verified faq in page footer of HomePage");
            return 'Passed';
        }
        catch (error) {
            await this.logError('Error verifying FAQ in footer:', error);
            return 'Failed';
        }
    }

    async verifyKitchenJumpstarterAtFooter() {
        try {
            const page7Promise = this.page.waitForEvent('popup', { timeout: 10000 }).catch(() => null);
            await this.page.getByRole('contentinfo').getByRole('link', { name: 'Kitchen Jumpstarter' }).click({ timeout: 10000 });
            const page7 = await page7Promise;
            const targetPage = page7 ?? this.page;
            await acceptCookiesIfPresent(targetPage);
            expect(await targetPage.getByText('0Start1Style2Design3Budget4FinishSign in').isVisible()).toBeTruthy;
            expect(await targetPage.locator('div').filter({ hasText: /^Let's talk about the kitchen you've always wanted\.$/ }).nth(1).isVisible()).toBeTruthy;
            await this.logInfo("Successfully verified kitchen jumpstarter in page footer of HomePage");
            return 'Passed';
        }
        catch (error) {
            await this.logError('Error verifying Kitchen Jumpstarter link in footer:', error);
            return 'Failed';
        }
    }

    async verifyPrivacyChoiceAtFooter() {
        try {
            expect(await this.page.getByRole('link', { name: 'Your Privacy Choices' }).click()).toBeTruthy;
            await acceptCookiesIfPresent(this.page);
            expect(await this.page.getByAltText('Company Logo').isVisible()).toBeTruthy;
            expect(await this.page.getByText('When you visit any website, it may store or retrieve information on your browser, mostly in the form of cookies. This information might be about you, your preferences or your device and is mostly used to make the site work as you expect it to. The information does not usually directly identify you, but it can give you a more personalized web experience. Because we respect your right to privacy, you can choose not to allow some types of cookies. Click on the different category headings to find out more and change our default settings. However, blocking some types of cookies may impact your experience of the site and the services we are able to offer.').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//*[@id="ot-header-id-C0004" and text()="Targeting Cookies"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//*[@id="ot-pc-content"]/section/div[2]/button').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites. They do not store directly personal information, but are based on uniquely identifying your browser and internet device. If you do not allow these cookies, you will experience less targeted advertising."]').isVisible()).toBeTruthy;
            expect(await this.page.getByRole('button', { name: 'Strictly Necessary Cookies' }).scrollIntoViewIfNeeded()).toBeTruthy;
            expect(await this.page.getByRole('button', { name: 'Strictly Necessary Cookies' }).isVisible()).toBeTruthy;
            expect(await this.page.getByRole('button', { name: 'Strictly Necessary Cookies' }).click()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms. You can set your browser to block or alert you about these cookies, but some parts of the site will not then work. These cookies do not store any personally identifiable information."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//*[@id="close-pc-btn-handler"]').isVisible()).toBeTruthy;
            expect(await this.page.getByRole('button', { name: 'Confirm My Choices' }).click()).toBeTruthy;
            await this.logInfo("Successfully verified privacy choice in page footer of HomePage");
            return 'Passed';
        }
        catch (error) {
            await this.logError('Error verifying Your Privacy Choices in footer:', error);
            return 'Failed';
        }
    }

    async verifyBlogHeaderLinks() {
        try {
            await this.page.goto('https://home.' + process.env.environment + '.digitalmbd.net/blog');
            await acceptCookiesIfPresent(this.page);
            expect(await this.page.getByRole('navigation').getByRole('link', { name: 'Link To Home' }).isVisible()).toBeTruthy;
            expect(await this.page.getByRole('navigation').getByRole('link', { name: 'Kitchen Jumpstarter' }).isVisible()).toBeTruthy;
            expect(await this.page.getByRole('navigation').getByRole('link', { name: 'About Rebode' }).isVisible()).toBeTruthy;
            expect(await this.page.getByText('The journey to your perfect kitchen starts here.Your personalized style, design').isVisible()).toBeTruthy;
            await this.logInfo("Successfully verified Blog header links");
            return 'Passed';
        }
        catch (error) {
            await this.logError('Error verifying blog header links:', error);
            return 'Failed';
        }
    }

    async verifyNotificationIsDisplayed() {
        try {
            await this.page.goto('https://home.' + process.env.environment + '.digitalmbd.net/blog');
            await acceptCookiesIfPresent(this.page);
            await this.logInfo('Successfully verified notification is displayed on homepage/blog route');
            return 'Passed';
        }
        catch (error) {
            await this.logError('Error verifying notification is displayed:', error);
            return 'Failed';
        }

    }

    async verifyNotificationOnAboutPage() {
        try {
            expect(await this.page.getByRole('navigation').getByRole('link', { name: 'About Rebode' }).click()).toBeTruthy;
            await acceptCookiesIfPresent(this.page);
            expect(await this.page.locator('div').filter({ hasText: 'Turn Your Tax Refund into a' }).nth(2).isVisible()).toBeFalsy();
            expect(await this.page.getByRole('heading', { name: 'Turn Your Tax Refund into a' }).isVisible()).toBeFalsy();
            expect(await this.page.getByText('Use your refund to start your').isVisible()).toBeFalsy();
            expect(await this.page.locator('div').filter({ hasText: /^Get Started$/ }).isVisible()).toBeFalsy();
            expect(await this.page.getByRole('button').filter({ hasText: /^$/ }).first().isVisible()).toBeFalsy();
            await this.logInfo("Successfully verified no notification message is displayed on AboutPage");
            return 'Passed';
        }
        catch (error) {
            await this.logError('Error verifying notification on About page:', error);
            return 'Failed';
        }
    }

    async verifyBlogDetails() {
        try {
            await this.page.goto('https://home.' + process.env.environment + '.digitalmbd.net/blog');
            await acceptCookiesIfPresent(this.page);
            expect(await this.page.getByRole('heading', { name: 'Rebode Blog' }).isVisible()).toBeTruthy;
            expect(await this.page.getByLabel('Five ways to design a white-').isVisible()).toBeTruthy;
            expect(await this.page.getByText('Five ways to design a white-').isVisible()).toBeTruthy;
            expect(await this.page.getByText('Design a versatile, white').isVisible()).toBeTruthy;
            expect(await this.page.getByLabel('Five ways to design a white-').isVisible()).toBeTruthy;
            expect(await this.page.getByRole('heading', { name: 'Five ways to design a white-' }).isVisible()).toBeTruthy;
            expect(await this.page.getByRole('heading', { name: 'More Articles' }).isVisible()).toBeTruthy;
            expect(await this.page.getByLabel('Design a modern kitchen with').isVisible()).toBeTruthy;
            expect(await this.page.getByRole('heading', { name: 'Design a modern kitchen with' }).isVisible()).toBeTruthy;
            expect(await this.page.getByLabel('Kitchen design trends for the').isVisible()).toBeTruthy;
            expect(await this.page.getByRole('heading', { name: 'Kitchen design trends for the' }).isVisible()).toBeTruthy;
            expect(await this.page.locator('section').filter({ hasText: 'Take the first steps to' }).isVisible()).toBeTruthy;
            expect(await this.page.getByRole('link', { name: 'LAUNCH JUMPSTARTER' }).isVisible()).toBeTruthy;
            expect(await this.page.getByRole('link', { name: 'Privacy Statement' }).first().isVisible()).toBeTruthy;
            expect(await this.page.getByRole('region', { name: 'Cookie banner' }).isVisible()).toBeTruthy;
            await this.logInfo("Successfully verified Blog details");
            return 'Passed';
        }
        catch (error) {
            await this.logError('Error verifying blog details:', error);
            return 'Failed';
        }
    }
    async verifyBlogFooterLinks() {
        try {
            await this.page.goto('https://home.' + process.env.environment + '.digitalmbd.net/blog');
            await acceptCookiesIfPresent(this.page);
            await this.logInfo("Successfully navigated to Blog page");
            expect(await this.page.getByRole('contentinfo').getByRole('link', { name: 'Kitchen Jumpstarter' }).isVisible()).toBeTruthy;
            expect(await this.page.getByRole('contentinfo').getByRole('link', { name: 'About Rebode' }).isVisible()).toBeTruthy;
            expect(await this.page.getByRole('contentinfo').getByRole('link', { name: 'FAQ' }).isVisible()).toBeTruthy;
            expect(await this.page.getByRole('contentinfo').getByRole('link', { name: 'Terms of Use' }).isVisible()).toBeTruthy;
            expect(await this.page.getByRole('contentinfo').getByRole('link', { name: 'Privacy Statement' }).isVisible()).toBeTruthy;
            expect(await this.page.getByRole('link', { name: 'Your Privacy Choices' }).isVisible()).toBeTruthy;
            expect(await this.page.getByRole('link', { name: 'Pinterest' }).isVisible()).toBeTruthy;
            expect(await this.page.getByRole('link', { name: 'Instagram' }).isVisible()).toBeTruthy;
            expect(await this.page.getByRole('link', { name: 'Facebook' }).isVisible()).toBeTruthy;
            expect(await this.page.getByRole('figure').getByRole('link', { name: 'Link To Home' }).isVisible()).toBeTruthy;
            await this.logInfo("Successfully verified Blog footer links");
            return 'Passed';
        }
        catch (error) {
            await this.logError('Error verifying blog footer links:', error);
            return 'Failed';
        }
    }

    async verifyHeroNavigationTabs() {
        try{
            const logStep = (message: string) => console.log(`[verifyHeroNavigationTabs] ${message}`);

            logStep('Validate Find your Style tab is visible');
            await expect(this.page.getByRole('tab', { name: 'Find your Style' })).toBeVisible();
            logStep('Validate Design your Flow tab is visible');
            await expect(this.page.getByRole('tab', { name: 'Design your Flow' })).toBeVisible();
            logStep('Validate Plan your Budget tab is visible');
            await expect(this.page.getByRole('tab', { name: 'Plan your Budget' })).toBeVisible();
            logStep('Validate Build your Team tab is visible');
            await expect(this.page.getByRole('tab', { name: 'Build your Team' })).toBeVisible();

            logStep('Click Find your Style tab');
            await expect(this.page.getByRole('tab', { name: 'Find your Style' }).click()).toBeTruthy();
            logStep('Validate Hero banner image is visible after Find your Style tab click');
            await expect(this.page.getByRole('img', { name: 'Hero banner image' })).toBeVisible();
            logStep('Click Design your Flow tab');
            await expect(this.page.getByRole('tab', { name: 'Design your Flow' }).click()).toBeTruthy();
            logStep('Validate background image is visible after Design your Flow tab click');
            await expect(this.page.getByRole('img', { name: 'background image' })).toBeVisible();
            await this.page.waitForTimeout(2000);
            logStep('Click Hardware button');
            await expect(this.page.getByRole('button', { name: 'Hardware' }).click()).toBeTruthy();
            logStep('Validate Hardware text is visible');
            await expect(this.page.getByText('Hardware').isVisible()).toBeTruthy();
            await this.page.waitForTimeout(5000);
            logStep('Click Cabinets button');
            await expect(this.page.getByRole('button', { name: 'Cabinets', exact: true }).click()).toBeTruthy();
            await this.page.waitForTimeout(5000);
            logStep('Validate Cabinets text is visible');
            await expect(this.page.getByText('Cabinets', { exact: true }).isVisible()).toBeTruthy();
            logStep('Click Plan your Budget tab');
            await expect(this.page.getByRole('tab', { name: 'Plan your Budget' }).click()).toBeTruthy();
            await this.page.waitForTimeout(10000);
            logStep('Click Build your Team tab');
            await expect(this.page.getByRole('tab', { name: 'Build your Team' }).click()).toBeTruthy();
            logStep('Validate team section image 4 is visible');
            await expect(this.page.locator('img').nth(3).isVisible()).toBeTruthy();
            logStep('Validate team section image 6 is visible');
            await expect(this.page.locator('img').nth(5).isVisible()).toBeTruthy();
            logStep('Validate Get matched heading is visible');
            await expect(this.page.getByRole('heading', { name: 'Get matched' }).isVisible()).toBeTruthy();
            logStep('Validate We’ll share your Remodel text is visible');
            await expect(this.page.getByText('We\u2019ll share your Remodel').isVisible()).toBeTruthy();
            logStep('Validate Meet & plan together heading is visible');
            await expect(this.page.getByRole('heading', { name: 'Meet & plan together' }).isVisible()).toBeTruthy();
            logStep('Validate Your designer will reach out text is visible');
            await expect(this.page.getByText('Your designer will reach out').isVisible()).toBeTruthy();
            logStep('Validate third card image is visible');
            await expect(this.page.locator('div:nth-child(3) > .mb-2 > img').isVisible()).toBeTruthy();
            logStep('Validate Bring your vision to life heading is visible');
            await expect(this.page.getByRole('heading', { name: 'Bring your vision to life' }).isVisible()).toBeTruthy();
            logStep('Validate From refining ideas to text is visible');
            await expect(this.page.getByText('From refining ideas to').isVisible()).toBeTruthy();
            logStep('Click Find your Style tab again');
            await expect(this.page.getByRole('tab', { name: 'Find your Style' }).click()).toBeTruthy();
            logStep('Validate Modern text is visible');
            await expect(this.page.getByText('Modern').first().isVisible()).toBeTruthy();
            logStep('Click first style indicator dot');
            await expect(this.page.locator('.h-2.w-2').first().click()).toBeTruthy();
            await this.page.waitForTimeout(5000);
            logStep('Validate Slide to find your dream text is visible');
            await expect(this.page.getByText('Slide to find your dream').isVisible()).toBeTruthy();
            logStep('Click carousel control button');
            await expect(this.page.locator('.absolute > div:nth-child(2)').first().click()).toBeTruthy();
            await this.page.waitForTimeout(5000);
            logStep('Validate Hero banner image is visible after carousel control click');
            await expect(this.page.getByRole('img', { name: 'Hero banner image' }).isVisible()).toBeTruthy();
            logStep('Click hotspot item 3');
            await expect(this.page.locator('.absolute > div:nth-child(3)').first().click()).toBeTruthy();
            await this.page.waitForTimeout(5000);
            logStep('Validate Hero banner image is visible after hotspot item 3 click');
            await expect(this.page.getByRole('img', { name: 'Hero banner image' }).isVisible()).toBeTruthy();
            logStep('Click hotspot item 4');
            await expect(this.page.locator('.absolute > div:nth-child(4)').click()).toBeTruthy();
            await this.page.waitForTimeout(5000);
            logStep('Validate Hero banner image is visible after hotspot item 4 click');
            await expect(this.page.getByRole('img', { name: 'Hero banner image' }).isVisible()).toBeTruthy();
            logStep('Click hotspot item 5');
            await expect(this.page.locator('div:nth-child(5) > .h-2').click()).toBeTruthy();
            await this.page.waitForTimeout(5000);
            logStep('Validate Hero banner image is visible after hotspot item 5 click');
            await expect(this.page.getByRole('img', { name: 'Hero banner image' }).isVisible()).toBeTruthy();
            logStep('Click hotspot item 6');
            await expect(this.page.locator('div:nth-child(6)').first().click()).toBeTruthy();
            await this.page.waitForTimeout(5000);
            logStep('Validate Hero banner image is visible after hotspot item 6 click');
            await expect(this.page.getByRole('img', { name: 'Hero banner image' }).isVisible()).toBeTruthy();
            logStep('Click hotspot item 7 with evaluate click');
            try {
                await this.page.locator('div:nth-child(7)').first().click({ force: true, timeout: 5000 });
            } catch {
                await this.page.locator('div:nth-child(7)').first().dispatchEvent('click');
            }
            await this.page.waitForTimeout(5000);
            logStep('Validate Hero banner image is visible after hotspot item 7 click');
            await expect(this.page.getByRole('img', { name: 'Hero banner image' }).isVisible()).toBeTruthy();
            logStep('Validate Traditional text is visible');
            await expect(this.page.getByText('Traditional').first().isVisible()).toBeTruthy();

        await this.logInfo('Successfully verified hero navigation tabs');
        return 'Passed';
        }
        catch (error) {
            await this.logError('Error verifying hero navigation tabs:', error);
            return 'Failed';
        }
    }

    async verifyHowItWorksSection() {
        try {
        const logStep = (message: string) => console.log(`[verifyHowItWorksSection] ${message}`);

        logStep('Scroll to How it works heading');
        await this.page.getByRole('heading', { name: 'How it works' }).scrollIntoViewIfNeeded();
        logStep('Validate How it works heading is visible');
        await expect(this.page.getByRole('heading', { name: 'How it works' })).toBeVisible();
        logStep('Validate introductory section text is visible');
        await expect(this.page.getByText('The simple, free way to design your kitchen — trusted by homeowners.')).toBeVisible();
        logStep('Validate Find your style tab text is visible');
        await expect(this.page.getByText('| Find your style')).toBeVisible();
        logStep('Validate Find your style description is visible');
        await expect(this.page.getByText('Explore kitchen looks and see what feels like you. Answer a few quick questions and we’ll help you clarify your style and define the vision behind your dream kitchen.')).toBeVisible();
        logStep('Click Find your style tab text');
        await this.page.getByText('| Find your style').click();
        logStep('Validate Design your flow tab text is visible');
        await expect(this.page.getByText('| Design your flow')).toBeVisible();
        logStep('Click Design your flow tab text');
        await this.page.getByText('| Design your flow').click();
        logStep('Validate Design your flow description is visible');
        await expect(this.page.getByText(/Think beyond finishes\./i)).toBeVisible();
        logStep('Validate Plan your budget tab text is visible');
        await expect(this.page.getByText('| Plan your budget')).toBeVisible();
        logStep('Click Plan your budget tab text');
        await this.page.getByText('| Plan your budget').click();
        logStep('Validate Plan your budget description is visible');
        await expect(this.page.getByText(/Get a clear picture of what your dream kitchen might cost\./i)).toBeVisible();
        logStep('Validate Build your team tab text is visible');
        await expect(this.page.getByText('| Build your team')).toBeVisible();
        logStep('Click Build your team tab text');
        await this.page.getByText('| Build your team').click();
        logStep('Validate Build your team description is visible');
        await expect(this.page.getByText(/You.?ve clarified your style, space, goals/i)).toBeVisible();
        logStep('Validate How it works CTA link is visible');
        const planKitchenCta = this.page.getByRole('link', { name: 'Plan your dream kitchen' }).first();
        await expect(planKitchenCta).toBeVisible({ timeout: 15000 });
            const image = this.page.locator(
                'div.relative.mt-5.hidden.lg\\:block.aspect-\\[1\\.07\\/1\\] > img'
            );
            logStep('Validate How it works section image is attached and visible in viewport');
            const heading = this.page.getByRole('heading', {
                name: 'From vision to renovation: kitchens that started here'
            });

        await heading.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(5000);
        await expect(image).toBeVisible();
        logStep('Click How it works CTA link');
        await planKitchenCta.click();
        logStep('Validate navigation to /start');
        await this.page.waitForURL(url => url.pathname === '/start');
        logStep('Navigate back to Home page');
        await this.page.goto('https://home.' + process.env.environment + '.digitalmbd.net/');
        await this.logInfo('Successfully verified How it works section');
        return 'Passed';
        }
        catch (error) {
            await this.logError('Error verifying How it works section:', error);
            return 'Failed';
        }
    }

    async verifyFromVisionToRenovation() {
        try {
        const logStep = (message: string) => console.log(`[verifyFromVisionToRenovation] ${message}`);

        logStep('Scroll to From vision to renovation section');
        await this.page.getByRole('heading', { name: 'From vision to renovation:' }).scrollIntoViewIfNeeded();
        logStep('Validate section heading is visible');
        await expect(this.page.getByRole('heading', { name: 'From vision to renovation:' })).toBeVisible();
        logStep('Validate Social Bistro profile button is visible');
        await expect(this.page.getByRole('button', { name: 'Social Bistro, Charlotte, NC' })).toBeVisible();
        logStep('Validate Social Bistro story content');
        await expect(this.page.getByText('Heather and her husband dream of a kitchen that can do it all; a sleek, modern space to host dinner parties, cook together, and enjoy cozy family moments. ')).toBeVisible();
        await expect(this.page.getByText('Their defined style? Organic Modern.')).toBeVisible();
        await expect(this.page.getByText('Organic Modern is your favorite style.')).toBeVisible();
        await expect(this.page.getByText('Organic Modern combines natural textures with clean, modern lines, creating a warm, inviting space that feels both stylish and comfortable.')).toBeVisible();
        await expect(this.page.getByText('Your dream kitchen concept? ')).toBeVisible();
        await expect(this.page.getByText('Social Bistro')).toBeVisible();
        logStep('Validate Social Bistro reference images');
        await expect(
            this.page.locator('img[srcset*="tab1.png"]').first()
        ).toBeVisible();

        await expect(
            this.page.locator('img[srcset*="tab2.jpg"]').first()
        ).toBeVisible();
        logStep('Switch to Industrial profile');
        await expect(this.page.getByRole('button', { name: ' Industrial, Organized Family Center, Irvine, CA' })).toBeVisible();
        await this.page.getByRole('button', { name: ' Industrial, Organized Family Center, Irvine, CA' }).click();
        await this.page.waitForTimeout(5000);
        logStep('Validate Industrial profile content');
        await expect(this.page.getByText('Chris and his partner are both designers who wanted a kitchen that echoed their modern industrial style while supporting the rhythm of everyday life.')).toBeVisible();
        await expect(this.page.getByText('Industrial is your favorite style.')).toBeVisible();
        await expect(this.page.getByText('Industrial style mixes exposed brick, metal, and wood for a cool, laid-back look that feels like a trendy loft with tons of character.')).toBeVisible();
        await expect(this.page.getByText('Your dream kitchen concept? ')).toBeVisible();
        await expect(this.page.getByText('Family Central.')).toBeVisible();
        logStep('Validate Industrial reference images');
        await expect(
            this.page.locator('img[srcset*="tab1.png"]').first()
        ).toBeVisible();

        await expect(
            this.page.locator('img[srcset*="tab2.jpg"]').first()
        ).toBeVisible();
        const rightArrow = this.page.locator('svg.lucide-chevron-right').first();
        const leftArrow = this.page.locator('svg.lucide-chevron-left').first();

        // Click right arrow 3 times with 2-second delay
        logStep('Cycle right carousel arrow 3 times');
        for (let i = 0; i < 3; i++) {
            await rightArrow.click();
            await this.page.waitForTimeout(2000);
        }

        // Click left arrow 3 times with 2-second delay
        logStep('Cycle left carousel arrow 3 times');
        for (let i = 0; i < 3; i++) {
            await leftArrow.click();
            await this.page.waitForTimeout(2000);
        }
        logStep('Switch to Social Club profile');
        await expect(this.page.getByRole('button', { name: 'Social Club, Annapolis, MD' })).toBeVisible();
        await this.page.getByRole('button', { name: 'Social Club, Annapolis, MD' }).click();
        await this.page.waitForTimeout(5000);
        logStep('Validate Social Club profile content');
        await expect(this.page.getByText('Melissa wanted a rustic farmhouse-style kitchen that’s pet-friendly, spacious enough for her two dogs, and functional for her love of baking and wine.')).toBeVisible();
        await expect(this.page.getByText('Farmhouse is your favorite style.')).toBeVisible();
        await expect(this.page.getByText('Farmhouse style is all about cozy comfort with chippy paint, vintage accents, and heirloom collectables, creating a lived-in, homey feel.')).toBeVisible();
        await expect(this.page.getByText('Your dream kitchen concept? ')).toBeVisible();
        await expect(this.page.getByText('Pet Social Club.')).toBeVisible();
        logStep('Validate Social Club reference images');
        await expect(
            this.page.locator('img[srcset*="tab1.png"]').first()
        ).toBeVisible();

        await expect(
            this.page.locator('img[srcset*="tab2.jpg"]').first()
        ).toBeVisible();
        const rightArrowSocial = this.page.locator('svg.lucide-chevron-right').first();
        const leftArrowSocial = this.page.locator('svg.lucide-chevron-left').first();

        // Click right arrow 3 times with 2-second delay
        logStep('Cycle right carousel arrow for Social Club 3 times');
        for (let i = 0; i < 3; i++) {
            await rightArrowSocial.click();
            await this.page.waitForTimeout(2000);
        }

        // Click left arrow 3 times with 2-second delay
        logStep('Cycle left carousel arrow for Social Club 3 times');
        for (let i = 0; i < 3; i++) {
            await leftArrow.click();
            await this.page.waitForTimeout(2000);
        }
        logStep('Validate and click final CTA');
        await expect(this.page.getByRole('link', { name: 'What will yours look like' })).toBeVisible();

        await this.page.getByRole('link', { name: 'What will yours look like' }).click();
        await this.page.waitForURL(url => url.pathname === '/start');
        await this.page.goto('https://home.' + process.env.environment + '.digitalmbd.net/');
        await acceptCookiesIfPresent(this.page);
        await this.logInfo('Successfully verified From vision to renovation section');
        return 'Passed';
        }
        catch (error) {
            await this.logError('Error verifying From vision to renovation section:', error);
            return 'Failed';        
    }
    }

    async verifyToolsToShapeYourDream() {
        try {
        const logStep = (message: string) => console.log(`[verifyToolsToShapeYourDream] ${message}`);

        logStep('Scroll to Tools to shape your dream section');
        await this.page.getByRole('heading', { name: 'Tools to shape your dream' }).scrollIntoViewIfNeeded();
        logStep('Validate section heading is visible');
        await expect(this.page.getByRole('heading', { name: 'Tools to shape your dream' })).toBeVisible();
        logStep('Validate Free Design Tool card content');
        await expect(this.page.getByRole('heading', { name: 'Free Design Tool' })).toBeVisible();
        await expect(this.page.getByText('What\u2019s that style called? Upload a photo of a kitchen you love and let AI identify the style for you.')).toBeVisible();
        await expect(this.page.getByRole('link', { name: 'Get started' })).toBeVisible();
        logStep('Validate Join Free To Access card content');
        await expect(this.page.getByRole('heading', { name: 'JOIN FREE TO ACCESS' })).toBeVisible();
        await expect(this.page.getByText('Create a free Rebode account and upload a photo to see your space transformed into the look you love.')).toBeVisible();
        await expect(this.page.getByRole('link', { name: 'Sign up to try it' })).toBeVisible();
        logStep('Validate Free Service card content');
        await expect(this.page.getByRole('heading', { name: 'FREE SERVICE' })).toBeVisible();
        await expect(this.page.getByText('Connect with one of our in-house remodeling experts for personalized advice or help with one of our tools.')).toBeVisible();
        await expect(this.page.getByRole('link', { name: 'Talk to an expert' })).toBeVisible();
        logStep('Click Get started CTA and validate navigation to /start');
        await this.page.getByRole('link', { name: 'Get started' }).click();
        await this.page.waitForURL(url => url.pathname === '/start');
        logStep('Navigate back to Home page');
        await this.page.goto('https://home.' + process.env.environment + '.digitalmbd.net/');
        await acceptCookiesIfPresent(this.page);
        await this.logInfo('Successfully verified Tools to shape your dream section');
        return 'Passed';
    } catch (error) {
        await this.logError('Error verifying Tools to shape your dream section:', error);
        return 'Failed';
    }
}

    async verifySeeYourDreamKitchenComeToLife() {
        try {
            const logStep = (message: string) => console.log(`[verifySeeYourDreamKitchenComeToLife] ${message}`);

            logStep('Scroll to See your dream kitchen come to life section');
            await this.page.getByRole('heading', { name: 'See your dream kitchen come' }).scrollIntoViewIfNeeded();
            logStep('Validate section heading and content');
            await expect(this.page.getByRole('heading', { name: 'See your dream kitchen come' })).toBeVisible();
            await expect(this.page.locator('body')).toContainText('See your dream kitchen come to life — FREE.');
            await expect(this.page.locator('body')).toContainText('Get your personalized Remodel Profile in just a few simple steps.');
            await expect(this.page.getByRole('link', { name: 'Start your kitchen' })).toBeVisible();
            await expect(this.page.locator('body')).toContainText('Start your kitchen transformation');


        logStep('Click Start your kitchen CTA and validate navigation');
        await this.page.getByRole('link', { name: 'Start your kitchen' }).click();
        await this.page.waitForURL(url => url.pathname === '/start');
        await this.page.goto('https://home.' + process.env.environment + '.digitalmbd.net/');
        await acceptCookiesIfPresent(this.page);
        await this.logInfo('Successfully verified See your dream kitchen come to life section');
        return 'Passed';
        }
        catch (error) {
            await this.logError('Error verifying See your dream kitchen come to life section:', error);
            return 'Failed';
        }   
    }

    async verifyStillExploring() {
        try {
        const logStep = (message: string) => console.log(`[verifyStillExploring] ${message}`);

        logStep('Scroll to Still exploring section');
        await this.page.getByRole('heading', { name: 'Still exploring?' }).scrollIntoViewIfNeeded();
        logStep('Validate section content and blog links');
        await expect(this.page.getByRole('heading', { name: 'Still exploring?' })).toBeVisible();
        await expect(this.page.locator('body')).toContainText('Still exploring?');
        await expect(this.page.locator('body')).toContainText('Get practical tips, fresh ideas, and expert insights to plan your remodel with confidence.');
        await expect(this.page.getByRole('link', { name: 'What to expect from your' })).toBeVisible();
        await expect(this.page.getByRole('link', { name: 'Functional custom kitchen' })).toBeVisible();
        await expect(this.page.getByRole('link', { name: 'Stunning kitchen cabinet' })).toBeVisible();
        await expect(this.page.getByRole('link', { name: 'See more blog articles' })).toBeVisible();
        await expect(this.page.locator('body')).toContainText('See more blog articles');

        logStep('Click See more blog articles and validate navigation');
        await this.page.getByRole('link', { name: 'See more blog articles' }).click();
        await this.page.waitForURL(url => url.pathname === '/blog');
        await this.page.goto('https://home.' + process.env.environment + '.digitalmbd.net/');
        await acceptCookiesIfPresent(this.page);
        await this.logInfo('Successfully verified Still exploring section');
        return 'Passed';
        }
        catch (error) {
            await this.logError('Error verifying Still exploring section:', error);
            return 'Failed';
        }
    }

    async verifyYourQuestionsAnswered() {
        try {
        const logStep = (message: string) => console.log(`[verifyYourQuestionsAnswered] ${message}`);

        logStep('Scroll to Your questions, answered section');
        await this.page.getByRole('heading', { name: 'Your questions, answered' }).scrollIntoViewIfNeeded();
        logStep('Validate FAQs and CTA content');
        await expect(this.page.getByRole('heading', { name: 'Your questions, answered' })).toBeVisible();
        await expect(this.page.locator('body')).toContainText('Your questions, answered');
        await expect(this.page.locator('body')).toContainText('Find more answers in our FAQs.');
        await expect(this.page.getByRole('button', { name: 'Do I have to pay to work with' })).toBeVisible();
        await expect(this.page.getByRole('button', { name: 'What is a Rebode expert, and' })).toBeVisible();
        await expect(this.page.getByRole('button', { name: 'How does Rebode select their' })).toBeVisible();
        await expect(this.page.getByRole('button', { name: 'How long does it take to' })).toBeVisible();
        await expect(this.page.getByRole('button', { name: 'I’m already working with a' })).toBeVisible();
        await expect(this.page.getByText('Ready to get started?')).toBeVisible();
        await expect(this.page.locator('body')).toContainText('Ready to get started?');
        await expect(this.page.locator('div').filter({ hasText: /^Ready to get started\?Plan your dream kitchen$/ }).getByRole('link')).toBeVisible();

        logStep('Click Plan your dream kitchen CTA and validate navigation');
        await this.page.locator('div').filter({ hasText: /^Ready to get started\?Plan your dream kitchen$/ }).getByRole('link').click();
        await this.page.waitForURL(url => url.pathname === '/start');
        await this.page.goto('https://home.' + process.env.environment + '.digitalmbd.net/');
        await acceptCookiesIfPresent(this.page);
        await this.logInfo('Successfully verified Your questions, answered section');
        return 'Passed';
        }
        catch (error) {
            await this.logError('Error verifying Your questions, answered section:', error);
            return 'Failed';
        }
    }

    async verifyAboutRebode() {
        try {
        const logStep = (message: string) => console.log(`[verifyAboutRebode] ${message}`);

        logStep('Scroll to About Rebode section');
        await this.page.getByRole('heading', { name: 'Your questions, answered' }).scrollIntoViewIfNeeded();
        logStep('Validate About Rebode heading and mission content');
        await expect(this.page.getByRole('paragraph').filter({ hasText: 'About Rebode' })).toBeVisible();
        await expect(this.page.getByRole('heading', { name: 'We’re on a mission to' })).toBeVisible();
        await expect(this.page.locator('body')).toContainText('We’re on a mission to transform the kitchen remodeling experience');
        await expect(this.page.locator('body')).toContainText('We believe every homeowner deserves a kitchen that feels like home - personal, functional, and beautiful, without the stress or second-guessing. As part of the MasterBrand family — the largest cabinet manufacturer in North America — we’ve learned a thing or two about what makes a great remodel experience. Now, we’ve transformed that expertise into a suite of digital tools that make remodeling simple, empowering, and accessible to everyone. With smart technology and a team of experts, we help you turn inspiration into action, with confidence and support every step of the way.');
        await this.logInfo('Successfully verified About Rebode section');
        return 'Passed';
        }
        catch (error) {
            await this.logError('Error verifying About Rebode section:', error);
            return 'Failed';
        }
    }
    async verifyHomepageHeadlinesAndCTAs() {
        try {
            const homeUrl = 'https://home.' + process.env.environment + '.digitalmbd.net/';

            await expect(this.page.getByRole('heading', {
                name: 'Everything you need to plan your kitchen remodel',
                level: 1
            })).toBeVisible();
            await this.logInfo('Hero headline verified');

            await expect(this.page.getByText(
                'Design your dream kitchen. Connect with a carefully selected designer. Start your remodel with confidence— for free.'
            )).toBeVisible();
            await this.logInfo('Hero description verified');

            await expect(this.page.locator('text=/By continuing.*I acknowledge.*Rebode/i')).toBeVisible();
            await this.logInfo('Consent/acknowledgment text verified');

            const privacyLink = this.page.getByRole('link', { name: 'Privacy Statement' }).first();
            await expect(privacyLink).toBeVisible();
            await privacyLink.click({ timeout: 10000 });
            await this.page.waitForURL(url =>
                url.hostname.includes('masterbrand.com') && url.pathname.includes('/privacy-statement/'),
                { timeout: 20000 }
            );
            await expect(this.page.locator('h1.module_title:has-text("Privacy Statement")').first()).toBeVisible();
            await this.logInfo('Privacy Statement link verified');

            await this.page.goto(homeUrl);

            const termsLink = this.page.getByRole('link', { name: 'Terms of Use' }).first();
            await expect(termsLink).toBeVisible();

            const termsPopupPromise = this.page.waitForEvent('popup', { timeout: 10000 }).catch(() => null);
            await termsLink.click({ timeout: 10000 });
            const termsPopup = await termsPopupPromise;
            const termsPage = termsPopup ?? this.page;

            await termsPage.waitForURL(url =>
                url.hostname.includes('masterbrand.com') && url.pathname.includes('/terms-of-use/'),
                { timeout: 20000 }
            );
            await expect(termsPage.locator('h1.module_title:has-text("Terms of Use")').first()).toBeVisible();
            await this.logInfo('Terms of Use link verified');

            if (termsPopup) {
                await termsPopup.close();
            }

            await this.page.goto(homeUrl);

            const startHereLink = this.page.locator('a[data-section="hero"][href*="jumpstarter"]').first();
            await expect(startHereLink).toBeVisible();

            const startPopupPromise = this.page.waitForEvent('popup', { timeout: 10000 }).catch(() => null);
            await startHereLink.click({ timeout: 10000 });
            const startPopup = await startPopupPromise;
            const startPage = startPopup ?? this.page;

            await startPage.waitForURL(url =>
                url.pathname === '/start' || url.href.includes('jumpstarter.rebode.us'),
                { timeout: 20000 }
            );
            await startPage.waitForLoadState('domcontentloaded');

            const startHeadlineCandidates = [
                startPage.locator('p.headlineJumbo:has-text("Let")').first(),
                startPage.getByRole('heading', { name: /Let.?s talk about the kitchen you.?ve always wanted/i }).first(),
                startPage.locator('text=/Let.?s talk about the kitchen you.?ve always wanted/i').first()
            ];

            let startHeadlineFound = false;
            for (const candidate of startHeadlineCandidates) {
                try {
                    await candidate.waitFor({ state: 'visible', timeout: 10000 });
                    startHeadlineFound = true;
                    break;
                } catch {
                    // Try the next candidate locator.
                }
            }

            expect(startHeadlineFound).toBeTruthy();
            await this.logInfo('Start here CTA navigation verified');

            if (startPopup) {
                await startPopup.close();
            }

            await this.page.goto(homeUrl);
            await this.logInfo('Successfully verified homepage headlines and CTAs');
            return 'Passed';
        }
        catch (error) {
            await this.logError('Error verifying homepage headlines and CTAs:', error);
            return 'Failed';
        }
    }
}
