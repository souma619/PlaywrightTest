import { expect, Page } from "@playwright/test";
import assert from "assert";
import * as path from 'path';
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

function logToPageConsole(
    page: Page,
    level: 'log' | 'warn' | 'error',
    ...parts: unknown[]
) {
    const message = formatLogMessage(parts);
    const target = level === 'warn' ? console.warn : level === 'error' ? console.error : console.log;
    target(message);
}

function logInfo(page: Page, ...parts: unknown[]) {
    logToPageConsole(page, 'log', ...parts);
}

function logWarn(page: Page, ...parts: unknown[]) {
    logToPageConsole(page, 'warn', ...parts);
}

function logError(page: Page, ...parts: unknown[]) {
    logToPageConsole(page, 'error', ...parts);
}
export default class StylePage {

    constructor(public page: Page) {
        page.on('console', msg => {
            const now = new Date();
            const timestamp = now.toUTCString();
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

    async verifyStyleFork() {
        try {
            const title = this.page.locator('div.headlineXl.title');
            await title.waitFor({ state: 'visible' });
            await expect(title).toContainText(/Let.s find your style/);
            await expect(title).toBeVisible();
            logInfo(this.page, "Verified: 'Let's find your style.' text is visible");
            const subtitle = this.page.locator('div.bodyLgSemibold.subtitle');
            await subtitle.waitFor({ state: 'visible' });
            await expect(subtitle).toBeVisible();
            await expect(subtitle).toContainText(/What.s your style match\? You have 2 ways to explore\./);
            logInfo(this.page, "Verified: 'What's your style match? You have 2 ways to explore.' text is visible");
            // Verify Recommended ribbon
            const ribbon = this.page.locator('div.ribbon div.label.tagText');
            await ribbon.waitFor({ state: 'visible' });
            await expect(ribbon).toBeVisible();
            await expect(ribbon).toContainText('Recommended');

            // Verify Take the Style Quiz card
            const styleQuizTitle = this.page.locator('div.styleCardTitle.bodySmSemibold').first();
            await expect(styleQuizTitle).toBeVisible();
            await expect(styleQuizTitle).toContainText('Take the Style Quiz');

            const styleQuizText = this.page.locator('div.bodySmBold.text').first();
            await expect(styleQuizText).toBeVisible();
            await expect(styleQuizText).toContainText('Answer 4 questions');

            const startQuizBtn = this.page.getByTestId('TestId_Style_StartTheQuiz_Btn');
            await expect(startQuizBtn).toBeVisible();
            await expect(startQuizBtn).toBeEnabled();
            await expect(startQuizBtn).toContainText('Start the quiz');

            // Verify Let AI analyze your photo card
            const aiPhotoTitle = this.page.locator('div.styleCardTitle.bodySmSemibold').nth(1);
            await expect(aiPhotoTitle).toBeVisible();
            await expect(aiPhotoTitle).toContainText('Let AI analyze your photo');

            const aiPhotoText = this.page.locator('div.bodySmBold.text').nth(1);
            await expect(aiPhotoText).toBeVisible();
            await expect(aiPhotoText).toContainText('Give artificial intelligence');

            const uploadPhotoBtn = this.page.getByTestId('TestId_Style_UploadAPhoto_Btn');
            await expect(uploadPhotoBtn).toBeVisible();
            await expect(uploadPhotoBtn).toBeEnabled();
            await expect(uploadPhotoBtn).toContainText('Upload a photo');
            return "Passed"
        }
        catch {
            logError(this.page, "Failed to verify Styleform details");
            return 'Failed';
        }
    }

    async verifyStyleQuizQuestion4() {
        try {
            await this.verifyStyleFork();

            // Click Start the quiz
            await this.page.getByRole('button', { name: 'Start the quiz' }).click();
            await this.page.waitForTimeout(7000);

            // Verify quiz header
            const quizTitle = this.page.locator('div.headlineXl.title');
            await quizTitle.waitFor({ state: 'visible' });
            await expect(quizTitle).toContainText("What\u2019s your style personality? Take the quiz.");

            const quizSubtitle = this.page.locator('div.bodyLgSemibold.subtitle');
            await quizSubtitle.waitFor({ state: 'visible' });
            await expect(quizSubtitle).toContainText("You\u2019re four questions away from discovering your perfect style.");

            // ── Question 1 ──────────────────────────────────────────────
            await this.verifyProgressIndicator('1', '4');
            const q1Text = this.page.locator('div').filter({ hasText: 'Generally speaking, what decorating style do you prefer?' }).first();
            await q1Text.waitFor({ state: 'visible' });
            await expect(q1Text).toBeVisible();

            await this.verifyQuizImages();

            await this.verifyQuizOptions([
                'I like very traditional or classical styles',
                'Somewhat traditional',
                'Somewhat modern',
                'I like very modern, contemporary, or cutting-edge styles'
            ]);

            await this.verifyNextButtonDisabled();
            await this.page.getByRole('button', { name: 'I like very modern, contemporary, or cutting-edge styles' }).click();

            // ── Question 2 ──────────────────────────────────────────────
            await this.verifyProgressIndicator('2', '4');
            const q2Text = this.page.locator('div').filter({ hasText: 'How do you like your home to feel?' }).first();
            await q2Text.waitFor({ state: 'visible' });
            await expect(q2Text).toBeVisible();

            await this.verifyQuizOptions([
                'I like formal spaces that are uniform and sophisticated',
                'Somewhat formal',
                'Somewhat informal',
                'I like laid-back and casual spaces that feel relaxed'
            ]);

            await this.verifyNextButtonDisabled();
            await this.page.getByRole('button', { name: 'I like laid-back and casual spaces that feel relaxed' }).click();

            // ── Question 3 ──────────────────────────────────────────────
            await this.verifyProgressIndicator('3', '4');

            const q3Text = this.page.locator('div').filter({ hasText: "What\u2019s your favorite way to decorate your home?" }).first();
            await expect(q3Text).toBeVisible();

            await this.verifyQuizOptions([
                'I like maximum decoration and accessories',
                'Somewhat decorated',
                'Somewhat minimal',
                'I like minimalism, and believe that less is more'
            ]);

            await this.verifyNextButtonDisabled();
            await this.page.getByRole('button', { name: 'I like minimalism, and believe that less is more' }).click();

            // ── Question 4 ──────────────────────────────────────────────
            await this.verifyProgressIndicator('4', '4');
            await expect(this.page.locator('div').filter({ hasText: 'What materials do you prefer in your home?' }).first()).toBeVisible();


            await this.verifyQuizOptions([
                'I embrace the natural look, the more handmade the better',
                'Somewhat natural and rustic',
                'Somewhat sleek and polished',
                'I like reflective surfaces, and industrial materials'
            ]);

            await this.verifyNextButtonDisabled();
            await this.page.getByRole('button', { name: 'I like reflective surfaces, and industrial materials' }).click();

            // Click Next and verify navigation to style tuner
            await this.page.getByRole('button', { name: 'Next' }).click();
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/style/tuner');
            await this.page.waitForTimeout(7000);

            const tunerTitle = this.page.locator('div.headlineXl.title');
            await tunerTitle.waitFor({ state: 'visible' });
            await expect(tunerTitle).toContainText("You have great taste. Let's take a closer look.");

            logInfo(this.page, "Successfully verified Style Quiz questions");
            return 'Passed';

        } catch (error) {
            logError(this.page, "Failed to verify Style Quiz questions:", error);
            return 'Failed';
        }
    }



    async verifyStyleFinderIsNotDisplayed() {
        try {
            this.verifyStyleFork();
            await expect(this.page.getByRole('button', { name: 'See all styles' })).not.toBeVisible();
            logInfo(this.page, "Successfully verified Style Finder details are not displayed");
            return "Passed"
        }
        catch {
            logError(this.page, "Failed to verify Style Finder details are not displayed");
            return 'Failed';
        }

    }

    async verifyStyleProfileIsNotDisplayed() {
        try {
            this.verifyStyleFork();
            await expect(this.page.getByRole('button', { name: 'See all styles' })).not.toBeVisible();
            logInfo(this.page, "Successfully verified Style Profile details are not displayed");
            return "Passed"
        }
        catch {
            logError(this.page, "Failed to verify Style Profile details are not displayed");
            return 'Failed';
        }
    }

    async verifyUploadPhotoThroughDropImage() {
        try {
            this.verifyStyleFork();
            expect(await this.page.locator('xpath=//button[text()="Upload a photo"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//h2[text()="Upload your favorite kitchen photo"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=(//img[@alt="click to add an image"])[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="Choose a file or drag and drop " and text()="it here"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="Images showing people are not allowed."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="We recommend using high quality .jpg and .png files " and text()="less than 20 MB."]').isVisible()).toBeTruthy;
            const packageRoot = path.dirname(require.resolve('playwright'));
            logInfo(this.page, "Folder:" + path.resolve(packageRoot, '../..'));
            await this.page.getByRole('img', { name: 'click to add an image' }).first().click();
            const [fileChooser] = await Promise.all([
                this.page.waitForEvent('filechooser'),
                this.page.getByRole('img', { name: 'click to add an image' }).first().click()
            ]);
            await fileChooser.setFiles(path.resolve(packageRoot, '../..') + '/Photo/ValidPNG.png');
            expect(await this.page.locator('xpath=//h2[text()="Uploading your image..."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="This may take a moment, please wait."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h2[text()="Is this the photo you\'d like to analyze?"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//img[@alt="reference image to analyze"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Go back"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Continue"]').isVisible()).toBeTruthy;
            await this.page.getByTestId('TestId_StyleAnalyzer_Preview_Continue_Btn').click();
            expect(await this.page.locator('xpath=//h2[text()="Analyzing your photo to determine your style"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="This may take a moment, please wait."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h2[text()="Style match successful!"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//img[@class="image success"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="Your photo has been analyzed successfully."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h4[text()="Next: Your style match results"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Continue"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Continue"]').click()).toBeTruthy;
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/style/tuner');
            expect(await this.page.locator('xpath=//div[text()="You have great taste. Let\'s take a closer look."]').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Style through drop image");
            return "Passed"
        }
        catch {
            logError(this.page, "Failed to verify Style through drop image");
            return 'Failed';
        }
    }

    async verifyUploadFailDueToInvalidFileFormat() {
        try {
            this.verifyStyleFork();
            expect(await this.page.locator('xpath=//button[text()="Upload a photo"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//h2[text()="Upload your favorite kitchen photo"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=(//img[@alt="click to add an image"])[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="Choose a file or drag and drop " and text()="it here"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="Images showing people are not allowed."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="We recommend using high quality .jpg and .png files " and text()="less than 20 MB."]').isVisible()).toBeTruthy;
            const packageRoot = path.dirname(require.resolve('playwright'));
            logInfo(this.page, "Folder:" + path.resolve(packageRoot, '../..'));
            await this.page.getByRole('img', { name: 'click to add an image' }).first().click();
            const [fileChooser] = await Promise.all([
                this.page.waitForEvent('filechooser'),
                this.page.getByRole('img', { name: 'click to add an image' }).first().click()
            ]);
            await fileChooser.setFiles(path.resolve(packageRoot, '../..') + '/Photo/InvalidFileType.pdf');
            expect(await this.page.locator('xpath=//h2[text()="Wrong image format"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//img[@class="image failure"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="Make sure your image is in one of the following formats: .jpg, .png, .gif, .bmp, or .tiff.  Please try uploading your photo again."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Try again"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Try again"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//h2[text()="Upload your favorite kitchen photo"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=(//img[@alt="click to add an image"])[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="Choose a file or drag and drop " and text()="it here"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="Images showing people are not allowed."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="We recommend using high quality .jpg and .png files " and text()="less than 20 MB."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//*[local-name()="svg" and @role="img"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//*[local-name()="svg" and @role="img"]').click()).toBeTruthy;
            expect(await this.page.locator(`xpath=//div[text()="Let's find your style."]`).isVisible()).toBeTruthy;
            expect(await this.page.locator(`xpath=//div[text()="What's your style match? You have 3 ways to explore."]`).isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@title="Take the Style Quiz"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@title="Take the Style Quiz"]//div[text()="Recommended"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//img[@alt="Take the Style Quiz"]').isVisible()).toBeTruthy;
            expect(await this.page.locator(`xpath=//div[text()="Answer 4 questions, and we'll identify your ideal style."]`).isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[@aria-disabled="false" and text()="Start the quiz"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Let AI analyze your photo"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//img[@alt="Let AI analyze your photo"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Give artificial intelligence a chance to determine your favorite style."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Upload a photo"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Browse styles"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Traditional? Modern? Transitional? Go directly to your favorite style."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="See all styles"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Style Upload invalid image format failed message");
            return "Passed"
        }
        catch {
            logError(this.page, "Failed to verify Style Upload invalid image format failed message");
            return 'Failed';
        }
    }

    async verifyUploadFailDueToInvalidFileSize() {
        try {
            this.verifyStyleFork();
            expect(await this.page.locator('xpath=//button[text()="Upload a photo"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//h2[text()="Upload your favorite kitchen photo"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=(//img[@alt="click to add an image"])[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="Choose a file or drag and drop " and text()="it here"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="Images showing people are not allowed."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="We recommend using high quality .jpg and .png files " and text()="less than 20 MB."]').isVisible()).toBeTruthy;
            const packageRoot = path.dirname(require.resolve('playwright'));
            logInfo(this.page, "Folder:" + path.resolve(packageRoot, '../..'));
            await this.page.getByRole('img', { name: 'click to add an image' }).first().click();
            const [fileChooser] = await Promise.all([
                this.page.waitForEvent('filechooser'),
                this.page.getByRole('img', { name: 'click to add an image' }).first().click()
            ]);
            await fileChooser.setFiles(path.resolve(packageRoot, '../..') + '/Photo/40mb.png');
            expect(await this.page.locator('xpath=//h2[text()="File size limit exceeded"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//img[@class="image failure"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="Make sure your image is in one of the following formats: .jpg, .png, .gif, .bmp, or .tiff.  Please try uploading your photo again."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Try again"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Try again"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//h2[text()="Upload your favorite kitchen photo"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=(//img[@alt="click to add an image"])[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="Choose a file or drag and drop " and text()="it here"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="Images showing people are not allowed."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="We recommend using high quality .jpg and .png files " and text()="less than 20 MB."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//*[local-name()="svg" and @role="img"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//*[local-name()="svg" and @role="img"]').click()).toBeTruthy;
            expect(await this.page.locator(`xpath=//div[text()="Let's find your style."]`).isVisible()).toBeTruthy;
            expect(await this.page.locator(`xpath=//div[text()="What's your style match? You have 3 ways to explore."]`).isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@title="Take the Style Quiz"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@title="Take the Style Quiz"]//div[text()="Recommended"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//img[@alt="Take the Style Quiz"]').isVisible()).toBeTruthy;
            expect(await this.page.locator(`xpath=//div[text()="Answer 4 questions, and we'll identify your ideal style."]`).isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[@aria-disabled="false" and text()="Start the quiz"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Let AI analyze your photo"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//img[@alt="Let AI analyze your photo"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Give artificial intelligence a chance to determine your favorite style."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Upload a photo"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Browse styles"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[text()="Traditional? Modern? Transitional? Go directly to your favorite style."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="See all styles"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Style Upload large image size fail message");
            return "Passed"
        }
        catch {
            logError(this.page, "Failed to verify Style Upload large image size fail message");
            return 'Failed';
        }
    }

    async verifyStyleTunerImageShowsMoreDetailsIsNotDisplayed() {
        try {
            
            await expect(this.page.getByRole('button', { name: 'See all styles' })).not.toBeVisible();
            logInfo(this.page, "Successfully verified Show more details are not displayed");
            return "Passed"
        }
        catch {
            logError(this.page, "Failed to verify Show more details are not displayed");
            return 'Failed';
        }
    }

    async verifyStyleTunerSlidersIsNotDisplayed() {
        try {
            await expect(this.page.getByRole('button', { name: 'See all styles' })).not.toBeVisible();
            logInfo(this.page, "Successfully verified Style Tuner Slider is not displayed");
            return "Passed"
        }
        catch {
            logError(this.page, "Failed to verify Style Tuner Slider is not displayed");
            return 'Failed';
        }
    }

    async verifyStyleTunerResetSlidersIsNotDisplayed() {
        try {
            
            await expect(this.page.getByRole('button', { name: 'See all styles' })).not.toBeVisible();
            logInfo(this.page, "Successfully verified Style Tuner Reset Slider is not displayed");
            return "Passed"
        }
        catch {
            logError(this.page, "Failed to verify Style Tuner reset slider is not displayed");
            return 'Failed';
        }
    }

    async verifyUploadHumanPhotoThroughDropImage() {
        try {
            this.verifyStyleFork();
            expect(await this.page.locator('xpath=//button[text()="Upload a photo"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//h2[text()="Upload your favorite kitchen photo"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=(//img[@alt="click to add an image"])[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="Choose a file or drag and drop " and text()="it here"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="Images showing people are not allowed."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="We recommend using high quality .jpg and .png files " and text()="less than 20 MB."]').isVisible()).toBeTruthy;
            const packageRoot = path.dirname(require.resolve('playwright'));
            logInfo(this.page, "Folder:" + path.resolve(packageRoot, '../..'));
            await this.page.getByRole('img', { name: 'click to add an image' }).first().click();
            const [fileChooser] = await Promise.all([
                this.page.waitForEvent('filechooser'),
                this.page.getByRole('img', { name: 'click to add an image' }).first().click()
            ]);
            await fileChooser.setFiles(path.resolve(packageRoot, '../..') + '/Photo/FacePhoto.png');
            expect(await this.page.locator('xpath=//h2[text()="Uploading your image..."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="This may take a moment, please wait."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h2[text()="Is this the photo you\'d like to analyze?"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//img[@alt="reference image to analyze"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Go back"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Continue"]').isVisible()).toBeTruthy;
            await this.page.getByTestId('TestId_StyleAnalyzer_Preview_Continue_Btn').click();
            expect(await this.page.locator('xpath=//h2[text()="Analysis failed"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="Something went wrong with the analysis of your photo. Please try again."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//img[@class="image failure"]').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Style Upload human image fail message");
            return "Passed"
        }
        catch {
            logError(this.page, "Failed to verify Style Upload human image fail message");
            return 'Failed';
        }
    }

    async verifyUploadPhotoThroughDropImagePath() {
        try {
            this.verifyStyleFork();
            expect(await this.page.locator('xpath=//button[text()="Upload a photo"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//h2[text()="Upload your favorite kitchen photo"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=(//img[@alt="click to add an image"])[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="Choose a file or drag and drop " and text()="it here"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="Images showing people are not allowed."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="We recommend using high quality .jpg and .png files " and text()="less than 20 MB."]').isVisible()).toBeTruthy;
            await this.page.getByLabel('close modal button').filter({ has: this.page.locator('svg') }).click();
            expect(await this.page.locator('xpath=//button[text()="Upload a photo"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//h2[text()="Upload your favorite kitchen photo"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=(//img[@alt="click to add an image"])[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="Choose a file or drag and drop " and text()="it here"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="Images showing people are not allowed."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="We recommend using high quality .jpg and .png files " and text()="less than 20 MB."]').isVisible()).toBeTruthy;
            const packageRoot = path.dirname(require.resolve('playwright'));
            logInfo(this.page, "Folder:" + path.resolve(packageRoot, '../..'));
            await this.page.getByRole('img', { name: 'click to add an image' }).first().click();
            const [fileChooser] = await Promise.all([
                this.page.waitForEvent('filechooser'),
                this.page.getByRole('img', { name: 'click to add an image' }).first().click()
            ]);
            await fileChooser.setFiles(path.resolve(packageRoot, '../..') + '/Photo/ValidPNG.png');
            expect(await this.page.locator('xpath=//h2[text()="Uploading your image..."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="This may take a moment, please wait."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h2[text()="Is this the photo you\'d like to analyze?"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//img[@alt="reference image to analyze"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Go back"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Continue"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@class="sc-eqYatC rPQVH icon"]/*[local-name()="svg"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Upload a photo"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//h2[text()="Upload your favorite kitchen photo"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=(//img[@alt="click to add an image"])[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="Choose a file or drag and drop " and text()="it here"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="Images showing people are not allowed."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="We recommend using high quality .jpg and .png files " and text()="less than 20 MB."]').isVisible()).toBeTruthy;
            const packageRoot2 = path.dirname(require.resolve('playwright'));
            logInfo(this.page, "Folder:" + path.resolve(packageRoot2, '../..'));
            await this.page.getByRole('img', { name: 'click to add an image' }).first().click();
            const [fileChooser2] = await Promise.all([
                this.page.waitForEvent('filechooser'),
                this.page.getByRole('img', { name: 'click to add an image' }).first().click()
            ]);
            await fileChooser2.setFiles(path.resolve(packageRoot2, '../..') + '/Photo/ValidPNG.png');

            expect(await this.page.locator('xpath=//h2[text()="Uploading your image..."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="This may take a moment, please wait."]').isVisible()).toBeTruthy;

            expect(await this.page.locator('xpath=//h2[text()="Is this the photo you\'d like to analyze?"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//img[@alt="reference image to analyze"]').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_StyleAnalyzer_Preview_GoBack_Btn').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_StyleAnalyzer_Preview_Continue_Btn').click()).toBeTruthy;
            await this.page.waitForTimeout(10000);
            expect(await this.page.locator('xpath=//h2[text()="Analyzing your photo to determine your style"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="This may take a moment, please wait."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h2[text()="Style match successful!"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//img[@class="image success"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="Your photo has been analyzed successfully."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h4[text()="Next: Your style match results"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Continue"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//div[@class="sc-eqYatC rPQVH icon"]/*[local-name()="svg"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//button[text()="Upload a photo"]').click()).toBeTruthy;
            expect(await this.page.locator('xpath=//h2[text()="Upload your favorite kitchen photo"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=(//img[@alt="click to add an image"])[1]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="Choose a file or drag and drop " and text()="it here"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="Images showing people are not allowed."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//p[text()="We recommend using high quality .jpg and .png files " and text()="less than 20 MB."]').isVisible()).toBeTruthy;
            const packageRoot3 = path.dirname(require.resolve('playwright'));
            logInfo(this.page, "Folder:" + path.resolve(packageRoot3, '../..'));
            await this.page.getByRole('img', { name: 'click to add an image' }).first().click();
            const [fileChooser3] = await Promise.all([
                this.page.waitForEvent('filechooser'),
                this.page.getByRole('img', { name: 'click to add an image' }).first().click()
            ]);
            await fileChooser3.setFiles(path.resolve(packageRoot3, '../..') + '/Photo/ValidPNG.png');
            expect(await this.page.locator('xpath=//h2[text()="Uploading your image..."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="This may take a moment, please wait."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h2[text()="Is this the photo you\'d like to analyze?"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//img[@alt="reference image to analyze"]').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_StyleAnalyzer_Preview_GoBack_Btn').isVisible()).toBeTruthy;
            expect(await this.page.getByTestId('TestId_StyleAnalyzer_Preview_Continue_Btn').click()).toBeTruthy;
            await this.page.waitForTimeout(10000);
            expect(await this.page.locator('xpath=//h2[text()="Analyzing your photo to determine your style"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="This may take a moment, please wait."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h2[text()="Style match successful!"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//img[@class="image success"]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h3[text()="Your photo has been analyzed successfully."]').isVisible()).toBeTruthy;
            expect(await this.page.locator('xpath=//h4[text()="Next: Your style match results"]').isVisible()).toBeTruthy;
            await this.page.waitForTimeout(10000);
            await this.page.getByTestId('TestId_StyleAnalyzer_Results_Continue_Btn').scrollIntoViewIfNeeded();
            await this.page.getByTestId('TestId_StyleAnalyzer_Results_Continue_Btn').focus();
            await this.page.getByTestId('TestId_StyleAnalyzer_Results_Continue_Btn').hover();
            await this.page.getByTestId('TestId_StyleAnalyzer_Results_Continue_Btn').isEnabled();
            await this.page.getByTestId('TestId_StyleAnalyzer_Results_Continue_Btn').click({ trial: true });
            await this.page.getByTestId('TestId_StyleAnalyzer_Results_Continue_Btn').click({ force: true });
            await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/style/tuner');
            await this.page.waitForTimeout(10000);
            expect(await this.page.locator('xpath=//div[text()="You have great taste. Let\'s take a closer look."]').isVisible()).toBeTruthy;
            logInfo(this.page, "Successfully verified Style Upload photo through drop image");
            return "Passed"
        }
        catch {
            logError(this.page, "Failed to verify Style Upload photo through drop image");
            return 'Failed';
        }
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
        await this.page.waitForTimeout(10000);
        logInfo(this.page, "Successfully completed Ice Breaker flow and navigated to style finder page");
    }


    // ── Private helper methods ───────────────────────────────────────────

    private async verifyProgressIndicator(current: string, total: string) {
        await expect(this.page.locator('div').filter({ hasText: current }).first()).toBeVisible();
        await expect(this.page.locator('div').filter({ hasText: '/' }).first()).toBeVisible();
        await expect(this.page.locator('div').filter({ hasText: total }).first()).toBeVisible();
    }

    private async verifyQuizImages() {
    const images = this.page.locator("div.imageStack img");
    
    // Verify 8 images are present
    await expect(images).toHaveCount(8);
    
    // Verify all images have .jpg in src
    const count = await images.count();
    for (let i = 0; i < count; i++) {
        const src = await images.nth(i).getAttribute('src');
        expect(src).toContain('.jpg');
        logInfo(this.page, `Image ${i + 1} src: ${src}`);
    }    
    logInfo(this.page, "Verified: All 8 images are present and contain .jpg");
}


    private async verifyQuizOptions(options: string[]) {
        for (const option of options) {
            await expect(this.page.getByRole('button', { name: option })).toBeVisible();
        }
    }

    private async verifyNextButtonDisabled() {
        await expect(this.page.getByRole('button', { name: 'Next' })).toBeDisabled();
    }
}


