import { expect, Page } from "@playwright/test";
import AuthHelper from '../helpers/api-helpers';
import { registerWithIAMOtp } from '../helpers/accountRegistrationWithIAMOTP';
import assert from "assert";
import * as path from 'path';

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
let userId: string;
let password = process.env.password as string;

export default class MatchmakerMomentsPage {

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
        this.page.setViewportSize({width:1920,height:1080});
        await this.page.goto('https://js.' + process.env.environment + '.digitalmbd.net/secret/straw-serve-pound.html');
        //navigate to icebreaker page
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
        logInfo(this.page, "Successfully navigated to Icebreaker page");
    }

    async getProjectID(): Promise<string> {
        await this.page.goto('https://js.' + process.env.environment + '.digitalmbd.net/secret/straw-serve-pound.html');
        const [response] = await Promise.all([
            this.page.waitForResponse(response =>
                response.url().includes('/projectprofile/v1/projects') && (response.status()===200 || response.status()===201)),
            
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
      
    async verifyStyleAdChoiceThenDesignBudgetOutOfWave() {
         let coookieFlag=this.page.locator('xpath=//*[@id="onetrust-close-btn-container"]/button').count(); 
        if((await coookieFlag).valueOf()===1)
        {
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
        expect(await this.page.locator('xpath=(//div[text()="Minimalist"])[2]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div[1]/div/div[2]/div/div/div[1]/div[1]').isVisible()).toBeTruthy;
        await this.page.getByRole('button', { name: 'Find a pro' }).scrollIntoViewIfNeeded();
        await this.page.getByRole('button', { name: 'Find a pro' }).hover();
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div[1]/div/div[2]/div/div/div[1]/button').isEnabled()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div[1]/div/div[2]/div/div/div[1]/button').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div[1]/div/div[2]/div/div/div[1]/button').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="chakra-modal-:r4:"]/div/div[1]').isVisible()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/overview'); 
        await this.page.getByTestId('TestId_Profile_Overview_Tab').isVisible();
        await this.page.getByTestId('TestId_Profile_Style_Tab').isVisible();
        await this.page.getByTestId('TestId_Profile_Design_Tab').isVisible();
        await this.page.getByTestId('TestId_Profile_Budget_Tab').isVisible();
        await this.page.getByTestId('TestId_Profile_Style_Tab').click();
        await this.page.getByText('My favorite style').isVisible();
        await this.page.getByText('Minimalist').isVisible();
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div/div/div/div[2]/div/div[1]/div/div[2]/div[3]/div[2]/text()').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div/div/div/div[2]/div/div[2]/img').isVisible()).toBeTruthy;
        await this.page.getByText('Minimalist style choices').isVisible();
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div/div/div/div[2]/div/div[3]/div[2]/text()').isVisible()).toBeTruthy;
        await this.page.getByTestId('TestId_Profile_Design_Tab').click();
        expect(await this.page.locator('xpath=//div[text()="A few more details will bring your design to life."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Complete this section"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Discover your dream kitchen concept"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Describe your kitchen lifestyle—we’ll match it with a concept made for you."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Explore smart kitchen ideas"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Get inspired by space-saving storage solutions."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Make the most of your space"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Get a precise 3D view—maximize your kitchen space with ease."]').isVisible()).toBeTruthy;
        await this.page.getByTestId('TestId_Profile_Budget_Tab').click();
        expect(await this.page.locator('xpath=//div[text()="Keep your project on track - set your budget estimate."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Complete this section"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Start planning your remodel budget"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Use our budget estimator tool to create a remodel plan that works for your wallet."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Budget breakdown"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Review your guidelines and learn more about how to get the most of your remodeling budget."]').isVisible()).toBeTruthy;

    }

    async verifyStyleAdChoiceThenStops() {
        let coookieFlag=this.page.locator('xpath=//*[@id="onetrust-close-btn-container"]/button').count(); 
        if((await coookieFlag).valueOf()===1)
        {
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
        expect(await this.page.locator('xpath=(//div[text()="Minimalist"])[2]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div[1]/div/div[2]/div/div/div[1]/div[1]').isVisible()).toBeTruthy;
        await this.page.getByRole('button', { name: 'Find a pro' }).scrollIntoViewIfNeeded();
        await this.page.getByRole('button', { name: 'Find a pro' }).hover();
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div[1]/div/div[2]/div/div/div[1]/button').isEnabled()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div[1]/div/div[2]/div/div/div[1]/button').focus()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div[1]/div/div[2]/div/div/div[1]/button').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="chakra-modal-:r4:"]/div/div[1]').isVisible()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/overview'); 
        await this.page.getByTestId('TestId_Profile_Overview_Tab').isVisible();
        await this.page.getByTestId('TestId_Profile_Style_Tab').isVisible();
        await this.page.getByTestId('TestId_Profile_Design_Tab').isVisible();
        await this.page.getByTestId('TestId_Profile_Budget_Tab').isVisible();
        await this.page.getByTestId('TestId_Profile_Style_Tab').click();
        await this.page.getByText('My favorite style').isVisible();
        await this.page.getByText('Minimalist').isVisible();
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div/div/div/div[2]/div/div[1]/div/div[2]/div[3]/div[2]/text()').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div/div/div/div[2]/div/div[2]/img').isVisible()).toBeTruthy;
        await this.page.getByText('Minimalist style choices').isVisible();
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div/div/div/div[2]/div/div[3]/div[2]/text()').isVisible()).toBeTruthy;
        await this.page.getByTestId('TestId_Profile_Design_Tab').click();
        expect(await this.page.locator('xpath=//div[text()="A few more details will bring your design to life."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Complete this section"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Discover your dream kitchen concept"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Describe your kitchen lifestyle—we’ll match it with a concept made for you."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Explore smart kitchen ideas"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Get inspired by space-saving storage solutions."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Make the most of your space"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Get a precise 3D view—maximize your kitchen space with ease."]').isVisible()).toBeTruthy;
        await this.page.getByTestId('TestId_Profile_Budget_Tab').click();
        expect(await this.page.locator('xpath=//div[text()="Keep your project on track - set your budget estimate."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Complete this section"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Start planning your remodel budget"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Use our budget estimator tool to create a remodel plan that works for your wallet."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Budget breakdown"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Review your guidelines and learn more about how to get the most of your remodeling budget."]').isVisible()).toBeTruthy;
    }

   
     async verifyDesignAdChoiceThenStops() {
        let coookieFlag=this.page.locator('xpath=//*[@id="onetrust-close-btn-container"]/button').count(); 
        if((await coookieFlag).valueOf()===1)
        {
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
        expect(await this.page.locator('xpath=(//div[text()="Minimalist"])[2]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Next"]').focus()).toBeTruthy; 
        expect(await this.page.locator('xpath=//*[@id="dockedNavigation"]/button[2]').focus()).toBeTruthy;       
        expect(await this.page.locator('xpath=//*[@id="dockedNavigation"]/button[2]').click({ force :true})).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design');
        await this.page.getByTestId('TestId_Design_Q1_A5').locator('g rect').click();
        await this.page.getByTestId('TestId_Style_Q1_Next_Btn').click();
        await this.page.getByTestId('TestId_Design_Q2_A0').click();
        await this.page.getByTestId('TestId_Style_Q2_Next_Btn').click();
        await this.page.getByText('Greater than 350 square feet').click();
        await this.page.getByTestId('TestId_Style_Q3_Next_Btn').click();
        await this.page.getByTestId('TestId_Design_Q4_A2').click();
        await this.page.getByTestId('TestId_Style_Q4_Next_Btn').click();
        await this.page.getByTestId('TestId_Style_Continue_Next_Btn').click();
        await this.page.getByText('Accessible and user-friendly').hover();
        await this.page.getByText('Accessible and user-friendly').focus();
        await this.page.getByText('Accessible and user-friendly').click();
        await this.page.getByText('Clutter control').focus();
        await this.page.getByText('Clutter control').click();
        await this.page.getByText('Coffee and tea').focus();
        await this.page.getByText('Coffee and tea').click();
        expect(await this.page.locator('xpath=//div[text()="Brew Hub"]').isVisible()).toBeTruthy;
        await this.page.getByTestId('TestId_DockNavigation_Next_Btn').focus();
        await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click();
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/storage');
        await this.page.getByTestId('TestId_DockNavigation_Next_Btn').focus();
        await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click();
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/cabinets');
        await this.page.getByTestId('TestId_Design_Cabinets_Semi-customCabinets_Select_Btn').click();
        await this.page.getByRole('button', { name: 'Find a pro' }).scrollIntoViewIfNeeded();
        await this.page.getByRole('button', { name: 'Find a pro' }).hover();
        await this.page.getByRole('button', { name: 'Find a pro' }).focus();
        await this.page.getByRole('button', { name: 'Find a pro' }).click();        
        expect(await this.page.locator('xpath=//*[@id="chakra-modal-:r4:"]/div/div[1]').isVisible()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/overview'); 
        await this.page.getByTestId('TestId_Profile_Overview_Tab').isVisible();
        await this.page.getByTestId('TestId_Profile_Style_Tab').isVisible();
        await this.page.getByTestId('TestId_Profile_Design_Tab').isVisible();
        await this.page.getByTestId('TestId_Profile_Budget_Tab').isVisible();
        await this.page.getByTestId('TestId_Profile_Style_Tab').click();
        await this.page.getByText('My favorite style').isVisible();
        await this.page.getByText('Minimalist').isVisible();
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div/div/div/div[2]/div/div[1]/div/div[2]/div[3]/div[2]/text()').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div/div/div/div[2]/div/div[2]/img').isVisible()).toBeTruthy;
        await this.page.getByText('Minimalist style choices').isVisible();
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div/div/div/div[2]/div/div[3]/div[2]/text()').isVisible()).toBeTruthy;
        await this.page.getByTestId('TestId_Profile_Design_Tab').click();
        expect(await this.page.locator('xpath=//div[text()="A few more details will bring your design to life."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Complete this section"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Discover your dream kitchen concept"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Describe your kitchen lifestyle—we’ll match it with a concept made for you."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Explore smart kitchen ideas"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Get inspired by space-saving storage solutions."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Make the most of your space"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Get a precise 3D view—maximize your kitchen space with ease."]').isVisible()).toBeTruthy;
        await this.page.getByTestId('TestId_Profile_Budget_Tab').click();
        expect(await this.page.locator('xpath=//div[text()="Keep your project on track - set your budget estimate."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Complete this section"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Start planning your remodel budget"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Use our budget estimator tool to create a remodel plan that works for your wallet."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Budget breakdown"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Review your guidelines and learn more about how to get the most of your remodeling budget."]').isVisible()).toBeTruthy;
    }

    async verifyDesignAdChoiceThenDesignBudgetOutOfWave() {
        let coookieFlag=this.page.locator('xpath=//*[@id="onetrust-close-btn-container"]/button').count(); 
        if((await coookieFlag).valueOf()===1)
        {
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
        expect(await this.page.locator('xpath=(//div[text()="Minimalist"])[2]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Next"]').focus()).toBeTruthy; 
        expect(await this.page.locator('xpath=//*[@id="dockedNavigation"]/button[2]').focus()).toBeTruthy;       
        expect(await this.page.locator('xpath=//*[@id="dockedNavigation"]/button[2]').click({ force :true})).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design');
        await this.page.getByTestId('TestId_Design_Q1_A5').locator('g rect').click();
        await this.page.getByTestId('TestId_Style_Q1_Next_Btn').click();
        await this.page.getByTestId('TestId_Design_Q2_A0').click();
        await this.page.getByTestId('TestId_Style_Q2_Next_Btn').click();
        await this.page.getByText('Greater than 350 square feet').click();
        await this.page.getByTestId('TestId_Style_Q3_Next_Btn').click();
        await this.page.getByTestId('TestId_Design_Q4_A2').click();
        await this.page.getByTestId('TestId_Style_Q4_Next_Btn').click();
        await this.page.getByTestId('TestId_Style_Continue_Next_Btn').click();
        await this.page.getByText('Accessible and user-friendly').hover();
        await this.page.getByText('Accessible and user-friendly').focus();
        await this.page.getByText('Accessible and user-friendly').click();
        await this.page.getByText('Clutter control').focus();
        await this.page.getByText('Clutter control').click();
        await this.page.getByText('Coffee and tea').focus();
        await this.page.getByText('Coffee and tea').click();
        expect(await this.page.locator('xpath=//div[text()="Brew Hub"]').isVisible()).toBeTruthy;
        await this.page.getByTestId('TestId_DockNavigation_Next_Btn').focus();
        await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click();
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/storage');
        await this.page.getByTestId('TestId_DockNavigation_Next_Btn').focus();
        await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click();
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/cabinets');
        await this.page.getByTestId('TestId_Design_Cabinets_Semi-customCabinets_Select_Btn').click();
        await this.page.getByRole('button', { name: 'Find a pro' }).scrollIntoViewIfNeeded();
        await this.page.getByRole('button', { name: 'Find a pro' }).hover();
        await this.page.getByRole('button', { name: 'Find a pro' }).focus();
        await this.page.getByRole('button', { name: 'Find a pro' }).click();        
        expect(await this.page.locator('xpath=//*[@id="chakra-modal-:r4:"]/div/div[1]').isVisible()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/overview'); 
        await this.page.getByTestId('TestId_Profile_Overview_Tab').isVisible();
        await this.page.getByTestId('TestId_Profile_Style_Tab').isVisible();
        await this.page.getByTestId('TestId_Profile_Design_Tab').isVisible();
        await this.page.getByTestId('TestId_Profile_Budget_Tab').isVisible();
        await this.page.getByTestId('TestId_Profile_Style_Tab').click();
        await this.page.getByText('My favorite style').isVisible();
        await this.page.getByText('Minimalist').isVisible();
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div/div/div/div[2]/div/div[1]/div/div[2]/div[3]/div[2]/text()').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div/div/div/div[2]/div/div[2]/img').isVisible()).toBeTruthy;
        await this.page.getByText('Minimalist style choices').isVisible();
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div/div/div/div[2]/div/div[3]/div[2]/text()').isVisible()).toBeTruthy;
        await this.page.getByTestId('TestId_Profile_Design_Tab').click();
        expect(await this.page.locator('xpath=//div[text()="A few more details will bring your design to life."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Complete this section"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Discover your dream kitchen concept"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Describe your kitchen lifestyle—we’ll match it with a concept made for you."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Explore smart kitchen ideas"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Get inspired by space-saving storage solutions."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Make the most of your space"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Get a precise 3D view—maximize your kitchen space with ease."]').isVisible()).toBeTruthy;
        await this.page.getByTestId('TestId_Profile_Budget_Tab').click();
        expect(await this.page.locator('xpath=//div[text()="Keep your project on track - set your budget estimate."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Complete this section"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Start planning your remodel budget"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Use our budget estimator tool to create a remodel plan that works for your wallet."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Budget breakdown"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Review your guidelines and learn more about how to get the most of your remodeling budget."]').isVisible()).toBeTruthy;
    }

    async verifyMatchmakerDeclineAllOptions() {
        let coookieFlag=this.page.locator('xpath=//*[@id="onetrust-close-btn-container"]/button').count(); 
        if((await coookieFlag).valueOf()===1)
        {
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
        expect(await this.page.locator('xpath=(//div[text()="Minimalist"])[2]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//button[text()="Next"]').focus()).toBeTruthy; 
        expect(await this.page.locator('xpath=//*[@id="dockedNavigation"]/button[2]').focus()).toBeTruthy;       
        expect(await this.page.locator('xpath=//*[@id="dockedNavigation"]/button[2]').click({ force :true})).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design');
        await this.page.getByTestId('TestId_Design_Q1_A5').locator('g rect').click();
        await this.page.getByTestId('TestId_Style_Q1_Next_Btn').click();
        await this.page.getByTestId('TestId_Design_Q2_A0').click();
        await this.page.getByTestId('TestId_Style_Q2_Next_Btn').click();
        await this.page.getByText('Greater than 350 square feet').click();
        await this.page.getByTestId('TestId_Style_Q3_Next_Btn').click();
        await this.page.getByTestId('TestId_Design_Q4_A2').click();
        await this.page.getByTestId('TestId_Style_Q4_Next_Btn').click();
        await this.page.getByTestId('TestId_Style_Continue_Next_Btn').click();
        await this.page.getByText('Accessible and user-friendly').hover();
        await this.page.getByText('Accessible and user-friendly').focus();
        await this.page.getByText('Accessible and user-friendly').click();
        await this.page.getByText('Clutter control').focus();
        await this.page.getByText('Clutter control').click();
        await this.page.getByText('Coffee and tea').focus();
        await this.page.getByText('Coffee and tea').click();
        expect(await this.page.locator('xpath=//div[text()="Brew Hub"]').isVisible()).toBeTruthy;
        await this.page.getByTestId('TestId_DockNavigation_Next_Btn').focus();
        await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click();
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/storage');
        await this.page.getByTestId('TestId_DockNavigation_Next_Btn').focus();
        await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click();
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/cabinets');
        await this.page.getByTestId('TestId_Design_Cabinets_Semi-customCabinets_Select_Btn').click();
        await this.page.getByTestId('TestId_DockNavigation_Next_Btn').focus();
        await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click();
        await this.page.getByTestId('TestId_Budget_BudgetEstimator_Link').click();
        await this.page.getByTestId('TestId_BudgetEstimator_HomeValue_Input').click();
        await this.page.getByTestId('TestId_BudgetEstimator_HomeValue_Input').fill('9,9999');
        await this.page.getByTestId('TestId_BudgetEstimator_HomeValue_Input').press('Tab');
        await this.page.getByTestId('TestId_BudgetEstimator_PostalCode_Input').click();
        await this.page.getByTestId('TestId_BudgetEstimator_PostalCode_Input').fill('02018');
        await this.page.getByTestId('TestId_BudgetEstimator_PostalCode_Input').press('Tab');
        expect(await this.page.locator('xpath=//div/button[@data-testId="TestId_BudgetEstimator_ApplyRange_Btn" and @disabled]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div/button[@data-testId="TestId_BudgetEstimator_ApplyRange_Btn" and @disabled]').isVisible()).toBeFalsy;
        await this.page.getByTestId('TestId_BudgetEstimator_ApplyRange_Btn').click();
        await this.page.getByTestId('TestId_Budget_BudgetRange_Next_Btn').click();
        await this.page.getByTestId('TestId_Budget_Completed_Next_Button').click();
        expect(await this.page.locator('xpath=//*[@id="chakra-modal-:r4:"]/div/div[1]').isVisible()).toBeTruthy;
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/remodel/profile/overview'); 
        await this.page.getByTestId('TestId_Profile_Overview_Tab').isVisible();
        await this.page.getByTestId('TestId_Profile_Style_Tab').isVisible();
        await this.page.getByTestId('TestId_Profile_Design_Tab').isVisible();
        await this.page.getByTestId('TestId_Profile_Budget_Tab').isVisible();
        await this.page.getByText('Local design pros can offer').isVisible();
        await this.page.locator('.gm-style > div > div:nth-child(2)').isVisible();
        await this.page.getByText('Your dream kitchen concept').isVisible();
        await this.page.getByText('The Minimalist Brew Hub').isVisible();
        await this.page.getByText('Great brands to consider dura_supreme').isVisible();
        await this.page.locator('div').filter({ hasText: /^What do you think\?Please rate Rebode Jumpstarter\.$/ }).first().isVisible();        
        await this.page.getByTestId('TestId_Profile_Style_Tab').click();
        await this.page.getByText('My favorite style').isVisible();
        await this.page.getByText('Minimalist').isVisible();
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div/div/div/div[2]/div/div[1]/div/div[2]/div[3]/div[2]/text()').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div/div/div/div[2]/div/div[2]/img').isVisible()).toBeTruthy;
        await this.page.getByText('Minimalist style choices').isVisible();
        expect(await this.page.locator('xpath=//*[@id="root"]/div/div[2]/div/div/div/div[2]/div/div[3]/div[2]/text()').isVisible()).toBeTruthy;
        await this.page.getByTestId('TestId_Profile_Design_Tab').click();
        await this.page.getByText('Your dream kitchen concept').isVisible();
        await this.page.getByText('Brew Hub', { exact: true }).isVisible();
        await this.page.getByText('Welcome to the Brew Hub,').isVisible();
        await this.page.getByText('You said you want to remodel').isVisible();
        await this.page.locator('div').filter({ hasText: /^L-shaped$/ }).first().isVisible();
        await this.page.getByText('My current kitchen:').isVisible();
        await this.page.getByText('Accessible and user-friendly').first().isVisible();
        await this.page.getByText('Clutter control').first().isVisible();
        await this.page.locator('div').filter({ hasText: /^Coffee and tea$/ }).first().isVisible();
        await this.page.getByTestId('TestId_Profile_Budget_Tab').click();

        
    }

}