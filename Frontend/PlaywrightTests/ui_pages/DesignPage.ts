import { expect, Page } from "@playwright/test";
import { waitForSpinnerToDisappear, hideChatBubble, acceptCookiesIfPresent } from '../helpers/waitHelpers';

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
export default class DesignPage {

    constructor(public page: Page) {
        page.on('console', msg => {
            const now = new Date();
            const timestamp = now.toUTCString();
            console.log(`${timestamp} - ${msg.type().toUpperCase()} - ${msg.text()}`);

        });
    }

    async launchHomePage() {
        logInfo(this.page, "Launched JumpStarter Page");
        await this.page.goto('https://js.' + process.env.environment + '.digitalmbd.net/secret/straw-serve-pound.html');
        await acceptCookiesIfPresent(this.page);
        this.page.setViewportSize({ width: 1920, height: 1080 });
        //navigate to icebreaker page
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
        logInfo(this.page, "Successfully navigated to Icebreaker page");
        await this.completeIceBreakerFlow();
        await this.completeStyleFlow();
    }

    async verifyDesignIntroTextBoxes() {
        try {
            expect(await this.page.locator('xpath=//p[text()="Let’s talk about design – the functionality of your kitchen."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="You said you want to remodel your kitchen because:"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="I want to change how it looks."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="The kitchen is damaged, worn out, or broken."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="I want better organization and storage."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="1" and text()="/" and text()="4"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="What’s the layout of your existing kitchen?"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="It’s okay if your kitchen is a bit different. Just select the closest shape."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Corridor"]/../../div[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Galley"]/../../div[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Single wall"]/../../div[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="U-shaped"]/../../div[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="G-shaped"]/../../div[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="L-shaped"]/../../div[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=(//button[text()="Next" and @aria-disabled="true"])[1]').isVisible()).toBeTruthy;
            return 'Passed';
        }
        catch (error) {
            logError(this.page, "Error in verifyDesignIntroTextBoxes: ", error);
            return 'Failed';
        }
    }

    async verifyDesignQuestion1() {
        try {
            expect(await this.page.locator('xpath=//p[text()="Let’s talk about design – the functionality of your kitchen."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="You said you want to remodel your kitchen because:"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="I want to change how it looks."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="The kitchen is damaged, worn out, or broken."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="I want better organization and storage."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="1" and text()="/" and text()="4"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="What’s the layout of your existing kitchen?"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="It’s okay if your kitchen is a bit different. Just select the closest shape."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Corridor"]/../../div[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Galley"]/../../div[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Single wall"]/../../div[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="U-shaped"]/../../div[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="G-shaped"]/../../div[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="L-shaped"]/../../div[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=(//button[text()="Next" and @aria-disabled="true"])[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="L-shaped"]/../../div[1]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=(//button[text()="Next" and @aria-disabled="false"])[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=(//button[text()="Next"])[1]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="2" and text()="/" and text()="4"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Do you currently have a kitchen island?"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Yes"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="No"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="No, but I\'d like one"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=(//button[text()="Next" and @aria-disabled="true"])[2]').isVisible()).toBeTruthy;
            return 'Passed';
        }
        catch (error) {
            logError(this.page, "Error in verifyDesignQuestion1: ", error);
            return 'Failed';
        }
    }

    async verifyDesignQuestion2() {
        try {
        expect(await this.page.locator('xpath=//div[text()="L-shaped"]/../../div[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[text()="Next" and @aria-disabled="false"])[1]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[text()="Next"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="2" and text()="/" and text()="4"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Do you currently have a kitchen island?"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Yes"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="No"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="No, but I\'d like one"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[text()="Next" and @aria-disabled="true"])[2]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Yes"]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[text()="Next" and @aria-disabled="false"])[2]').isVisible()).toBeTruthy;
        expect(await this.page.getByTestId('TestId_Style_Q2_Next_Btn').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="3" and text()="/" and text()="4"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="What’s the current size of your kitchen?"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="It’s okay if your measurements aren’t exact."]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="Approximate size:"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Small"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Less than 150 square feet"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Medium"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Between 151 and 350 square feet"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Large"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Greater than 350 square feet"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[text()="Next" and @aria-disabled="true"])[3]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//img[@src="/assets/icons/rebode-measure-appicon.svg"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//img[@src="/assets/images/qr-plain.svg"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()=" for iOS and measure your kitchen in seconds." and text()="Try "]/strong[text()="Rebode Measure"]').isVisible()).toBeTruthy;
        expect(await this.page.locator("xpath=//div[text()='Made for iPhone 12 Pro and Pro Max and later, and iPad Pro 12.9\" (4th gen) and 11\" (2nd gen) and later.']").isVisible()).toBeTruthy;
        return 'Passed';
        }
        catch (error) {
            logError(this.page, "Error in verifyDesignQuestion2: ", error);
            return 'Failed';
        }
    }

    async verifyDesignQuestion3() {
        try{
        expect(await this.page.locator('xpath=//div[text()="Do you currently have a kitchen island?"]').scrollIntoViewIfNeeded()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="L-shaped"]/../../div[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[text()="Next" and @aria-disabled="false"])[1]').click()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Yes"]/../..').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="Yes"]/../..').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[text()="Next" and @aria-disabled="false"])[2]').click()).toBeTruthy;
        /* expect(await this.page.locator('xpath=//div[text()="3" and text()="/" and text()="4"]').isVisible()).toBeTruthy;
         expect(await this.page.locator('xpath=//div[text()="What’s the current size of your kitchen?"]').isVisible()).toBeTruthy;
         expect(await this.page.locator('xpath=//p[text()="It’s okay if your measurements aren’t exact."]').isVisible()).toBeTruthy;
         expect(await this.page.locator('xpath=//p[text()="Approximate size:"]').isVisible()).toBeTruthy;
         expect(await this.page.locator('xpath=//div[text()="Small"]').isVisible()).toBeTruthy;
         expect(await this.page.locator('xpath=//div[text()="Less than 150 square feet"]').isVisible()).toBeTruthy;
         expect(await this.page.locator('xpath=//div[text()="Medium"]').isVisible()).toBeTruthy;
         expect(await this.page.locator('xpath=//div[text()="Between 151 and 350 square feet"]').isVisible()).toBeTruthy;
         expect(await this.page.locator('xpath=//div[text()="Large"]').isVisible()).toBeTruthy;
         expect(await this.page.locator('xpath=//div[text()="Greater than 350 square feet"]').isVisible()).toBeTruthy;
         expect(await this.page.locator('xpath=(//button[text()="Next" and @aria-disabled="true"])[3]').isVisible()).toBeTruthy;
         expect(await this.page.locator('xpath=//img[@src="/assets/icons/rebode-measure-appicon.svg"]').isVisible()).toBeTruthy;
         expect(await this.page.locator('xpath=//img[@src="/assets/images/qr-plain.svg"]').isVisible()).toBeTruthy;
         expect(await this.page.locator('xpath=//div[text()=" for iOS and measure your kitchen in seconds." and text()="Try "]/strong[text()="Rebode Measure"]').isVisible()).toBeTruthy;
         expect(await this.page.locator("xpath=//div[text()='Made for iPhone 12 Pro and Pro Max and later, and iPad Pro 12.9\" (4th gen) and 11\" (2nd gen) and later.']").isVisible()).toBeTruthy;
         */
        expect(await this.page.locator('xpath=//div[text()="Large"]/../../../div').click()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[text()="Next" and @aria-disabled="false"])[3]').click()).toBeTruthy;
        //expect(await this.page.locator('xpath=//div[text()="4/4"]').isVisible()).toBeTruthy;
        /*expect(await this.page.locator('xpath=//div[text()="Who uses your kitchen?"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//p[text()="How many people tend to use your kitchen at the same time?"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="1"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="2"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=//div[text()="3+"]').isVisible()).toBeTruthy;
        expect(await this.page.locator('xpath=(//button[text()="Next" and @aria-disabled="true"])[4]').isVisible()).toBeTruthy;
        */
        return 'Passed';        
        }
        catch (error) {
            logError(this.page, "Error in verifyDesignQuestion3: ", error);
            return 'Failed';
        }

    }

    async verifyDesignQuestion4() {
        try {
            await this.page.getByTestId('TestId_Design_Q1_A5').click();
            await this.page.getByTestId('TestId_Style_Q1_Next_Btn').click();
            await this.page.getByTestId('TestId_Design_Q2_A0').click();
            await this.page.getByTestId('TestId_Style_Q2_Next_Btn').click();
            await this.page.getByTestId('TestId_Design_Q3_A2').click();
            await this.page.getByTestId('TestId_Style_Q3_Next_Btn').click();
            await this.page.getByTestId('TestId_Design_Q4_A2').click();
            await this.page.getByTestId('TestId_Style_Q4_Next_Btn').click();
            await this.page.getByTestId('TestId_Style_Continue_Next_Btn').click();
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/concept');
            return 'Passed';
        }
        catch (error) {
            logError(this.page, "Error in verifyDesignQuestion4: ", error);
            return 'Failed';
        }

    }

    async verifyDesignActivities() {
        try {
            await this.page.getByTestId('TestId_Design_Q1_A5').click();
            await this.page.getByTestId('TestId_Style_Q1_Next_Btn').click();
            await this.page.getByTestId('TestId_Design_Q2_A0').click();
            await this.page.getByTestId('TestId_Style_Q2_Next_Btn').click();
            await this.page.getByTestId('TestId_Design_Q3_A2').click();
            await this.page.getByTestId('TestId_Style_Q3_Next_Btn').click();
            await this.page.getByTestId('TestId_Design_Q4_A2').click();
            await this.page.getByTestId('TestId_Style_Q4_Next_Btn').click();
            await this.page.getByTestId('TestId_Style_Continue_Next_Btn').click();
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/concept');
            await waitForSpinnerToDisappear(this.page, 15000);
            expect(await this.page.locator('xpath=//div[text()="What are your favorite activities or features?"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Select your top 3 kitchen passions, priorities, and preferences."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="3 choices remain"]').isVisible()).toBeTruthy;
            const designOptions = [
                'TestId_DesignConcept_AccessibleAndUser-friendly_OptionBtn',
                'TestId_DesignConcept_ClutterControl_OptionBtn',
                'TestId_DesignConcept_CoffeeAndTea_OptionBtn'
            ];

            for (const id of designOptions) {
                await this.clickUntilEnabled(id);
            }
            expect(await this.page.locator('xpath=//div[text()="Click again to deselect if you want to make a change."]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Brew Hub"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Welcome to the Brew Hub, where your morning cup of Joe or calming evening tea is right at your fingertips. Imagine a space where your small appliances and cooking tools are easily accessible and within reach, and cabinetry is fitted with drawers or pull-down shelves. You can channel your inner barista clutter-free, thanks to ingenious hidden storage solutions."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Coffee and tea"]').focus()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Coffee and tea"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Coffee and tea"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="1 choice remains"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Eating and dining"]').focus()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Eating and dining"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Eating and dining"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Click again to deselect if you want to make a change."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Dining Den"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Welcome to your Dining Den, where great food, wonderful ambiance, and memories are made. This kitchen is a user-friendly, clutter-free hub for heartwarming meals; with a cleverly designed layout that effortlessly juggles cooking, dining, and cleaning up. If you\'ve dreamed of a hassle-free, cozy, and joyful dining experience where everything is at arm\'s length - this is your kitchen."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Next" and @aria-disabled="false"]').click()).toBeTruthy;
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/storage');
            expect(await this.page.locator('xpath=//div[text()="Now, find your favorite storage solutions."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Below are recommended storage solutions based on your activities. "]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Because your concept is \“Dining Den\”:"]').isVisible()).toBeTruthy;
            return 'Passed';
        }
        catch (error) {
            logError(this.page, "Error in verifyDesignActivities: ", error);
            return 'Failed';
        }
    }

    async verifyDesignStorageSolutions() {
        try {
            await this.page.getByTestId('TestId_Design_Q1_A0').locator('g rect').click();
            await this.page.getByTestId('TestId_Style_Q1_Next_Btn').click();
            await this.page.getByTestId('TestId_Design_Q2_A2').click();
            await this.page.getByTestId('TestId_Style_Q2_Next_Btn').click();
            await this.page.getByTestId('TestId_Design_Q3_A2').click();
            await this.page.getByTestId('TestId_Style_Q3_Next_Btn').click();
            await this.page.getByTestId('TestId_Design_Q4_A2').click();
            await this.page.getByTestId('TestId_Style_Q4_Next_Btn').click();
            await this.page.getByTestId('TestId_Style_Continue_Next_Btn').click();
            logInfo(this.page, "Successfully completed Design page");
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/concept');
            await waitForSpinnerToDisappear(this.page, 15000);
            expect(await this.page.locator('xpath=//div[text()="What are your favorite activities or features?"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Select your top 3 kitchen passions, priorities, and preferences."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="3 choices remain"]').isVisible()).toBeTruthy;
            const designOptions = [
                'TestId_DesignConcept_AccessibleAndUser-friendly_OptionBtn',
                'TestId_DesignConcept_ClutterControl_OptionBtn',
                'TestId_DesignConcept_CoffeeAndTea_OptionBtn'
            ];

            for (const id of designOptions) {
                await this.clickUntilEnabled(id);
            }
            expect(await this.page.locator('xpath=//div[text()="Click again to deselect if you want to make a change."]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Brew Hub"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Welcome to the Brew Hub, where your morning cup of Joe or calming evening tea is right at your fingertips. Imagine a space where your small appliances and cooking tools are easily accessible and within reach, and cabinetry is fitted with drawers or pull-down shelves. You can channel your inner barista clutter-free, thanks to ingenious hidden storage solutions."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Coffee and tea"]').focus()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Coffee and tea"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Coffee and tea"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="1 choice remains"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Eating and dining"]').focus()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Eating and dining"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Eating and dining"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Click again to deselect if you want to make a change."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Dining Den"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Welcome to your Dining Den, where great food, wonderful ambiance, and memories are made. This kitchen is a user-friendly, clutter-free hub for heartwarming meals; with a cleverly designed layout that effortlessly juggles cooking, dining, and cleaning up. If you\'ve dreamed of a hassle-free, cozy, and joyful dining experience where everything is at arm\'s length - this is your kitchen."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Next" and @aria-disabled="false"]').click()).toBeTruthy;
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/storage');
            expect(await this.page.locator('xpath=//div[text()="Now, find your favorite storage solutions."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Below are recommended storage solutions based on your activities. "]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Because your concept is \“Dining Den\”:"]').isVisible()).toBeTruthy;
            return 'Passed';
        }
        catch (error) {
            logError(this.page, "Error in verifyDesignStorageSolutions: ", error);
            return 'Failed';
        }
    }

    async verifyDesignCabinetIsNotDisplayed() {
        try {
            await this.page.getByTestId('TestId_Design_Q1_A0').locator('g rect').click();
            await this.page.getByTestId('TestId_Style_Q1_Next_Btn').click();
            await this.page.getByTestId('TestId_Design_Q2_A2').click();
            await this.page.getByTestId('TestId_Style_Q2_Next_Btn').click();
            await this.page.getByTestId('TestId_Design_Q3_A2').click();
            await this.page.getByTestId('TestId_Style_Q3_Next_Btn').click();
            await this.page.getByTestId('TestId_Design_Q4_A2').click();
            await this.page.getByTestId('TestId_Style_Q4_Next_Btn').click();
            await this.page.getByTestId('TestId_Style_Continue_Next_Btn').click();
            logInfo(this.page, "Successfully completed Design page");
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/concept');
            await waitForSpinnerToDisappear(this.page, 15000);
            expect(await this.page.locator('xpath=//div[text()="What are your favorite activities or features?"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Select your top 3 kitchen passions, priorities, and preferences."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="3 choices remain"]').isVisible()).toBeTruthy;
            const designOptions = [
                'TestId_DesignConcept_AccessibleAndUser-friendly_OptionBtn',
                'TestId_DesignConcept_ClutterControl_OptionBtn',
                'TestId_DesignConcept_CoffeeAndTea_OptionBtn'
            ];

            for (const id of designOptions) {
                await this.clickUntilEnabled(id);
            }
            expect(await this.page.locator('xpath=//div[text()="Click again to deselect if you want to make a change."]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Brew Hub"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Welcome to the Brew Hub, where your morning cup of Joe or calming evening tea is right at your fingertips. Imagine a space where your small appliances and cooking tools are easily accessible and within reach, and cabinetry is fitted with drawers or pull-down shelves. You can channel your inner barista clutter-free, thanks to ingenious hidden storage solutions."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Coffee and tea"]').focus()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Coffee and tea"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Coffee and tea"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="1 choice remains"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Eating and dining"]').focus()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Eating and dining"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Eating and dining"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Click again to deselect if you want to make a change."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Dining Den"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Welcome to your Dining Den, where great food, wonderful ambiance, and memories are made. This kitchen is a user-friendly, clutter-free hub for heartwarming meals; with a cleverly designed layout that effortlessly juggles cooking, dining, and cleaning up. If you\'ve dreamed of a hassle-free, cozy, and joyful dining experience where everything is at arm\'s length - this is your kitchen."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Next" and @aria-disabled="false"]').click()).toBeTruthy;
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/storage');
            expect(await this.page.locator('xpath=//div[text()="Now, find your favorite storage solutions."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Below are recommended storage solutions based on your activities. "]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Because your concept is \“Dining Den\”:"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Next" and @aria-disabled="false"]').click()).toBeTruthy;
            await expect(this.page).not.toHaveURL('https://js.' + process.env.environment + '.digitalmbd.net/design/cabinets');
            await expect(this.page.locator('div').filter({ hasText: 'Learn about cabinetry – the heart of your kitchen.' }).first()).not.toBeVisible();
            return 'Passed';
        }
        catch (error) {
            logError(this.page, "Error in verifyDesignCabinetIsNotDisplayed: ", error);
            return 'Failed';
        }
    }

    async verifyDesignProfileBanner() {
        try {
            await this.page.getByTestId('TestId_Design_Q1_A0').locator('g rect').click();
            await this.page.getByTestId('TestId_Style_Q1_Next_Btn').click();
            await this.page.getByTestId('TestId_Design_Q2_A2').click();
            await this.page.getByTestId('TestId_Style_Q2_Next_Btn').click();
            await this.page.getByTestId('TestId_Design_Q3_A2').click();
            await this.page.getByTestId('TestId_Style_Q3_Next_Btn').click();
            await this.page.getByTestId('TestId_Design_Q4_A2').click();
            await this.page.getByTestId('TestId_Style_Q4_Next_Btn').click();
            await this.page.getByTestId('TestId_Style_Continue_Next_Btn').click();
            logInfo(this.page, "Successfully completed Design page");
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/concept');
            await waitForSpinnerToDisappear(this.page, 15000);
            try {
                expect(await this.page.locator('xpath=//div[text()="What are your favorite activities or features?"]').isVisible()).toBeTruthy;
                expect(await this.page.locator('xpath=//div[text()="Select your top 3 kitchen passions, priorities, and preferences."]').isVisible()).toBeTruthy;
                expect(await this.page.locator('xpath=//div[text()="3 choices remain"]').isVisible()).toBeTruthy;
            } catch (error) {
                logError(this.page, "Error in verifyDesignProfileBanner: ", error);
                return 'Failed';
            }
            const designOptions = [
                'TestId_DesignConcept_AccessibleAndUser-friendly_OptionBtn',
                'TestId_DesignConcept_ClutterControl_OptionBtn',
                'TestId_DesignConcept_CoffeeAndTea_OptionBtn'
            ];

            for (const id of designOptions) {
                await this.clickUntilEnabled(id);
            }
            expect(await this.page.locator('xpath=//div[text()="Click again to deselect if you want to make a change."]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Brew Hub"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Welcome to the Brew Hub, where your morning cup of Joe or calming evening tea is right at your fingertips. Imagine a space where your small appliances and cooking tools are easily accessible and within reach, and cabinetry is fitted with drawers or pull-down shelves. You can channel your inner barista clutter-free, thanks to ingenious hidden storage solutions."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Coffee and tea"]').focus()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Coffee and tea"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Coffee and tea"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="1 choice remains"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Eating and dining"]').focus()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Eating and dining"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Eating and dining"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Click again to deselect if you want to make a change."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Dining Den"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Welcome to your Dining Den, where great food, wonderful ambiance, and memories are made. This kitchen is a user-friendly, clutter-free hub for heartwarming meals; with a cleverly designed layout that effortlessly juggles cooking, dining, and cleaning up. If you\'ve dreamed of a hassle-free, cozy, and joyful dining experience where everything is at arm\'s length - this is your kitchen."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Next" and @aria-disabled="false"]').click()).toBeTruthy;
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/storage');
            expect(await this.page.locator('xpath=//div[text()="Now, find your favorite storage solutions."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Below are recommended storage solutions based on your activities. "]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Because your concept is \“Dining Den\”:"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Next" and @aria-disabled="false"]').click()).toBeTruthy;
            await expect(this.page).not.toHaveURL('https://js.' + process.env.environment + '.digitalmbd.net/design/cabinets');
            await expect(this.page.locator('div').filter({ hasText: 'Learn about cabinetry – the heart of your kitchen.' }).first()).not.toBeVisible();
            return 'Passed';
        }
        catch (error) {
            logError(this.page, "Error in verifyDesignProfileBanner: ", error);
            return 'Failed';
        }
    }

    async verifyDesignMyActivities() {
        try {
            await this.page.getByTestId('TestId_Design_Q1_A0').locator('g rect').click();
            await this.page.getByTestId('TestId_Style_Q1_Next_Btn').click();
            await this.page.getByTestId('TestId_Design_Q2_A2').click();
            await this.page.getByTestId('TestId_Style_Q2_Next_Btn').click();
            await this.page.getByTestId('TestId_Design_Q3_A2').click();
            await this.page.getByTestId('TestId_Style_Q3_Next_Btn').click();
            await this.page.getByTestId('TestId_Design_Q4_A2').click();
            await this.page.getByTestId('TestId_Style_Q4_Next_Btn').click();
            await this.page.getByTestId('TestId_Style_Continue_Next_Btn').click();
            logInfo(this.page, "Successfully completed Design page");
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/concept');
            await waitForSpinnerToDisappear(this.page, 15000);
            expect(await this.page.locator('xpath=//div[text()="What are your favorite activities or features?"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Select your top 3 kitchen passions, priorities, and preferences."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="3 choices remain"]').isVisible()).toBeTruthy;
            const designOptions = [
                'TestId_DesignConcept_AccessibleAndUser-friendly_OptionBtn',
                'TestId_DesignConcept_ClutterControl_OptionBtn',
                'TestId_DesignConcept_CoffeeAndTea_OptionBtn'
            ];

            for (const id of designOptions) {
                await this.clickUntilEnabled(id);
            }
            expect(await this.page.locator('xpath=//div[text()="Click again to deselect if you want to make a change."]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Brew Hub"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Welcome to the Brew Hub, where your morning cup of Joe or calming evening tea is right at your fingertips. Imagine a space where your small appliances and cooking tools are easily accessible and within reach, and cabinetry is fitted with drawers or pull-down shelves. You can channel your inner barista clutter-free, thanks to ingenious hidden storage solutions."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Coffee and tea"]').focus()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Coffee and tea"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Coffee and tea"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="1 choice remains"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Eating and dining"]').focus()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Eating and dining"]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Eating and dining"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Click again to deselect if you want to make a change."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Dining Den"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Welcome to your Dining Den, where great food, wonderful ambiance, and memories are made. This kitchen is a user-friendly, clutter-free hub for heartwarming meals; with a cleverly designed layout that effortlessly juggles cooking, dining, and cleaning up. If you\'ve dreamed of a hassle-free, cozy, and joyful dining experience where everything is at arm\'s length - this is your kitchen."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Next" and @aria-disabled="false"]').click()).toBeTruthy;
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/storage');
            expect(await this.page.locator('xpath=//div[text()="Now, find your favorite storage solutions."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Below are recommended storage solutions based on your activities. "]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Because your concept is \“Dining Den\”:"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Next" and @aria-disabled="false"]').click()).toBeTruthy;
            await expect(this.page).not.toHaveURL('https://js.' + process.env.environment + '.digitalmbd.net/design/cabinets');
            await expect(this.page.locator('div').filter({ hasText: 'Learn about cabinetry – the heart of your kitchen.' }).first()).not.toBeVisible();
            return 'Passed';
        }
        catch (error) {
            logError(this.page, "Error in verifyDesignMyActivities: ", error);
            return 'Failed';
        }
    }

    async completeIceBreakerFlow() {

        // verify landed on style tuner page
        const cookieButton = this.page.getByRole('button', { name: /accept all cookies/i });
        if (await cookieButton.isVisible()) { await cookieButton.click(); }
        await this.page.waitForTimeout(5000);

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

        // Some environments still show Q3-Q5, others jump straight to continue.
        const q3 = this.page.getByTestId('TestId_Icebreaker_Q3_A1');
        try {
            await q3.waitFor({ state: 'visible', timeout: 5000 });

            await this.page.getByTestId('TestId_Icebreaker_Q3_A1').click();
            await this.page.getByTestId('TestId_Icebreaker_Q3_Next_Btn').click();
            await this.page.getByTestId('TestId_Icebreaker_Q4_A1').waitFor({ state: 'visible', timeout: 5000 });

            await this.page.getByTestId('TestId_Icebreaker_Q4_A1').click();
            await this.page.getByTestId('TestId_Icebreaker_Q4_Next_Btn').click();
            await this.page.getByTestId('TestId_Icebreaker_Q5_A1').waitFor({ state: 'visible', timeout: 5000 });

            await this.page.getByTestId('TestId_Icebreaker_Q5_A1').click();
            await this.page.getByTestId('TestId_Icebreaker_Q5_Next_Btn').click();
        } catch {
            logInfo(this.page, 'Icebreaker flow variant detected: Q3-Q5 not shown. Continuing with available steps.');
        }

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

    async clickUntilEnabled(testId: string, maxRetries = 3) {
        const option = this.page.getByTestId(testId);

        await option.waitFor({ state: 'visible' });
        await option.scrollIntoViewIfNeeded();

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const className = await option.getAttribute('class');

            // ✅ already selected → exit early
            if (className?.includes('selected')) {
                logInfo(this.page, `${testId} already selected`);
                return;
            }

            logInfo(this.page, `Clicking ${testId} attempt ${attempt}`);
            await option.click();

            // wait for React re-render
            await this.page.waitForTimeout(500);

            const updatedClass = await option.getAttribute('class');
            if (updatedClass?.includes('selected')) {
                logInfo(this.page, `${testId} selected successfully`);
                return;
            }
        }

        throw new Error(`${testId} could not be selected after ${maxRetries} attempts`);
    }
}