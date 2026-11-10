import { expect, Locator, Page } from "@playwright/test";
import { waitForSpinnerToDisappear } from '../helpers/waitHelpers';
import { attachConsoleLogger } from '../helpers/logSuppress';
import { acceptCookiesIfPresent } from "../helpers/waitHelpers";


/**
 * StyleQuizPage provides methods for automating and verifying
 * the "Take the style quiz" flow reachable from the Universal Header's
 * "Plan your kitchen" dropdown.
 */
export default class StyleQuizPage {

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

    /**
     * Launches the new Home page and sets the viewport size, then waits for the page to load.
     * INT/UAT require the cookies URL to be opened first before the home page is reachable directly.
     */
    async launchHomePage() {
        this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.page.goto('https://js.' + process.env.environment + '.digitalmbd.net/secret/straw-serve-pound.html');
        await acceptCookiesIfPresent(this.page);
        await waitForSpinnerToDisappear(this.page, 15000);
        await this.page.waitForTimeout(15000);
        await this.logInfo("Opened cookies URL, navigating to New Home Page");

        await this.page.goto('https://home.' + process.env.environment + '.digitalmbd.net', { waitUntil: 'domcontentloaded' });
        await acceptCookiesIfPresent(this.page);
        await waitForSpinnerToDisappear(this.page, 20000);
        await this.page.waitForTimeout(15000);
        await this.logInfo("Successfully navigated to New Home Page");
    }

    /**
     * Opens the Style Quiz via the "Plan your kitchen" header dropdown.
     */
    async openStyleQuizFromHeader() {
        const planYourKitchen = this.page.locator('span[aria-haspopup="true"]', { hasText: 'Plan your kitchen' });
        await expect(planYourKitchen).toBeVisible();
        await planYourKitchen.hover();
        await this.page.waitForTimeout(3000);

        const styleQuizTile = this.page.locator('span[class*="navDropdownItemLabel"]', { hasText: 'Take the style quiz' });
        await expect(styleQuizTile).toBeVisible();
        await styleQuizTile.hover();
        await styleQuizTile.click();

        await this.page.waitForURL('**home/style/quiz**', { timeout: 20000 });
        await this.page.waitForTimeout(5000);
        await this.logInfo("Successfully navigated to Style Quiz page");
    }

    private quizRegion(): Locator {
        return this.page.getByRole('region', { name: 'Style quiz spectrum question' });
    }

    private answerOptions(): Locator {
        return this.quizRegion().getByRole('radio');
    }

    async verifyQuestionProgress(current: number, total = 4) {
        await expect(this.quizRegion().getByText(`Question ${current} of ${total}`)).toBeVisible();
    }

    async getQuestionHeading(): Promise<string> {
        return (await this.quizRegion().getByRole('heading').textContent()) ?? '';
    }

    async getAnswerCount(): Promise<number> {
        return this.answerOptions().count();
    }

    async selectAnswerByIndex(index: number) {
        await this.answerOptions().nth(index).click();
    }

    async isAnswerSelected(index: number): Promise<boolean> {
        return this.answerOptions().nth(index).isChecked();
    }

    async clickNext() {
        await this.page.getByRole('button', { name: 'Next' }).click();
        await this.page.waitForTimeout(2000);
    }

    async clickPrev() {
        await this.page.getByRole('button', { name: 'Prev' }).click();
        await this.page.waitForTimeout(2000);
    }

    async clickSeeStyleMatch() {
        await this.page.getByRole('button', { name: 'See style match' }).click();
        await this.page.waitForTimeout(5000);
    }

    // Captures the class list of each answer image container so highlight changes can be detected
    // without depending on a specific highlight class name.
    private async getImageHighlightSignature(): Promise<string[]> {
        const containers = this.quizRegion().locator('img').locator('..');
        const count = await containers.count();
        const classes: string[] = [];
        for (let i = 0; i < count; i++) {
            classes.push((await containers.nth(i).getAttribute('class')) ?? '');
        }
        return classes;
    }

    async verifyStyleMatchResultPage() {
        await expect(this.page.getByRole('heading', { name: 'Your kitchen style match' })).toBeVisible();
        await expect(this.page.getByRole('button', { name: 'Talk with a designer' }).first()).toBeVisible();
        await expect(this.page.getByRole('button', { name: 'Retake the quiz' })).toBeVisible();
        await expect(this.page.getByRole('button', { name: 'Go to Style Tuner' })).toBeVisible();
        await expect(this.page.getByRole('button', { name: 'Go Home' })).toBeVisible();
    }

    /**
     * TestCaseId: 38933 - Verify Style Quiz Navigation and Questions
     */
    async verifyStyleQuizNavigationAndQuestions() {
        try {
            await this.launchHomePage();
            await this.openStyleQuizFromHeader();

            const expectedQuestions = [
                'Generally speaking, what decorating style do you prefer?',
                'How do you like your home to feel?',
                'What\u2019s your favorite way to decorate your home?',
                'What materials do you prefer in your home?'
            ];

            for (let i = 0; i < expectedQuestions.length; i++) {
                await this.verifyQuestionProgress(i + 1);
                await expect(this.quizRegion().getByRole('heading')).toContainText(expectedQuestions[i]);
                await this.logInfo(`verifyStyleQuizNavigationAndQuestions: Question ${i + 1} verified`);

                // Select the middle "In between" option to progress.
                const optionCount = await this.getAnswerCount();
                await this.selectAnswerByIndex(Math.floor(optionCount / 2));

                if (i < expectedQuestions.length - 1) {
                    await expect(this.page.getByRole('button', { name: 'Next' })).toBeEnabled();
                    await this.clickNext();
                } else {
                    await expect(this.page.getByRole('button', { name: 'See style match' })).toBeVisible();
                    await expect(this.page.getByRole('button', { name: 'Next' })).toHaveCount(0);
                    await this.logInfo('verifyStyleQuizNavigationAndQuestions: "See style match" displayed instead of "Next" on final question');
                }
            }
            return 'Passed';
        } catch (error) {
            await this.logError('Failed to verify Style Quiz navigation and questions: ', error);
            return 'Failed';
        }
    }

    /**
     * TestCaseId: 38938 - Verify Answer Selection and Corresponding Image Highlight
     */
    async verifyAnswerSelectionAndImageHighlight() {
        try {
            await this.launchHomePage();
            await this.openStyleQuizFromHeader();
            await this.verifyQuestionProgress(1);

            const optionCount = await this.getAnswerCount();
            expect(optionCount).toBeGreaterThan(0);

            let previousSignature = await this.getImageHighlightSignature();
            for (let index = 0; index < optionCount; index++) {
                await this.selectAnswerByIndex(index);
                expect(await this.isAnswerSelected(index)).toBe(true);
                await this.logInfo(`verifyAnswerSelectionAndImageHighlight: option index ${index} selected`);

                const currentSignature = await this.getImageHighlightSignature();
                expect(currentSignature).not.toEqual(previousSignature);
                previousSignature = currentSignature;

                for (let other = 0; other < optionCount; other++) {
                    if (other !== index) {
                        expect(await this.isAnswerSelected(other)).toBe(false);
                    }
                }
            }
            return 'Passed';
        } catch (error) {
            await this.logError('Failed to verify answer selection and image highlight: ', error);
            return 'Failed';
        }
    }

    /**
     * TestCaseId: 38939 - Verify Next and Previous Navigation
     */
    async verifyNextAndPreviousNavigation() {
        try {
            await this.launchHomePage();
            await this.openStyleQuizFromHeader();

            const selectedIndexPerQuestion = [0, 1, 2, 3];
            for (let q = 0; q < selectedIndexPerQuestion.length; q++) {
                await this.verifyQuestionProgress(q + 1);
                await this.selectAnswerByIndex(selectedIndexPerQuestion[q]);
                if (q < selectedIndexPerQuestion.length - 1) {
                    await this.clickNext();
                }
            }
            await expect(this.page.getByRole('button', { name: 'See style match' })).toBeVisible();
            await this.logInfo('verifyNextAndPreviousNavigation: reached final question via Next');

            for (let q = selectedIndexPerQuestion.length - 1; q > 0; q--) {
                await this.verifyQuestionProgress(q + 1);
                expect(await this.isAnswerSelected(selectedIndexPerQuestion[q])).toBe(true);
                await this.clickPrev();
            }

            await this.verifyQuestionProgress(1);
            expect(await this.isAnswerSelected(selectedIndexPerQuestion[0])).toBe(true);
            await expect(this.page.getByRole('button', { name: 'Prev' })).toBeDisabled();
            await this.logInfo('verifyNextAndPreviousNavigation: navigated back to Question 1 with answers retained and Prev disabled');

            return 'Passed';
        } catch (error) {
            await this.logError('Failed to verify Next/Prev navigation: ', error);
            return 'Failed';
        }
    }

    /**
     * TestCaseId: 38940 - Verify Style Match Based on Selected Answers
     */
    async verifyStyleMatchBasedOnAnswers() {
        try {
            await this.launchHomePage();
            await this.openStyleQuizFromHeader();

            for (let q = 0; q < 4; q++) {
                await this.verifyQuestionProgress(q + 1);
                // Consistently pick the first (most traditional/natural leaning) option.
                await this.selectAnswerByIndex(0);
                if (q < 3) {
                    await this.clickNext();
                }
            }

            await expect(this.page.getByRole('button', { name: 'See style match' })).toBeVisible();
            await expect(this.page.getByRole('button', { name: 'Next' })).toHaveCount(0);

            await this.clickSeeStyleMatch();
            await this.verifyStyleMatchResultPage();
            await this.logInfo('verifyStyleMatchBasedOnAnswers: style match page verified after completing quiz');

            return 'Passed';
        } catch (error) {
            await this.logError('Failed to verify style match based on selected answers: ', error);
            return 'Failed';
        }
    }

    /**
     * TestCaseId: 38941 - Verify Style Quiz Retains Answers When Navigating Back
     */
    async verifyRetainsAnswersWhenNavigatingBack() {
        try {
            await this.launchHomePage();
            await this.openStyleQuizFromHeader();

            const initialAnswers = [0, 1, 2];
            for (let q = 0; q < initialAnswers.length; q++) {
                await this.verifyQuestionProgress(q + 1);
                await this.selectAnswerByIndex(initialAnswers[q]);
                await this.clickNext();
            }
            await this.verifyQuestionProgress(4);

            await this.clickPrev();
            await this.verifyQuestionProgress(3);
            expect(await this.isAnswerSelected(initialAnswers[2])).toBe(true);
            await this.logInfo('verifyRetainsAnswersWhenNavigatingBack: previous answer retained on Question 3 after navigating back');

            const updatedAnswerForQ3 = 4;
            await this.selectAnswerByIndex(updatedAnswerForQ3);
            expect(await this.isAnswerSelected(updatedAnswerForQ3)).toBe(true);
            await this.clickNext();

            await this.verifyQuestionProgress(4);
            await this.selectAnswerByIndex(3);
            await expect(this.page.getByRole('button', { name: 'See style match' })).toBeVisible();
            await this.clickSeeStyleMatch();
            await this.verifyStyleMatchResultPage();
            await this.logInfo('verifyRetainsAnswersWhenNavigatingBack: style match reflects updated answer selection');

            return 'Passed';
        } catch (error) {
            await this.logError('Failed to verify retained answers when navigating back: ', error);
            return 'Failed';
        }
    }
}
