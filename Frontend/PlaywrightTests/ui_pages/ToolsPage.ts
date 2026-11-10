import { expect, Locator, Page } from '@playwright/test';

export default class ToolsPage {
    constructor(public page: Page) {}

    private homeUrl(): string {
        return `https://home.${process.env.environment ?? 'int'}.digitalmbd.net`;
    }

    private cardLink(name: string): Locator {
        return this.page.getByRole('main').getByRole('link', { name, exact: true });
    }

    private cardByHeading(name: string): Locator {
        return this.page.getByRole('heading', { name, exact: true }).locator('xpath=../..');
    }

    async openFromUniversalHeader() {
        await this.page.goto(this.homeUrl(), { waitUntil: 'domcontentloaded' });
        const toolsLink = this.page.getByRole('navigation').getByRole('link', {
            name: 'See all planning tools',
            exact: true,
        });
        await expect(toolsLink).toBeVisible();
        await toolsLink.click();
        await this.page.waitForURL('**/home/tools');
        await this.verifyPageContent();
    }

    async verifyPageContent() {
        await expect(this.page.getByRole('heading', { name: 'Your kitchen project starts' })).toBeVisible();
        await expect(this.page.getByText('What do you want to do today?')).toBeVisible();
        const cards = [
            {
                heading: 'Bring your kitchen to life',
                imageAlt: 'build my space',
                description: 'Build your kitchen in 3D and explore styles and finishes made for your space.',
                link: 'Build my space',
            },
            {
                heading: 'Build your kitchen plan',
                imageAlt: 'start my plan',
                description: 'Work through the big decisions',
                link: 'Start my plan',
            },
            {
                heading: 'Discover your kitchen style',
                imageAlt: 'find my style',
                description: 'A short quiz matches your taste',
                link: 'Find my style',
            },
        ];

        for (const card of cards) {
            const cardLocator = this.cardByHeading(card.heading);
            await expect(cardLocator).toBeVisible();
            await expect(cardLocator.getByRole('img', { name: card.imageAlt })).toBeVisible();
            await expect(cardLocator).toContainText(card.description);
            await expect(cardLocator.getByRole('link', { name: card.link, exact: true })).toBeVisible();
        }

        await expect(this.page.getByRole('heading', { name: 'Ready to talk it through?' })).toBeVisible();
        await expect(this.page.getByRole('main').getByRole('link', { name: 'Talk with a designer', exact: true })).toBeVisible();
    }

    async verifyHeaderDesignerCta() {
        const designerLink = this.page.getByRole('navigation').getByRole('link', {
            name: 'Talk with a designer',
            exact: true,
        });
        await expect(designerLink).toBeVisible();
        await designerLink.click();
        await this.page.waitForURL(/\/home\/designers(?:[/?#]|$)/);
        await expect(this.page).toHaveURL(/\/home\/designers(?:[/?#]|$)/);
    }

    async openToolsPageDirectly() {
        await this.page.goto(`${this.homeUrl()}/home/tools`, { waitUntil: 'domcontentloaded' });
        await this.verifyPageContent();
    }

    async verifyCompletedStyleCard() {
        const styleCard = this.cardByHeading('Discover your kitchen style');
        await expect(styleCard).toBeVisible();
        await expect(styleCard.getByRole('img')).toBeVisible();
        await expect(styleCard.getByRole('link', { name: 'Find my style', exact: true })).toBeVisible();
        await expect(styleCard.getByRole('heading')).not.toHaveText('Discover your kitchen style');
    }

    async openCompletedJumpstarterPlan() {
        const planCard = this.cardByHeading('Build your kitchen plan');
        await expect(planCard).toBeVisible();
        const completedPlanLink = planCard.getByRole('link').filter({ hasNotText: 'Start my plan' }).first();
        await expect(completedPlanLink).toBeVisible();
        await completedPlanLink.click();
        await this.page.waitForURL(/\/remodel\/profile\/overview/);
        await expect(this.page).toHaveURL(/\/remodel\/profile\/overview/);
    }

    async openBuildMySpace() {
        await this.openCardAndExpectUrl('Build my space', /\/vision(?:[/?#]|$)/);
    }

    async openStartMyPlan() {
        await this.openCardAndExpectUrl('Start my plan', /(?:jumpstarter|\/start)/i);
    }

    async openFindMyStyle() {
        await this.openCardAndExpectUrl('Find my style', /\/home\/style\/quiz(?:[/?#]|$)/);
    }

    async openTalkWithADesigner() {
        await this.openCardAndExpectUrl('Talk with a designer', /\/home\/designers(?:[/?#]|$)/);
    }

    private async openCardAndExpectUrl(cardName: string, destination: RegExp) {
        await expect(this.cardLink(cardName)).toBeVisible();
        await this.cardLink(cardName).click();
        await this.page.waitForURL(destination);
        await expect(this.page).toHaveURL(destination);
    }
}