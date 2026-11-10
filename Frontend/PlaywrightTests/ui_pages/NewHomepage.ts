import { expect, Page } from "@playwright/test";

export default class NewHomePage {

    constructor(public page: Page) {

        page.on('console', msg => {
            const now = new Date();
            const timestamp = now.toUTCString();
            console.log(`${timestamp} - ${msg.type().toUpperCase()} - ${msg.text()}`);

        });
    }


    async launchNewHomePage() {
        await (this.page.evaluate(() => console.log("Launching JumpStarter Page")));
        await this.page.goto('https://js.' + process.env.environment + '.digitalmbd.net/secret/straw-serve-pound.html');
        this.page.setViewportSize({ width: 1920, height: 1080 });

        //Navigate to New Home Page
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
        await this.page.goto('https://home.' + process.env.environment + '.digitalmbd.net/');
        await (this.page.evaluate(() => console.log("Successfully navigated to HomePage")));
        let coookieFlag = this.page.locator('xpath=//*[@id="onetrust-close-btn-container"]/button').count();
        if ((await coookieFlag).valueOf() === 1) {
            expect(await this.page.locator('xpath=//*[@id="onetrust-close-btn-container"]/button').click()).toBeTruthy;
        }
    }

    async verifyHeroNavigationTabs() {

        await expect(this.page.getByRole('tab', { name: 'Find your Style' })).toBeVisible();
        await expect(this.page.getByRole('tab', { name: 'Design your Flow' })).toBeVisible();
        await expect(this.page.getByRole('tab', { name: 'Plan your Budget' })).toBeVisible();
        await expect(this.page.getByRole('tab', { name: 'Build your Team' })).toBeVisible();

        await expect(this.page.getByRole('link', { name: 'Start here..' })).toBeVisible();
        await this.page.getByRole('link', { name: 'Start here..' }).click();

        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
        await this.page.goto('https://home.' + process.env.environment + '.digitalmbd.net/');
    }

    async verifyHowItWorksSection() {

        await this.page.getByRole('heading', { name: 'How it works' }).scrollIntoViewIfNeeded();
        await expect(this.page.getByRole('heading', { name: 'How it works' })).toBeVisible();
        await expect(this.page.getByRole('heading', { name: 'How it works' })).toBeVisible();
        await expect(this.page.getByText('| Find your style')).toBeVisible();
        await expect(this.page.getByText('| Design your flow')).toBeVisible();
        await expect(this.page.getByText('| Plan your budget')).toBeVisible();
        await expect(this.page.getByText('| Build your team')).toBeVisible();
        await expect(this.page.locator('section').filter({ hasText: 'How it worksYour free, guided' }).getByRole('link')).toBeVisible();

        await this.page.locator('section').filter({ hasText: 'How it worksYour free, guided' }).getByRole('link').click();
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
        await this.page.goto('https://home.' + process.env.environment + '.digitalmbd.net/');
    }

    async verifyFromVisionToRenovation() {

        await this.page.getByRole('heading', { name: 'From vision to renovation:' }).scrollIntoViewIfNeeded();
        await expect(this.page.getByRole('heading', { name: 'From vision to renovation:' })).toBeVisible();
        await expect(this.page.getByRole('button', { name: 'Social Bistro, Charlotte, NC' })).toBeVisible();
        await expect(this.page.getByRole('button', { name: 'Industrial, Organized Family' })).toBeVisible();
        await expect(this.page.getByRole('button', { name: 'Farmhouse, Pet-Friendly' })).toBeVisible();
        await expect(this.page.getByRole('link', { name: 'What will yours look like' })).toBeVisible();

        await this.page.getByRole('link', { name: 'What will yours look like' }).click();
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
        await this.page.goto('https://home.' + process.env.environment + '.digitalmbd.net/');
    }

    async verifyToolsToShapeYourDream() {

        await this.page.getByRole('heading', { name: 'Tools to shape your dream' }).scrollIntoViewIfNeeded();
        await expect(this.page.getByRole('heading', { name: 'Tools to shape your dream' })).toBeVisible();
        await expect(this.page.getByRole('heading', { name: 'Free Design Tool' })).toBeVisible();
        await expect(this.page.getByRole('link', { name: 'Get started' })).toBeVisible();
        await expect(this.page.getByRole('heading', { name: 'Free iOS app' })).toBeVisible();
        await expect(this.page.getByRole('link', { name: 'Download the iOS app' })).toBeVisible();
        await expect(this.page.getByRole('heading', { name: 'JOIN FREE TO ACCESS' })).toBeVisible();
        await expect(this.page.getByRole('link', { name: 'Sign up to try it' })).toBeVisible();

        await this.page.getByRole('link', { name: 'Get started' }).click();
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
        await this.page.goto('https://home.' + process.env.environment + '.digitalmbd.net/');
    }

    async verifySeeYourDreamKitchenComeToLife() {

        await this.page.getByRole('heading', { name: 'See your dream kitchen come' }).scrollIntoViewIfNeeded();
        await expect(this.page.getByRole('heading', { name: 'See your dream kitchen come' })).toBeVisible();
        await expect(this.page.locator('body')).toContainText('See your dream kitchen come to life — FREE.');
        await expect(this.page.locator('body')).toContainText('Get your personalized Remodel Profile in just a few simple steps.');
        await expect(this.page.getByRole('link', { name: 'Start your kitchen' })).toBeVisible();
        await expect(this.page.locator('body')).toContainText('Start your kitchen transformation');


        await this.page.getByRole('link', { name: 'Start your kitchen' }).click();
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
        await this.page.goto('https://home.' + process.env.environment + '.digitalmbd.net/');
    }

    async verifyStillExploring() {

        await this.page.getByRole('heading', { name: 'Still exploring?' }).scrollIntoViewIfNeeded();
        await expect(this.page.getByRole('heading', { name: 'Still exploring?' })).toBeVisible();
        await expect(this.page.locator('body')).toContainText('Still exploring?');
        await expect(this.page.locator('body')).toContainText('Get practical tips, fresh ideas, and expert insights to plan your remodel with confidence.');
        await expect(this.page.getByRole('link', { name: 'What to expect from your' })).toBeVisible();
        await expect(this.page.getByRole('link', { name: 'Functional custom kitchen' })).toBeVisible();
        await expect(this.page.getByRole('link', { name: 'Stunning kitchen cabinet' })).toBeVisible();
        await expect(this.page.getByRole('link', { name: 'See more blog articles' })).toBeVisible();
        await expect(this.page.locator('body')).toContainText('See more blog articles');

        await this.page.getByRole('link', { name: 'See more blog articles' }).click();
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/blog');
        await this.page.goto('https://home.' + process.env.environment + '.digitalmbd.net/');
    }

    async verifyYourQuestionsAnswered() {

        await this.page.getByRole('heading', { name: 'Your questions, answered' }).scrollIntoViewIfNeeded();
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

        await this.page.locator('div').filter({ hasText: /^Ready to get started\?Plan your dream kitchen$/ }).getByRole('link').click();
        await this.page.waitForURL('https://js.' + process.env.environment + '.digitalmbd.net/start');
        await this.page.goto('https://home.' + process.env.environment + '.digitalmbd.net/');
    }

    async verifyAboutRebode() {

        await this.page.getByRole('heading', { name: 'Your questions, answered' }).scrollIntoViewIfNeeded();
        await expect(this.page.getByRole('paragraph').filter({ hasText: 'About Rebode' })).toBeVisible();
        await expect(this.page.getByRole('heading', { name: 'We’re on a mission to' })).toBeVisible();
        await expect(this.page.locator('body')).toContainText('We’re on a mission to transform the kitchen remodeling experience');
        await expect(this.page.locator('body')).toContainText('We believe every homeowner deserves a kitchen that feels like home - personal, functional, and beautiful, without the stress or second-guessing. As part of the MasterBrand family — the largest cabinet manufacturer in North America — we’ve learned a thing or two about what makes a great remodel experience. Now, we’ve transformed that expertise into a suite of digital tools that make remodeling simple, empowering, and accessible to everyone. With smart technology and a team of experts, we help you turn inspiration into action, with confidence and support every step of the way.');
    }
}