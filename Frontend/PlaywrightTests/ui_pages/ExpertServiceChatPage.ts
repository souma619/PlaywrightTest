import { expect, Page } from "@playwright/test";
import AuthHelper from '../helpers/api-helpers';
import { waitForSpinnerToDisappear, hideChatBubble } from '../helpers/waitHelpers';
import assert from "assert";

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
export default class ExpertServiceChatPage {

    constructor(public page: Page) {
        page.on('console', msg => {
            const now = new Date();
            const timestamp = now.toUTCString();
            console.log(`${timestamp} - ${msg.type().toUpperCase()} - ${msg.text()}`);

        });
    }
    async createUser(request: any, projectID: string, postalCode: string) {
        const authHelper = new AuthHelper(request);
        // Get access token
        const accessToken = await authHelper.getAccessToken();
        expect(accessToken).toBeTruthy();
        const oldId = await authHelper.getUser();
        if (oldId == false) { //Create new user as old id doesn't exist
            const id = await authHelper.createNewUser(projectID, postalCode);
            expect(id).toBeTruthy();
            logInfo(this.page, "New User ID is Created:" + id);
        }
        else {
            //Display existing user details
           logInfo(this.page, "User ID is already present:" + oldId);
        }


    }

    async deleteUser(request: any) {
        const authHelper = new AuthHelper(request);
        //delete user id
        const oldId2 = await authHelper.getUser();
        if (oldId2 == false) {
            logInfo(this.page, "User ID is associated with email is already Deleted");
        }
        else {
            expect(oldId2).toBeTruthy();
            await authHelper.deleteExistingUser(oldId2);
        }


    }

    async launchHomePage() {
        logInfo(this.page, "Launched JumpStarter Page");
        this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.page.goto('https://js.' + process.env.environment + '.digitalmbd.net/secret/straw-serve-pound.html');
        //navigate to icebreaker page
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
        await waitForSpinnerToDisappear(this.page, 10000);
        logInfo(this.page, "Successfully navigated to Icebreaker page");
    }

    async getProjectID(): Promise<string> {
        await this.page.goto('https://js.' + process.env.environment + '.digitalmbd.net/secret/straw-serve-pound.html');
        const [response] = await Promise.all([
            this.page.waitForResponse(response =>
                response.url().includes('/projectprofile/v1/projects') && (response.status() === 200 || response.status() === 201)),

        ]);
        const responseData = await response.json();
        //navigate to icebreaker page
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
        await waitForSpinnerToDisappear(this.page, 10000);
        logInfo(this.page, "Successfully navigated to Icebreaker page");

        //  const responseData = await response.json();
        return responseData.id;
    }

    async verifySignIn() {
        try {
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
            await this.page.getByRole('button', { name: 'Sign in' }).click();
            await this.page.waitForURL('https://login.digitalmbd.net/masterbrandadb2c.onmicrosoft.com/**');
            let email = process.env.createEmail as string;
            let password = process.env.password as string;
            await this.page.getByRole('textbox', { name: 'Email Address' }).click()
            await this.page.getByRole('textbox', { name: 'Email Address' }).fill(email);
            await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
            await this.page.getByRole('textbox', { name: 'Password' }).click();
            logInfo(this.page, "Successfully entered Username and Password");
            this.page.keyboard.press('Enter');
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
            expect(await this.page.locator('xpath=(//*[@id="root"]/div/div[2]/div/div/div//*[local-name()="svg"]/*[local-name()="circle"])[1]').isVisible()).toBeFalsy;
            expect(await this.page.locator('xpath=(//*[@id="root"]/div/div[2]/div/div/div//*[local-name()="svg"]/*[local-name()="circle"])[2]').isVisible()).toBeFalsy;
            expect(await this.page.locator('xpath=//div[@role="img" and contains(@class,"chakra-avatar")]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@role="img" and contains(@class,"chakra-avatar")]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Account overview"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Account Overview is displayed");
            expect(await this.page.locator('xpath=//*[@id="root"]/div/div[1]/header/div[3]/div[1]/div/div[1]/div/div').click()).toBeTruthy;
            return "Passed"
        }
        catch {
            logError(this.page, "Failed to verify Sign in details");
            return 'Failed';
        }
    }

    async verifyChatButton() {
        try {
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert window is displayed");
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]/../button').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert window Cross button is displayed");
            expect(await this.page.locator('xpath=//button[@id="ecLauncherFloatingBubble"]/img[1]').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert Open icon is displayed");
            return "Passed"
        }
        catch {
            logError(this.page, "Failed to Chat button details");
            return 'Failed';
        }
    }

    async verifyChatOpen() {
        try {
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert window is displayed");
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]/../button').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert window Cross button is displayed");
            expect(await this.page.locator('xpath=//button[@id="ecLauncherFloatingBubble"]/img[1]').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert Open icon is displayed");
            expect(await this.page.locator('xpath=//button[@id="ecLauncherFloatingBubble"]/img[1]').focus()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[@id="ecLauncherFloatingBubble"]/img[1]').hover()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[@id="ecLauncherFloatingBubble"]/img[1]').click()).toBeTruthy;
            logInfo(this.page, "Successfully Clicked on Expert Chat Icon");
            expect(await this.page.locator('xpath=//*[@id="sn_csm_ec_engmnt_center_module.logo"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Rebode Icon in chat is displayed");
            expect(await this.page.locator('xpath=//span[@id="tspanid"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified message Rebode Expert message is displayed");
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByRole('link', { name: 'Doc out' }).focus();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByRole('link', { name: 'Doc out' }).click();
            logInfo(this.page, "Successfully expanded the Expert Chat window");
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByRole('link', { name: 'Doc in' }).focus();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByRole('link', { name: 'Doc in' }).click();
            logInfo(this.page, "Successfully contracted the Expert Chat window");
            expect(await this.page.locator('xpath=//*[@id="ecLauncherFloatingBubble"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//*[@id="ecLauncherFloatingBubble"]').focus()).toBeTruthy;
            expect(await this.page.locator('xpath=//*[@id="ecLauncherFloatingBubble"]').click()).toBeTruthy;
            logInfo(this.page, "Successfully closed the Expert chat window");
            expect(await this.page.locator('xpath=//*[@id="sn_csm_ec_engmnt_center_module.logo"]').isVisible()).toBeFalsy;
            expect(await this.page.locator('xpath=//span[@id="tspanid"]').isVisible()).toBeFalsy;
            logInfo(this.page, "Successfully verified Expert chat window is closed");
            return "Passed"
        }
        catch {
            logError(this.page, "Failed to Chat button details");
            return 'Failed';
        }
    }

    async verifyCloseXButton() {
        try {
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert window is displayed");
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]/../button').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert window Cross button is displayed");
            expect(await this.page.locator('xpath=//button[@id="ecLauncherFloatingBubble"]/img[1]').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert Open icon is displayed");
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]/../button').focus()).toBeTruthy;
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]/../button').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]').isVisible()).toBeFalsy;
            logInfo(this.page, "Successfully verified Expert chat window is closed");
            expect(await this.page.locator('xpath=//button[@id="ecLauncherFloatingBubble"]/img[1]').isVisible()).toBeTruthy;
            return "Passed"
        }
        catch {
            logError(this.page, "Failed to close Chat button");
            return 'Failed';
        }
    }

    async verifyChatHeaderIntroduction() {
        try {
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert window is displayed");
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]/../button').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert window Cross button is displayed");
            expect(await this.page.locator('xpath=//button[@id="ecLauncherFloatingBubble"]/img[1]').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert Open icon is displayed");
            await this.page.getByRole('button', { name: 'Launch the messenger' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByRole('link', { name: 'Go to homepage' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByText('Hi there!').isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByText('Let us know how we can help').isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByText('Chat with a Rebode Expert').isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByRole('button', { name: 'Start a chat' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('heading', { name: 'Rebode Expert Chat' }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().locator('.now-chat-message-bubble').first().isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Please leave your question here and we will respond within one business day', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('textbox', { name: 'Please type your response' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('textbox', { name: 'Please type your response' }).fill('Test Message for Automation');
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('button', { name: 'Send Message' }).getByRole('button').click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('textbox', { name: 'Please type your response' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Test Message for Automation', { exact: true }).isVisible();
            await this.page.getByRole('button', { name: 'Close the messenger' }).click();
            await this.page.getByRole('button', { name: 'Launch the messenger' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('heading', { name: 'Rebode Expert Chat' }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Hello! Our Experts are currently unavailable but we can\'t wait to chat with you', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Please leave your question here and we will respond within one business day', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Test Message for Automation', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Great. And what is your email address?', { exact: true }).isVisible();
            return "Passed"
        }
        catch {
            logError(this.page, "Failed to close Chat button");
            return 'Failed';
        }
    }

    async verifyChatClose() {
        try {
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert window is displayed");
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]/../button').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert window Cross button is displayed");
            expect(await this.page.locator('xpath=//button[@id="ecLauncherFloatingBubble"]/img[1]').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert Open icon is displayed");
            await this.page.getByRole('button', { name: 'Launch the messenger' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByRole('link', { name: 'Go to homepage' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByText('Hi there!').isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByText('Let us know how we can help').isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByText('Chat with a Rebode Expert').isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByRole('button', { name: 'Start a chat' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('heading', { name: 'Rebode Expert Chat' }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().locator('.now-chat-message-bubble').first().isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Please leave your question here and we will respond within one business day', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('textbox', { name: 'Please type your response' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('textbox', { name: 'Please type your response' }).fill('Test Message for Automation');
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('button', { name: 'Send Message' }).getByRole('button').click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('textbox', { name: 'Please type your response' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Test Message for Automation', { exact: true }).isVisible();
            await this.page.getByRole('button', { name: 'Close the messenger' }).click();
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('heading', { name: 'Rebode Expert Chat' }).isVisible()).toBeFalsy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Hello! Our Experts are currently unavailable but we can\'t wait to chat with you', { exact: true }).isVisible()).toBeFalsy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Please leave your question here and we will respond within one business day', { exact: true }).isVisible()).toBeFalsy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Test Message for Automation', { exact: true }).isVisible()).toBeFalsy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Great. And what is your email address?', { exact: true }).isVisible()).toBeFalsy;
            await this.page.getByRole('button', { name: 'Launch the messenger' }).click();
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('heading', { name: 'Rebode Expert Chat' }).isVisible()).toBeTruthy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Hello! Our Experts are currently unavailable but we can\'t wait to chat with you', { exact: true }).isVisible()).toBeTruthy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Please leave your question here and we will respond within one business day', { exact: true }).isVisible()).toBeTruthy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Test Message for Automation', { exact: true }).isVisible()).toBeTruthy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Great. And what is your email address?', { exact: true }).isVisible()).toBeTruthy;
            await this.page.getByRole('button', { name: 'Close the messenger' }).click();
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]/../button').focus()).toBeTruthy;
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]/../button').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]').isVisible()).toBeFalsy;
            expect(await this.page.locator('xpath=//button[@id="ecLauncherFloatingBubble"]/img[1]').isVisible()).toBeTruthy;
            return "Passed"
        }
        catch {
            logError(this.page, "Failed to close Chat button");
            return 'Failed';
        }
    }

    async verifyChatConversationIsNotLost() {
        try {
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert window is displayed");
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]/../button').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert window Cross button is displayed");
            expect(await this.page.locator('xpath=//button[@id="ecLauncherFloatingBubble"]/img[1]').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert Open icon is displayed");
            await this.page.getByRole('button', { name: 'Launch the messenger' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByRole('link', { name: 'Go to homepage' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByText('Hi there!').isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByText('Let us know how we can help').isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByText('Chat with a Rebode Expert').isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByRole('button', { name: 'Start a chat' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('heading', { name: 'Rebode Expert Chat' }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().locator('.now-chat-message-bubble').first().isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Hello! Our Experts are currently unavailable but we can\'t wait to chat with you', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Please leave your question here and we will respond within one business day', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('textbox', { name: 'Please type your response' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('textbox', { name: 'Please type your response' }).fill('Test Message for Automation');
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('button', { name: 'Send Message' }).getByRole('button').click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('textbox', { name: 'Please type your response' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Test Message for Automation', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByRole('link', { name: 'Go to homepage' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByText('Hi there!').isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByText('Let us know how we can help').isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByText('Chat with a Rebode Expert').isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByRole('button', { name: 'Start a chat' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByRole('link', { name: 'Doc out' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByRole('link', { name: 'Close messenger' }).click();
            await this.page.getByRole('button', { name: 'Launch the messenger' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByRole('link', { name: 'Doc in' }).click();
            await this.page.getByRole('button', { name: 'Close the messenger' }).click();
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('heading', { name: 'Rebode Expert Chat' }).isVisible()).toBeFalsy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Hello! Our Experts are currently unavailable but we can\'t wait to chat with you', { exact: true }).isVisible()).toBeFalsy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Please leave your question here and we will respond within one business day', { exact: true }).isVisible()).toBeFalsy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Test Message for Automation', { exact: true }).isVisible()).toBeFalsy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Great. And what is your email address?', { exact: true }).isVisible()).toBeFalsy;
            await this.page.getByRole('button', { name: 'Launch the messenger' }).click();
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('heading', { name: 'Rebode Expert Chat' }).isVisible()).toBeTruthy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Hello! Our Experts are currently unavailable but we can\'t wait to chat with you', { exact: true }).isVisible()).toBeTruthy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Please leave your question here and we will respond within one business day', { exact: true }).isVisible()).toBeTruthy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Test Message for Automation', { exact: true }).isVisible()).toBeTruthy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Great. And what is your email address?', { exact: true }).isVisible()).toBeTruthy;
            await this.page.getByRole('button', { name: 'Close the messenger' }).click();
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]/../button').focus()).toBeTruthy;
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]/../button').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]').isVisible()).toBeFalsy;
            expect(await this.page.locator('xpath=//button[@id="ecLauncherFloatingBubble"]/img[1]').isVisible()).toBeTruthy;
            return "Passed"
        }
        catch {
            logError(this.page, "Failed to close Chat button");
            return 'Failed';
        }
    }
    async verifyEndChatConversation() {
        try {
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert window is displayed");
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]/../button').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert window Cross button is displayed");
            expect(await this.page.locator('xpath=//button[@id="ecLauncherFloatingBubble"]/img[1]').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert Open icon is displayed");
            await this.page.getByRole('button', { name: 'Launch the messenger' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByRole('link', { name: 'Go to homepage' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByText('Hi there!').isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByText('Let us know how we can help').isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByText('Chat with a Rebode Expert').isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByRole('button', { name: 'Start a chat' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('heading', { name: 'Rebode Expert Chat' }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().locator('.now-chat-message-bubble').first().isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Please leave your question here and we will respond within one business day', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('textbox', { name: 'Please type your response' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('textbox', { name: 'Please type your response' }).fill('Test Message for Automation');
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('button', { name: 'Send Message' }).getByRole('button').click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('textbox', { name: 'Please type your response' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Test Message for Automation', { exact: true }).isVisible();
            await this.page.getByRole('button', { name: 'Close the messenger' }).click();
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('heading', { name: 'Rebode Expert Chat' }).isVisible()).toBeFalsy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Hello! Our Experts are currently unavailable but we can\'t wait to chat with you', { exact: true }).isVisible()).toBeFalsy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Please leave your question here and we will respond within one business day', { exact: true }).isVisible()).toBeFalsy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Test Message for Automation', { exact: true }).isVisible()).toBeFalsy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Great. And what is your email address?', { exact: true }).isVisible()).toBeFalsy;
            await this.page.getByRole('button', { name: 'Launch the messenger' }).click();
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('heading', { name: 'Rebode Expert Chat' }).isVisible()).toBeTruthy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Hello! Our Experts are currently unavailable but we can\'t wait to chat with you', { exact: true }).isVisible()).toBeTruthy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Please leave your question here and we will respond within one business day', { exact: true }).isVisible()).toBeTruthy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Test Message for Automation', { exact: true }).isVisible()).toBeTruthy;
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Great. And what is your email address?', { exact: true }).isVisible()).toBeTruthy;
            await this.page.getByRole('button', { name: 'Close the messenger' }).click();
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]/../button').focus()).toBeTruthy;
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]/../button').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]').isVisible()).toBeFalsy;
            expect(await this.page.locator('xpath=//button[@id="ecLauncherFloatingBubble"]/img[1]').isVisible()).toBeTruthy;
            return "Passed"
        }
        catch {
            logError(this.page, "Failed to close Chat button");
            return 'Failed';
        }
    }

    async verifyEnableDisableAudioNotification() {
        try {
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert window is displayed");
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]/../button').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert window Cross button is displayed");
            expect(await this.page.locator('xpath=//button[@id="ecLauncherFloatingBubble"]/img[1]').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert Open icon is displayed");
            await this.page.getByRole('button', { name: 'Launch the messenger' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByRole('link', { name: 'Go to homepage' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByRole('button', { name: 'Start a chat' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('button', { name: 'Support options' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('switch', { name: 'Disable audio notifications' }).uncheck();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('switch', { name: 'Enable audio notifications' }).check();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('button', { name: 'Close contact options' }).click();
            return "Passed"
        }
        catch {
            logError(this.page, "Failed to close Chat button");
            return 'Failed';
        }
    }

    async verifyInvalidEmailInChat() {
        try {
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert window is displayed");
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]/../button').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert window Cross button is displayed");
            expect(await this.page.locator('xpath=//button[@id="ecLauncherFloatingBubble"]/img[1]').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert Open icon is displayed");
            await this.page.getByRole('button', { name: 'Launch the messenger' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByRole('link', { name: 'Go to homepage' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByRole('button', { name: 'Start a chat' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('textbox', { name: 'Please type your response' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('textbox', { name: 'Please type your response' }).fill('Automated test message');
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('button', { name: 'Send Message' }).getByRole('button').click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('textbox', { name: 'Please type your response' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('textbox', { name: 'Please type your response' }).fill('test@');
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('button', { name: 'Send Message' }).getByRole('button').click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('button', { name: 'Send Message' }).getByRole('button').click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('textbox', { name: 'Please type your response' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('alert', { name: 'Validation failed. This isn\'t' }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('textbox', { name: 'Please type your response' }).fill('testuser3@masterbrand.com');
            expect(await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('alert', { name: 'Validation failed. This isn\'t' }).isVisible()).toBeFalsy;
            return "Passed"
        }
        catch {
            logError(this.page, "Failed to close Chat button");
            return 'Failed';
        }
    }

    async verifyChatWindowOnEveryPage() {
        try {
            let coookieFlag = this.page.locator('xpath=//*[@id="onetrust-close-btn-container"]/button').count();
            if ((await coookieFlag).valueOf() === 1) {
                expect(await this.page.locator('xpath=//*[@id="onetrust-close-btn-container"]/button').click()).toBeTruthy;
            }
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert window is displayed");
            expect(await this.page.locator('xpath=//span[@class="bodyCopySemiBold text-content"]/../button').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert window Cross button is displayed");
            expect(await this.page.locator('xpath=//button[@id="ecLauncherFloatingBubble"]/img[1]').isVisible()).toBeTruthy;
            logInfo(this.page, "Chat with a live Expert Open icon is displayed");

            await this.page.getByRole('button', { name: 'Launch the messenger' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByRole('link', { name: 'Go to homepage' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByText('Hi there!').isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByText('Let us know how we can help').isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByText('Chat with a Rebode Expert').isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().getByRole('button', { name: 'Start a chat' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('heading', { name: 'Rebode Expert Chat' }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().locator('.now-chat-message-bubble').first().isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Please leave your question here and we will respond within one business day', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('textbox', { name: 'Please type your response' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('textbox', { name: 'Please type your response' }).fill('Test Message for Automation');
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('button', { name: 'Send Message' }).getByRole('button').click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByRole('textbox', { name: 'Please type your response' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Test Message for Automation', { exact: true }).isVisible();
            await this.page.getByRole('button', { name: 'Close the messenger' }).click();
            await this.page.getByTestId('TestId_Icebreaker_Q1_A0').click();
            await this.page.getByTestId('TestId_Icebreaker_Q1_A1').click();
            await this.page.getByTestId('TestId_Icebreaker_Q1_A2').click();
            await this.page.getByTestId('TestId_Icebreaker_Q1_Next_Btn').click();
            await this.page.getByTestId('TestId_Icebreaker_Q2_A0').click();
            await this.page.getByTestId('TestId_Icebreaker_Q2_Next_Btn').click();
            await this.page.getByTestId('TestId_Icebreaker_CONTINUE_Next_Btn').click();
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/style');
            await this.page.getByRole('button', { name: 'Launch the messenger' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Hello! Our Experts are currently unavailable but we can\'t wait to chat with you', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Please leave your question here and we will respond within one business day', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Test Message for Automation', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Great. And what is your email address?', { exact: true }).isVisible();
            await this.page.getByRole('button', { name: 'Close the messenger' }).click();
            await this.page.getByTestId('TestId_Style_StartTheQuiz_Btn').click();
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/style/quiz');
            await this.page.getByTestId('TestId_StyleQuiz_Q1_A4').click();
            await this.page.getByTestId('TestId_StyleQuiz_Q2_A4').click();
            await this.page.getByTestId('TestId_StyleQuiz_Q3_A4').click();
            await this.page.getByTestId('TestId_StyleQuiz_Q4_A4').click();
            await this.page.getByRole('button', { name: 'Launch the messenger' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Hello! Our Experts are currently unavailable but we can\'t wait to chat with you', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Please leave your question here and we will respond within one business day', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Test Message for Automation', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Great. And what is your email address?', { exact: true }).isVisible();
            await this.page.getByRole('button', { name: 'Close the messenger' }).click();
            await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click();
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/style/tuner');
            await this.page.getByRole('button', { name: 'Launch the messenger' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Hello! Our Experts are currently unavailable but we can\'t wait to chat with you', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Please leave your question here and we will respond within one business day', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Test Message for Automation', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Great. And what is your email address?', { exact: true }).isVisible();
            await this.page.getByRole('button', { name: 'Close the messenger' }).click();
            expect(await this.page.locator('xpath=(//div[text()="Minimalist"])[2]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//*[@id="dockedNavigation"]/button[2]').hover()).toBeTruthy; 
            expect(await this.page.locator('xpath=//*[@id="dockedNavigation"]/button[2]').focus()).toBeTruthy;       
            expect(await this.page.locator('xpath=//*[@id="dockedNavigation"]/button[2]').click({ force :true})).toBeTruthy;
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design');
            await this.page.getByTestId('TestId_Design_Q1_A5').locator('g rect').click();
            await this.page.getByTestId('TestId_Style_Q1_Next_Btn').click();
            await this.page.getByTestId('TestId_Design_Q2_A2').click();
            await this.page.getByTestId('TestId_Style_Q2_Next_Btn').click();
            await this.page.getByTestId('TestId_Design_Q3_A2').click();
            await this.page.getByTestId('TestId_Style_Q3_Next_Btn').click();
            await this.page.getByTestId('TestId_Design_Q4_A2').click();
            await this.page.getByTestId('TestId_Style_Q4_Next_Btn').click();
            await this.page.getByRole('button', { name: 'Launch the messenger' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Hello! Our Experts are currently unavailable but we can\'t wait to chat with you', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Please leave your question here and we will respond within one business day', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Test Message for Automation', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Great. And what is your email address?', { exact: true }).isVisible();
            await this.page.getByRole('button', { name: 'Close the messenger' }).click();
            await this.page.getByTestId('TestId_Style_Continue_Next_Btn').click();
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/concept');
            await this.page.getByRole('button', { name: 'Launch the messenger' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Hello! Our Experts are currently unavailable but we can\'t wait to chat with you', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Please leave your question here and we will respond within one business day', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Test Message for Automation', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Great. And what is your email address?', { exact: true }).isVisible();
            await this.page.getByRole('button', { name: 'Close the messenger' }).click();
            await this.page.getByText('Accessible and user-friendly').hover();
            await this.page.getByText('Accessible and user-friendly').focus();
            await this.page.getByText('Accessible and user-friendly').click({ force :true});
            await this.page.getByText('Clutter control').hover();
            await this.page.getByText('Clutter control').focus();
            await this.page.getByText('Clutter control').click({ force :true});
            await this.page.getByText('Coffee and tea').hover();
            await this.page.getByText('Coffee and tea').focus();
            await this.page.getByText('Coffee and tea').click({ force :true});
            expect(await this.page.locator('xpath=//div[text()="Brew Hub"]').isVisible()).toBeTruthy;

            await this.page.getByTestId('TestId_DockNavigation_Next_Btn').focus();
            await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click();
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/storage');
            await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click();
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/design/cabinets');
            await this.page.getByTestId('TestId_Design_Cabinets_Semi-customCabinets_Select_Btn').click();
            await this.page.getByTestId('TestId_DockNavigation_Next_Btn').click();
            await this.page.getByTestId('TestId_Budget_Min_Input').click();
            await this.page.getByTestId('TestId_Budget_Min_Input').fill('3000');
            await this.page.getByTestId('TestId_Budget_Min_Input').press('Tab');
            await this.page.getByTestId('TestId_Budget_Max_Input').fill('7,8000');
            await this.page.getByRole('button', { name: 'Launch the messenger' }).click();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Hello! Our Experts are currently unavailable but we can\'t wait to chat with you', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Please leave your question here and we will respond within one business day', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Test Message for Automation', { exact: true }).isVisible();
            await this.page.locator('iframe[title="Messenger"]').contentFrame().locator('iframe[title="Chat Support"]').contentFrame().getByText('Great. And what is your email address?', { exact: true }).isVisible();
            await this.page.getByRole('button', { name: 'Close the messenger' }).click();
            await this.page.getByTestId('TestId_Budget_BudgetRange_Next_Btn').click();
            await this.page.getByTestId('TestId_Budget_Completed_Next_Button').click();
            return "Passed"
        }
        catch {
            logError(this.page, "Failed to close Chat button");
            return 'Failed';
        }
    }
}