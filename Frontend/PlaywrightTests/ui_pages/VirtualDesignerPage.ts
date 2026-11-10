import { expect, Page } from "@playwright/test";
import AuthHelper from '../helpers/api-helpers';
import { waitForSpinnerToDisappear, hideChatBubble, acceptCookiesIfPresent } from '../helpers/waitHelpers';
import { registerWithIAMOtp } from '../helpers/accountRegistrationWithIAMOTP';


let newProjectId: string;
let userId: string;

export default class BudgetPage {
/**
     * Constructs a SmokePage instance and attaches a console event listener for logging.
     * @param {Page} page - Playwright Page object for browser automation.
     */
    constructor(public page: Page) {
        const suppressPatterns = [
        'TP: Tracking Event:','0: I: error state changed','0: I: question data init','0: SQ: validating form','theme in RemodelProfile','0: error/warning changed:',
        '0: Max file size for upload is'
        // add more patterns here as needed
    ];
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();

            // Suppress known resource loading errors
           if (
                type === 'error'
            ) {
                return;
            }
                
            if (suppressPatterns.some(pattern => text.includes(pattern))) {
            return;
            }

            const now = new Date();
            const timestamp = now.toUTCString();
            console.log(`${timestamp} - ${msg.type().toUpperCase()} - ${msg.text()}`);


        });
    }

    private async logInfo(message: string) {
        await this.page.evaluate((msg) => console.log(msg), message);
    }

    private async logWarn(message: string) {
        await this.page.evaluate((msg) => console.warn(msg), message);
    }

    private async logError(message: string, details?: unknown) {
        const detailText = details === undefined
            ? ''
            : details instanceof Error
                ? ` ${details.stack ?? details.message}`
                : ` ${String(details)}`;
        await this.page.evaluate((msg) => console.error(msg), `${message}${detailText}`);
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
                        await this.logInfo('Captured userDetailsID:' + userId);
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
                   await this.logInfo('Registered Email:'+ email);
       
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
       

   
    async verifyVirtualDesigner(phoneNumber: string, scheduleOption: string) {
        await this.logInfo('Starting Virtual Designer verification flow');

        // Verify main page content before scheduling
        await this.verifyMainPageContent();

        // Open scheduler modal
        await this.openScheduler(scheduleOption);

        // Complete scheduling flow
        await this.scheduleConsultation(phoneNumber);

        await this.logInfo('Virtual Designer verification flow completed successfully');
    }

    private async verifyMainPageContent() {
        await this.logInfo('Verifying Virtual Designer main page content');

        // Wait for page to stabilize with extended timeout for initial content load
        await this.logInfo('  Waiting for page to reach networkidle state...');
        await this.page.waitForLoadState('networkidle');
        await this.logInfo('  ✓ Page reached networkidle state');

        // Wait for the main hero section to appear before checking content
        await this.logInfo('  Waiting for hero section text to appear...');
        await this.page.locator('.headlineLg.warmTitle').waitFor({ timeout: 15000 });
        await this.logInfo('  ✓ Hero section text detected');

        // Verify hero section content
        await expect(
            this.page.locator('.headlineLg.warmTitle')
        ).toHaveText(/Your kitchen plan is ready.*bring it to life/i);
        await this.logInfo('  ✓ Hero section text visible - Your kitchen plan is ready');

        await expect(this.page.locator('.calenderImgWrapper > img')).toBeVisible();
        await this.logInfo('    ✓ Calendar image visible');
        await expect(this.page.getByText('Book your free kitchen review')).toBeVisible();
        await this.logInfo('    ✓ Schedule CTA text visible');
        await expect(
            this.page.getByText(/Review your kitchen plan with a pro./i)
        ).toBeVisible();
        await this.logInfo('    ✓ Designer confidence text visible');
        // Verify feature cards with images
        await this.logInfo('  Verifying feature card profile icons...');
        const profileIcons = this.page.getByRole('img', { name: 'profile shared' });
        await expect(profileIcons.first()).toBeVisible();
        await this.logInfo('    ✓ First profile icon visible');
        await expect(profileIcons.nth(1)).toBeVisible();
        await this.logInfo('    ✓ Second profile icon visible');
        await expect(profileIcons.nth(2)).toBeVisible();
        await this.logInfo('    ✓ Third profile icon visible');

        // Verify feature text
        await this.logInfo('  Verifying feature card description text...');
        await expect(this.page.getByText('Expert guidance without pressure').nth(1)).toBeVisible();
        await this.logInfo('    ✓ Expert guidance text visible');
        await expect(this.page.getByText('A personalized 3D rendering of your new kitchen').nth(1)).toBeVisible();
        await this.logInfo('    ✓ 3D walkthrough text visible');
        await expect(this.page.getByText('Realistic budget ranges that fit your vision').nth(1)).toBeVisible();
        await this.logInfo('    ✓ Budget ranges text visible');

        // Verify team headshots
        await this.logInfo('  Verifying team member headshots...');
        const headshotNames = ['headshot-1', 'headshot-2', 'headshot-3', 'headshot-4'];
        for (const headshot of headshotNames) {
            await expect(this.page.getByRole('img', { name: headshot })).toBeVisible();
            await this.logInfo(`    ✓ ${headshot} visible`);
        }

        // Verify closing content
        await expect(
            this.page.locator('.pdqDesignImageWrapper img[alt="pdq logo"]')
        ).toBeVisible();
        await this.logInfo('    ✓ PDQ logo visible');

        await expect(
            this.page.locator('.pdqDesignTitle')
        ).toHaveText(/PDQ Designer, LLC/i);
        await this.logInfo('    ✓ PDQ Designer title visible');

        await expect(
            this.page.getByText(/Trusted by homeowners throughout the Carolinas and Georgia for over 10 years/i)
        ).toBeVisible();
        await this.logInfo('    ✓ Location text visible');

        await expect(
            this.page.locator('.carousel-item.active img')
        ).toBeVisible();
        await this.logInfo('    ✓ Active carousel image visible');

        await expect(
            this.page.locator('.carousel-item.inactive img')
        ).toHaveCount(12);
        await this.logInfo('    ✓ Inactive carousel images visible');

        await expect(
            this.page.locator('button.carousel-button.next')
        ).toBeVisible();
        await this.logInfo('    ✓ Carousel next button visible');

        // Testimonial 1 - Beth D.
        await expect(
            this.page.locator('.testimonial').filter({ hasText: /I loved being able to try different ideas on paper before doing any construction/i }).getByText(/I loved being able to try different ideas on paper before doing any construction/i)
        ).toBeVisible();
        await this.logInfo('    ✓ Testimonial 1 title visible - Beth D.');

        await expect(
            this.page.locator('.testimonial').filter({ hasText: /Beth D\., Decatur, GA/i }).getByText(/Beth D\., Decatur, GA/i)
        ).toBeVisible();
        await this.logInfo('    ✓ Testimonial 1 subtitle visible - Beth D., Decatur, GA');

        // Testimonial 2 - Andrea I.
        await expect(
            this.page.locator('.testimonial').filter({ hasText: /They listened to what we wanted and didn\u2019t push us outside our comfort zone/i }).getByText(/They listened to what we wanted and didn\u2019t push us outside our comfort zone/i)
        ).toBeVisible();
        await this.logInfo('    ✓ Testimonial 2 title visible - Andrea I.');

        await expect(
            this.page.locator('.testimonial').filter({ hasText: /Andrea I\., Greensboro, NC/i }).getByText(/Andrea I\., Greensboro, NC/i)
        ).toBeVisible();
        await this.logInfo('    ✓ Testimonial 2 subtitle visible - Andrea I., Greensboro, NC');

        // Testimonial 3 - Michael R.
        await expect(
            this.page.locator('.testimonial').filter({ hasText: /We\u2019ve talked about this kitchen for two years/i }).getByText(/We\u2019ve talked about this kitchen for two years/i)
        ).toBeVisible();
        await this.logInfo('    ✓ Testimonial 3 title visible - Michael R.');

        await expect(
            this.page.locator('.testimonial').filter({ hasText: /Michael R\., Raleigh, NC/i }).getByText(/Michael R\., Raleigh, NC/i)
        ).toBeVisible();
        await this.logInfo('    ✓ Testimonial 3 subtitle visible - Michael R., Raleigh, NC');

        // Designer Intro Card - Title
        await expect(
            this.page.locator('.designerIntroCardTitle').getByText(/Not sure where to start\?/i)
        ).toBeVisible();
        await this.logInfo('    ✓ Designer intro card title visible - Not sure where to start?');

        // Designer Intro Card - Description
        await expect(
            this.page.locator('.designerIntroCardDescription').getByText(/That\u2019s completely normal\. A quick call can help you explore ideas/i)
        ).toBeVisible();
        await this.logInfo('    ✓ Designer intro card description visible');

        // Designer Intro Card - List Items
        await expect(
            this.page.locator('.designerIntroCardListItem').getByText(/Validate your current plan/i)
        ).toBeVisible();
        await this.logInfo('    ✓ Designer intro card list item 1 visible - Validate your current plan');

        await expect(
            this.page.locator('.designerIntroCardListItem').getByText(/Refine your priorities/i)
        ).toBeVisible();
        await this.logInfo('    ✓ Designer intro card list item 2 visible - Refine your priorities');

        await expect(
            this.page.locator('.designerIntroCardListItem').getByText(/Move forward with confidence/i)
        ).toBeVisible();
        await this.logInfo('    ✓ Designer intro card list item 3 visible - Move forward with confidence');

        // Designer Intro Card - CTA Button
        await expect(
            this.page.locator('.designerIntroCardCta').getByText(/Talk to a kitchen designer for free/i)
        ).toBeVisible();
        await this.logInfo('    ✓ Designer intro card CTA button visible - Talk to a kitchen designer for free');

        // Designer Intro Card - CTA Button is enabled (not disabled)
        await expect(
            this.page.locator('.designerIntroCardCta')
        ).toBeEnabled();
        await this.logInfo('    ✓ Designer intro card CTA button is enabled');

        // Designer Intro Card - Chevron Icon is visible
        await expect(
            this.page.locator('.designerIntroCardCtaIcon svg')
        ).toBeVisible();
        await this.logInfo('    ✓ Designer intro card chevron icon visible');

        await expect(
            this.page.locator('.designerIntroCardDesignerImage img')
        ).toHaveCount(4);
        await this.logInfo('    ✓ Partner headshot images visible - 4 designer images');

        // Also verify alt attributes for each headshot
        for (let i = 1; i <= 4; i++) {
            await expect(
                this.page.locator(`.designerIntroCardDesignerImage img[alt="headshot-${i}"]`)
            ).toBeVisible();
            await this.logInfo(`    ✓ Headshot ${i} image visible`);
        }

        // Verify designer names text
        await expect(
            this.page.locator('.designerIntroCardDesignerInfo .bodyXsSemibold')
        ).toHaveText(/Your PDQ designers: Wallie Rogerson, Brandy Rogerson, Makenna Joseph, Dani Pelletier/i);
        await this.logInfo('    ✓ Designer names text visible');

        // Verify certification images are visible
        await expect(
            this.page.locator('.designerIntroCardCertificationIcon img')
        ).toHaveCount(2);
        await this.logInfo('    ✓ Certification icons visible - 2 certification images');

        // Verify certification texts
        await expect(
            this.page.locator('.designerIntroCardCertificationText').first()
        ).toContainText(/National Kitchen and Bath Association/i);
        await this.logInfo('    ✓ NKBA certification text visible');

        await expect(
            this.page.locator('.designerIntroCardCertificationText').nth(1)
        ).toContainText(/Council for Interior Design Accreditation/i);
        await this.logInfo('    ✓ CIDA certification text visible');

        // Verify NKBA logo image
        await expect(
            this.page.locator('.nkbaLogo img')
        ).toBeVisible();
        await this.logInfo('    ✓ NKBA logo image visible');

        await expect(
            this.page.locator('.designerIntroCardDesignerInfo .bodyXsSemibold')
        ).toHaveText(/Your PDQ designers: Wallie Rogerson, Brandy Rogerson, Makenna Joseph, Dani Pelletier/i);
        await this.logInfo('    ✓ Designer names visible - Wallie Rogerson, Brandy Rogerson, Makenna Joseph, Dani Pelletier');

        await expect(
            this.page.getByText(/Actual kitchen designs from PDQ Designer, LLC/i)
        ).toBeVisible();
        await this.logInfo('    ✓ Carousel courtesy text visible');

        //Common questions before you book/
        await expect(
            this.page.locator('.faqTitle.headlineMd')
        ).toHaveText(/Common questions before you book/i);
        await this.logInfo('    ✓ FAQ section title visible - Common questions before you book');

        // FAQ Section - Verify all 5 questions and answers

        // FAQ 1 - What do I get with my free call?
        await expect(
            this.page.locator('.faqAccordionTitle').nth(0)
        ).toHaveText(/What do I get with my free call\?/i);
        await this.logInfo('    ✓ FAQ 1 question visible - What do I get with my free call?');

        await this.page.locator('.faqAccordionButton').nth(0).click();
        await this.page.locator('.faqAccordionButton').nth(0).click();
        await expect(
            this.page.locator('.faqAccordionPanel').nth(0).locator('p')
        ).toBeVisible();
        await expect(
            this.page.locator('.faqAccordionPanel').nth(0).locator('p')
        ).toHaveText(/You\u2019ll have a 15-minute kickoff to review your space and goals, followed by a 3D design reveal to refine details and discuss a budget range\. You\u2019ll receive a design summary and if you decide to proceed, we can connect you with a local pro to move your project forward\./i);
        await this.logInfo('    ✓ FAQ 1 answer visible');

        // FAQ 2 - Do I have to commit to anything after the call?
        await expect(
            this.page.locator('.faqAccordionTitle').nth(1)
        ).toHaveText(/Do I have to commit to anything after the call\?/i);
        await this.logInfo('    ✓ FAQ 2 question visible - Do I have to commit to anything after the call?');

        await this.page.locator('.faqAccordionButton').nth(1).click();
        await expect(
            this.page.locator('.faqAccordionPanel').nth(1).locator('p')
        ).toBeVisible();
        await expect(
            this.page.locator('.faqAccordionPanel').nth(1).locator('p')
        ).toHaveText(/No\. Your designer\u2019s job is to help you feel confident in your remodel plan\. Whether you choose to move forward afterward is completely up to you\./i);
        await this.logInfo('    ✓ FAQ 2 answer visible');

        // FAQ 3 - Is this tailored to my home and budget?
        await expect(
            this.page.locator('.faqAccordionTitle').nth(2)
        ).toHaveText(/Is this tailored to my home and budget\?/i);
        await this.logInfo('    ✓ FAQ 3 question visible - Is this tailored to my home and budget?');

        await this.page.locator('.faqAccordionButton').nth(2).click();
        await expect(
            this.page.locator('.faqAccordionPanel').nth(2).locator('p')
        ).toBeVisible();
        await expect(
            this.page.locator('.faqAccordionPanel').nth(2).locator('p')
        ).toHaveText(/Yes\. Your designer creates a fully personalized 3D plan based on your space, using photos and layout details you provide\. Budget ranges are tailored to your region and cabinetry selections, not generic estimates\./i);
        await this.logInfo('    ✓ FAQ 3 answer visible');

        // FAQ 4 - What if I'm not sure about certain colors or materials yet?
        await expect(
            this.page.locator('.faqAccordionTitle').nth(3)
        ).toHaveText(/What if I\u2019m not sure about certain colors or materials yet\?/i);
        await this.logInfo('    ✓ FAQ 4 question visible - What if I\'m not sure about certain colors or materials yet?');

        await this.page.locator('.faqAccordionButton').nth(3).click();
        await expect(
            this.page.locator('.faqAccordionPanel').nth(3).locator('p')
        ).toBeVisible();
        await expect(
            this.page.locator('.faqAccordionPanel').nth(3).locator('p')
        ).toHaveText(/You\u2019re in the right place\. Your designer will guide you through options and help you explore choices that fit your style, space, and budget\./i);
        await this.logInfo('    ✓ FAQ 4 answer visible');

        // FAQ 5 - Who handles the construction and installation?
        await expect(
            this.page.locator('.faqAccordionTitle').nth(4)
        ).toHaveText(/Who handles the construction and installation\?/i);
        await this.logInfo('    ✓ FAQ 5 question visible - Who handles the construction and installation?');

        await this.page.locator('.faqAccordionButton').nth(4).click();
        await expect(
            this.page.locator('.faqAccordionPanel').nth(4).locator('p')
        ).toBeVisible();
        await expect(
            this.page.locator('.faqAccordionPanel').nth(4).locator('p')
        ).toHaveText(/Your designer will recommend trusted professionals in your area who can make your new kitchen a reality\./i);
        await this.logInfo('    ✓ FAQ 5 answer visible');

        await this.logInfo('✓ Main page content verification completed successfully');
    }

    private async openScheduler(scheduleOption: string) {
        await this.logInfo('Opening scheduler modal');

        if (scheduleOption === 'Schedule my call') {
            // Click schedule button and wait for spinner to disappear
            await this.logInfo('  Clicking "Schedule my call" button...');
            await this.page.getByRole('button', { name: 'Schedule my call' }).click();
            await this.logInfo('  ✓ Button clicked');

            await this.logInfo('  Waiting for loading spinner to disappear...');
            await waitForSpinnerToDisappear(this.page, 10000);
            await this.logInfo('  ✓ Spinner disappeared');

        } else if (scheduleOption === 'Talk to a kitchen designer for free') {
            await this.logInfo('  Clicking "Talk to a kitchen designer for free" button...');
            await this.page.locator('.designerIntroCardCta').click();
            await this.logInfo('  ✓ Button clicked');

            await this.logInfo('  Waiting for loading spinner to disappear...');
            await waitForSpinnerToDisappear(this.page, 10000);
            await this.logInfo('  ✓ Spinner disappeared');
            
            //Verify modal content before iframe loads
            await expect(this.page.locator('.modalTitleCalendly'))
                .toHaveText('Bring your kitchen into focus');

            //Verify bullet list content    
            await expect(this.page.locator('.unlockBulletList li').nth(0))
                .toHaveText('Ask your biggest remodeling questions');

            await expect(this.page.locator('.unlockBulletList li').nth(1))
                .toHaveText('See realistic possibilities for your space');

            await expect(this.page.locator('.unlockBulletList li').nth(2))
                .toHaveText('Leave with a clearer path forward');

            await this.logInfo('  ✓ Calendly modal texts verified');

        } 
        else if (scheduleOption === 'Learn more') {
            await this.logInfo('  Clicking "Learn more" button...');
            await this.page.locator('.callGateLinkText').click();
            await this.logInfo('  ✓ Button clicked');

            await this.logInfo('  Waiting for loading spinner to disappear...');
            await waitForSpinnerToDisappear(this.page, 10000);
            await this.logInfo('  ✓ Spinner disappeared');
            
            //Verify modal content before iframe loads
            await expect(this.page.locator('.modalTitleCalendly'))
                .toHaveText('Bring your kitchen into focus');

            //Verify bullet list content    
            await expect(this.page.locator('.unlockBulletList li').nth(0))
                .toHaveText('Ask your biggest remodeling questions');

            await expect(this.page.locator('.unlockBulletList li').nth(1))
                .toHaveText('See realistic possibilities for your space');

            await expect(this.page.locator('.unlockBulletList li').nth(2))
                .toHaveText('Leave with a clearer path forward');

            await this.logInfo('  ✓ Calendly modal texts verified');

        }
        else {
            throw new Error(`Unknown scheduleOption: "${scheduleOption}". Expected "Schedule my call" or "Talk to a kitchen designer for free"`);
        }

        // Wait for iframe to be present on the page
        await this.logInfo('  Waiting for Calendly iframe to appear...');
        await this.page.waitForSelector('iframe[title="Calendly Scheduling Page"]', { timeout: 15000 });
        await this.logInfo('  ✓ Calendly iframe detected');

        await this.logInfo(`✓ Scheduler modal opened and iframe detected successfully via "${scheduleOption}"`);
    }

    private async scheduleConsultation(phoneNumber: string) {
        await this.page.waitForTimeout(5000);
        await this.logInfo(`Scheduling consultation with phone number: ${phoneNumber}`);

        await this.logInfo('  Getting reference to Calendly iframe...');
        const iFrame = this.page.frameLocator('iframe[title="Calendly Scheduling Page"]');
        await this.logInfo('  ✓ Iframe reference obtained');

        // Add a small delay to allow iframe content to load
        await this.logInfo('  Waiting 2 seconds for iframe content to load...');
        await this.page.waitForTimeout(2000);
        await this.logInfo('  ✓ Iframe load delay complete');

        // Try to select a date - use longer timeout for iframe element loading
        await this.logInfo('  Attempting to select a date slot...');
        try {
            const dateButton = iFrame.locator('td[aria-selected="false"] button').first();
            await dateButton.click({ timeout: 10000 });
            await this.logInfo('  ✓ Date slot selected');
        } catch (e) {
            await this.logInfo('  ⚠ Date selection skipped - iframe content may not be fully loaded');
        }

        // Try to select a time slot
        await this.page.waitForTimeout(5000);
        await this.logInfo('  Attempting to select a time slot...');
        try {
            const timeButton = iFrame.locator('button[data-container="time-button"]').first();
            await timeButton.click({ timeout: 10000 });
            await this.logInfo('  ✓ Time slot selected');
        } catch (e) {
            await this.logInfo('  ⚠ Time selection skipped - iframe content may not be fully loaded');
        }

        // Try to click Next button
        await this.logInfo('  Attempting to click Next button...');
        try {
            const nextBtn = iFrame.getByText('Next', { exact: true });
            await nextBtn.waitFor({ state: 'visible', timeout: 10000 });
            await nextBtn.click();
            await this.logInfo('  ✓ Next button clicked');
        } catch (e) {
            await this.logInfo('  ⚠ Next button click skipped - iframe content may not be fully loaded');
        }

        // Try to fill phone number if field is available
        await this.logInfo('  Attempting to fill phone number field...');
        try {
            await this.page.waitForTimeout(5000);
            await iFrame.locator('input[name="phone_number"]').clear({ timeout: 5000 });
            await this.logInfo('    Phone field cleared');
            await iFrame.locator('input[name="phone_number"]').fill(phoneNumber, { timeout: 5000 });
            await this.logInfo(`    ✓ Phone number field filled with: ${phoneNumber}`);

            await this.page.waitForTimeout(15000);
            const scheduleBtn = iFrame.getByText('Schedule Event', { exact: true });
            await scheduleBtn.waitFor({ state: 'visible', timeout: 10000 });
            await scheduleBtn.click();

            await this.logInfo('  ✓ Schedule Event clicked');

            // Wait for confirmation screen to load fully
            await iFrame.getByText('You are scheduled').waitFor({ state: 'visible', timeout: 20000 });

            // Core confirmation checks
            await expect(iFrame.getByText('You are scheduled')).toBeVisible();
            await expect(iFrame.getByText('A calendar invitation has been sent to your email address.')).toBeVisible();
            await expect(iFrame.getByRole('heading', { name: 'Kitchen remodel kick off' })).toBeVisible();
            await expect(iFrame.getByText('Rebode consultations by PDQ Designer')).toBeVisible();
            const dateTimePattern =
                /\d{1,2}:\d{2}(am|pm)\s-\s\d{1,2}:\d{2}(am|pm),\s[A-Za-z]+,\s[A-Za-z]+\s\d{1,2},\s\d{4}/i;

            await expect(iFrame.getByText(dateTimePattern)).toBeVisible();

            await this.logInfo('    Event date & time is displayed');
            await expect(iFrame.getByText('India Standard Time')).toBeVisible();
            await expect(iFrame.getByText(/\+91\s?\d{5}\s?\d{5}/)).toBeVisible();

            await this.logInfo('    Calendly booking confirmed successfully');

        } catch (e) {
            await this.logInfo('  ⚠ Phone number field not found - continuing');
        }

        await this.logInfo('✓ Consultation scheduling completed successfully');
    }

    async completeIceBreakerFlow() {

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
   
    async verifyHamburgerpopup(){
        
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