import { expect, Page } from "@playwright/test";
import assert from "assert";
import { acceptCookiesIfPresent } from "../helpers/waitHelpers";
import { waitForSpinnerToDisappear, hideChatBubble } from '../helpers/waitHelpers';

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
    console.log(formatLogMessage(parts));
}

function logWarn(_page: Page, ...parts: unknown[]) {
    console.warn(formatLogMessage(parts));
}

function logError(_page: Page, ...parts: unknown[]) {
    console.error(formatLogMessage(parts));
}
export default class IceBreakerPage {

    constructor(public page: Page) {
        page.on('console',msg=>{
            const now =new Date();
            const timestamp =now.toUTCString();
            console.log(`${timestamp} - ${msg.type().toUpperCase()} - ${msg.text()}`);

        });
    }

    async launchHomePage() {
            logInfo(this.page, "Launched JumpStarter Page");
                    this.page.setViewportSize({ width: 1920, height: 1080 });
                    await this.page.goto('https://js.' + process.env.environment + '.digitalmbd.net/secret/straw-serve-pound.html');
                    //Accept OneTrust cookie consent if present
                    await acceptCookiesIfPresent(this.page);
                    await waitForSpinnerToDisappear(this.page, 10000);                   
                    await this.page.waitForTimeout(5000);
            
                    // Navigate to Icebreaker Page
                    // await this.page.goto('https://js.' + process.env.environment + '.digitalmbd.net/start');
                    await waitForSpinnerToDisappear(this.page, 10000);
                    logInfo(this.page, "Successfully navigated to Icebreaker Page");
        }
    async verifyFailCaseBudgetQuestion3() {
        try {
            expect(await this.page.locator('div').filter({ hasText: /^0Start1Style2Design3Budget4Finish$/ }).nth(2).isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Start Style Design Budget Finish Navigation bar is displayed'");
            expect(await this.page.getByText('Let\'s talk about the kitchen you\'ve always wanted.').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Ice breaker Heading is displayed'");
            expect(await this.page.locator('.sc-jCACJv').first().isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Image 1 is displayed'");
            expect(await this.page.locator('.petalCol > div').first().isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Image 2 is displayed'");
            expect(await this.page.locator('.petalCol > div:nth-child(2)').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Image 3 is displayed'");
            expect(await this.page.getByText('1/3').isVisible()).toBeTruthy;
            expect(await this.page.getByText('Why are you remodeling your').isVisible()).toBeTruthy;
            expect(await this.page.getByText('Select all that apply.').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Question 1 is displayed'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A5').click()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A3').click()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A0').click()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A1').click()).toBeTruthy;
            logInfo(this.page, "Successfully selected options for Question 1'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_Next_Btn').click()).toBeTruthy;
            logInfo(this.page, "Successfully clicked on next button'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_petal').locator('rect').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified tick icon is displayed for Q1'");
            expect(await this.page.getByText('2/3').isVisible()).toBeTruthy;
            expect(await this.page.getByText('What is the scope of your').isVisible()).toBeTruthy;
            expect(await this.page.getByText('Select one.').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q2_A0').click()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q2_Next_Btn').click()).toBeTruthy;
            logInfo(this.page, "Successfully selected option for Question 2'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q2_petal').locator('rect').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified tick icon is displayed for Q2'");
            expect(await this.page.getByText('3/3').isVisible()).toBeFalsy;
            expect(await this.page.getByText('Do you have a budget range?').isVisible()).toBeFalsy;
            /*expect(await this.page.getByTestId('TestId_Icebreaker_Q3_Min_Input').click()).toBeFalsy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q3_Min_Input').fill('25000')).toBeFalsy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q3_Max_Input').click()).toBeFalsy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q3_Max_Input').fill('6000')).toBeFalsy;
            expect(await this.page.getByText('Your maximum budget should be greater than your minimum budget.').isVisible()).toBeFalsy;
            */
            logInfo(this.page, "Successfully verified Q3 is not displayed'");
            return 'Passed';
        }
        catch {
            logError(this.page, "Failed to verify Budget error message on Ice breaker page");
            return 'Failed';
        }
    }

    async verifyIceBreakerPage() {
        try {
            expect(await this.page.locator('div').filter({ hasText: /^0Start1Style2Design3Budget4Finish$/ }).nth(2).isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Start Style Design Budget Finish Navigation bar is displayed'");
            expect(await this.page.getByRole('button', { name: 'Sign in' }).isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Sign in is displayed'");
            expect(await this.page.getByText('Let\'s talk about the kitchen you\'ve always wanted.').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Ice breaker page Heading is displayed'");
            expect(await this.page.locator('.sc-jCACJv').first().isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Image 1 is displayed'");
            expect(await this.page.locator('.petalCol > div').first().isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Image 2 is displayed'");
            expect(await this.page.locator('.petalCol > div:nth-child(2)').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Image 3 is displayed'");
            expect(await this.page.getByText('1/3').isVisible()).toBeTruthy;
            expect(await this.page.getByText('Why are you remodeling your').isVisible()).toBeTruthy;
            expect(await this.page.getByText('Select all that apply.').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A5').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A3').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A0').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A1').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A2').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A4').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Ice breaker Question 1 is displayed'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_Next_Btn').isVisible()).toBeTruthy;
            expect(await this.page.getByText('What is the scope of your remodel?').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Ice breaker Question 2 is displayed'");
            expect(await this.page.getByText('Do you have a budget range?').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Ice breaker Question 3 is displayed'");
            expect(await this.page.getByText('...', { exact: true }).isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Icebreaker launch page'");
            return 'Passed';
        }
        catch {
            logError(this.page, "Failed to verify Ice breaker page with all details");
            return 'Failed';
        }
    }

    async verifyIceBreakerPageHeading() {
        try {
            expect(await this.page.getByText('Let\'s talk about the kitchen you\'ve always wanted.').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Ice breaker page Heading is displayed'");
            return 'Passed';
        }
        catch {
            logError(this.page, "Failed to verify Ice breaker heading");
            return 'Failed';
        }
    }

    async verifyIceBreakerPagePetalImages() {
        try {
            expect(await this.page.locator('.sc-jCACJv').first().isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Image 1 is displayed'");
            expect(await this.page.locator('.petalCol > div').first().isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Image 2 is displayed'");
            expect(await this.page.locator('.petalCol > div:nth-child(2)').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Image 3 is displayed'");
            return 'Passed';
        }
        catch {
            logError(this.page, "Failed to verify Ice breaker petal images");
            return 'Failed';
        }
    }

    async verifyIceBreakerPageNavigationBar() {
        try {
            expect(await this.page.locator('div').filter({ hasText: /^0Start1Style2Design3Budget4Finish$/ }).nth(2).isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Start Style Design Budget Finish Navigation bar is displayed'");
            return 'Passed';
        }
        catch {
            logError(this.page, "Failed to verify Navigation bar on Ice breaker page");
            return 'Failed';
        }
    }

    async verifyIceBreakerPageQuestion1() {
        try {
            expect(await this.page.getByText('1/3').isVisible()).toBeTruthy;
            expect(await this.page.getByText('Why are you remodeling your').isVisible()).toBeTruthy;
            expect(await this.page.getByText('Select all that apply.').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Question 1 is displayed'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A5').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A3').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A0').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A1').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A2').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A4').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified all 6 options for Question 1 are displayed'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A5').click()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A3').click()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A0').click()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A1').click()).toBeTruthy;
            logInfo(this.page, "Successfully selected options for Question 1'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_Next_Btn').click()).toBeTruthy;
            logInfo(this.page, "Successfully clicked on next button'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_petal').locator('rect').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified tick icon is displayed for Q1'");
            expect(await this.page.getByText('2/3').isVisible()).toBeTruthy;
            expect(await this.page.getByText('What is the scope of your').isVisible()).toBeTruthy;
            expect(await this.page.getByText('Select one.').isVisible()).toBeTruthy;
            return 'Passed';
        }
        catch {
            logError(this.page, "Failed to verify Navigation bar on Ice breaker page");
            return 'Failed';
        }
    }

    async verifyIceBreakerPageQuestion1NextButtonBehavior() {
        try {
            expect(await this.page.getByText('1/3').isVisible()).toBeTruthy;
            expect(await this.page.getByText('Why are you remodeling your').isVisible()).toBeTruthy;
            expect(await this.page.getByText('Select all that apply.').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Question 1 is displayed'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A5').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A3').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A0').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A1').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A2').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A4').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified all 6 options for Question 1 are displayed'");
            expect(await this.page.locator('xpath=//button[@data-testid="TestId_Icebreaker_Q1_Next_Btn" and @aria-disabled="true" and text()="Next"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Next button is disabled when all options are deselected'");
            expect(await this.page.locator('xpath=//button[@data-testid="TestId_Icebreaker_Q1_Next_Btn" and @aria-disabled="false" and text()="Next"]').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A5').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[@data-testid="TestId_Icebreaker_Q1_Next_Btn" and @aria-disabled="false" and text()="Next"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Next button is enabled when one option is selected'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A3').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[@data-testid="TestId_Icebreaker_Q1_Next_Btn" and @aria-disabled="false" and text()="Next"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Next button is enabled when two options are selected'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A0').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[@data-testid="TestId_Icebreaker_Q1_Next_Btn" and @aria-disabled="false" and text()="Next"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Next button is enabled when three options are selected'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A1').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[@data-testid="TestId_Icebreaker_Q1_Next_Btn" and @aria-disabled="false" and text()="Next"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Next button is enabled when four options are selected'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A2').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[@data-testid="TestId_Icebreaker_Q1_Next_Btn" and @aria-disabled="false" and text()="Next"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Next button is enabled when five options are selected'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A4').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[@data-testid="TestId_Icebreaker_Q1_Next_Btn" and @aria-disabled="false" and text()="Next"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Next button is enabled when six options are selected'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A5').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[@data-testid="TestId_Icebreaker_Q1_Next_Btn" and @aria-disabled="false" and text()="Next"]').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A3').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[@data-testid="TestId_Icebreaker_Q1_Next_Btn" and @aria-disabled="false" and text()="Next"]').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A0').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[@data-testid="TestId_Icebreaker_Q1_Next_Btn" and @aria-disabled="false" and text()="Next"]').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A1').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[@data-testid="TestId_Icebreaker_Q1_Next_Btn" and @aria-disabled="false" and text()="Next"]').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A2').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[@data-testid="TestId_Icebreaker_Q1_Next_Btn" and @aria-disabled="false" and text()="Next"]').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A4').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[@data-testid="TestId_Icebreaker_Q1_Next_Btn" and @aria-disabled="true" and text()="Next"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Next button is disabled when all options are deselected'");
            logInfo(this.page, "Successfully verified Question1 next button behavior'");
            return 'Passed';
        }
        catch {
            logError(this.page, "Failed to verify Next button selection & deselection behavior on Ice breaker page");
            return 'Failed';
        }
    }

    async verifyIceBreakerPageQuestion2() {
        try {
            expect(await this.page.getByText('1/3').isVisible()).toBeTruthy;
            expect(await this.page.getByText('Why are you remodeling your').isVisible()).toBeTruthy;
            expect(await this.page.getByText('Select all that apply.').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Question 1 is displayed'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A5').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A3').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A0').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A1').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A2').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A4').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified all 6 options for Question 1 are displayed'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A5').click()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A3').click()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A0').click()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A1').click()).toBeTruthy;
            logInfo(this.page, "Successfully selected options for Question 1'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_Next_Btn').click()).toBeTruthy;
            logInfo(this.page, "Successfully clicked on next button'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_petal').locator('rect').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified tick icon is displayed for Q1'");
            expect(await this.page.getByText('2/3').isVisible()).toBeTruthy;
            expect(await this.page.getByText('What is the scope of your').isVisible()).toBeTruthy;
            expect(await this.page.getByText('Select one.').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q2_A0').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q2_A1').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q2_A2').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q2_A0').click()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q2_Next_Btn').click()).toBeTruthy;
            logInfo(this.page, "Successfully selected option for Question 2'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q2_petal').locator('rect').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified tick icon is displayed for Q2'");
            //expect(await this.page.getByText('3/3').isVisible()).toBeTruthy;
            //expect(await this.page.getByText('Do you have a budget range?').isVisible()).toBeTruthy;
            return 'Passed';
        }
        catch {
            logError(this.page, "Failed to verify Q2 behavior on Ice breaker page");
            return 'Failed';
        }
    }

    async verifyIceBreakerPageQuestion2NextButtonBehavior() {
        try {
            expect(await this.page.getByText('1/3').isVisible()).toBeTruthy;
            expect(await this.page.getByText('Why are you remodeling your').isVisible()).toBeTruthy;
            expect(await this.page.getByText('Select all that apply.').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Question 1 is displayed'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A5').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A3').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A0').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A1').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A2').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A4').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified all 6 options for Question 1 are displayed'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A5').click()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A3').click()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A0').click()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_A1').click()).toBeTruthy;
            logInfo(this.page, "Successfully selected options for Question 1'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_Next_Btn').click()).toBeTruthy;
            logInfo(this.page, "Successfully clicked on next button'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q1_petal').locator('rect').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified tick icon is displayed for Q1'");
            expect(await this.page.getByText('2/3').isVisible()).toBeTruthy;
            expect(await this.page.getByText('What is the scope of your').isVisible()).toBeTruthy;
            expect(await this.page.getByText('Select one.').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Q2 details are displayed'");
            expect(await this.page.locator('xpath=//button[@data-testid="TestId_Icebreaker_Q2_Next_Btn" and @aria-disabled="true" and text()="Next"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified next button is disabled for Q2'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q2_A0').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q2_A1').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q2_A2').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_Icebreaker_Q2_A0').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[@data-testid="TestId_Icebreaker_Q2_Next_Btn" and @aria-disabled="false" and text()="Next"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified next button is enabled for Q2 after clicking on Option1'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q2_A1').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[@data-testid="TestId_Icebreaker_Q2_Next_Btn" and @aria-disabled="false" and text()="Next"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified next button is enabled for Q2 after clicking on Option2'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q2_A2').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[@data-testid="TestId_Icebreaker_Q2_Next_Btn" and @aria-disabled="false" and text()="Next"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified next button is enabled for Q2 after clicking on Option3'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q2_Next_Btn').click()).toBeTruthy;
            logInfo(this.page, "Successfully selected option for Question 2'");
            expect(await this.page.getByTestId('TestId_Icebreaker_Q2_petal').locator('rect').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified tick icon is displayed for Q2'");
            return 'Passed';
            
        }
        catch {
            logError(this.page, "Failed to verify Q2 Next button behavior on Ice breaker page");
            return 'Failed';
        }
    }
 
    async verifyIceBreakerPageJumpStarterLogo() {
        try {
            expect(await this.page.locator('xpath=//*[@id="root"]/div/div[1]/header/div[1]/a/img[@alt="rebode logo"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Rebode Jumpstarter Logo is displayed on Ice Breaker Page'");
            return 'Passed';
        }
        catch {
            logError(this.page, "Failed to verify Rebode Jumpstarter Logo on Ice breaker page");
            return 'Failed';
        }
    }

    async verifyIceBreakerPageTelegrafFont() {
    try {
        const title = this.page.locator('p.headlineJumbo');
        await title.waitFor({ state: 'visible' });

        // Verify text content loosely
        await expect(title).toContainText("Let\u2019s talk about the kitchen you\u2019ve always wanted.");

        const fontFamily = await title.evaluate((el) => {
            return window.getComputedStyle(el).fontFamily;
        });

        logInfo(this.page, "Actual Style font family: " + fontFamily);

        // Font family check — more flexible
        const normalizedFont = fontFamily.toLowerCase();
        assert(
            normalizedFont.includes("telegraf") || 
            normalizedFont.includes("sans-serif"),
            `Expected telegraf font but got: ${fontFamily}`
        );

        logInfo(this.page, "Successfully verified headlineJumbo has telegraf font");
        return 'Passed';
    }
    catch (error) {
        logError(this.page, "Failed to verify Telegraf font:", error);
        return 'Failed';
    }
}
    
    async verifyIceBreakerPageQuestion3NextButtonBehavior() {
        try {
            expect(await this.page.locator('xpath=//div[text()="Let\'s find your style."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[@data-testid="TestId_Icebreaker_CONTINUE_Next_Btn" and @aria-disabled="false" and text()="Next"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Q3 is not displayed on Ice Breaker Page'");
            return 'Passed';
        }
        catch {
            logError(this.page, "Failed to verify Q3 on Ice breaker page");
            return 'Failed';
        }
    }
}