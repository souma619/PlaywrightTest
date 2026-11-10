import { expect, type Locator, type Page } from '@playwright/test';

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
export default class NewHomePageResearch {
  constructor(public page: Page) {
    page.on('console', (msg) => {
      const timestamp = new Date().toUTCString();
      console.log(`${timestamp} - ${msg.type().toUpperCase()} - ${msg.text()}`);
    });
  }

  getHomeUrl(): string {
    return this.homeUrl();
  }

  getJumpstarterSecretUrl(): string {
    return this.jumpstarterSecretUrl();
  }

  getJumpstarterStartUrl(): string {
    return this.jumpstarterStartUrl();
  }

  private homeUrl(): string {
    return `https://home.${process.env.environment}.digitalmbd.net/`;
  }

  private jumpstarterSecretUrl(): string {
    return `https://js.${process.env.environment}.digitalmbd.net/secret/straw-serve-pound.html`;
  }

  private jumpstarterStartUrl(): string {
    return `https://js.${process.env.environment}.digitalmbd.net/start`;
  }

  private async ensureOnHomepage(): Promise<void> {
    if (!this.page.url().includes('home.')) {
      await this.page.goto(this.jumpstarterSecretUrl());
      await this.page.waitForURL(this.jumpstarterStartUrl(), { timeout: 60000 });
      await this.page.goto(this.homeUrl());
    }
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    await this.page.waitForLoadState('domcontentloaded');
  }

  private async acceptCookiesIfPresent(): Promise<void> {
    const cookieCandidates = [
      this.page.locator('#onetrust-accept-btn-handler'),
      this.page.getByRole('button', { name: /accept all cookies/i }),
      this.page.getByRole('button', { name: /allow all/i }),
      this.page.getByRole('button', { name: /accept all/i }),
    ];

    for (const candidate of cookieCandidates) {
      if (await this.clickIfVisible(candidate)) {
        return;
      }
    }
  }

  private async clickIfVisible(locator: Locator): Promise<boolean> {
    try {
      if (await locator.count()) {
        const first = locator.first();
        if (await first.isVisible()) {
          await first.click({ force: true });
          return true;
        }
      }
    } catch {
      return false;
    }
    return false;
  }

  private normalizeUrl(url: string): string {
    return url.replace(/\/\?/, '?').replace(/\/$/, '').toLowerCase();
  }

  private async findButton(buttonName: string): Promise<Locator> {
    const byRole = this.page.getByRole('button', { name: buttonName, exact: true });
    if (await byRole.count()) {
      const visible = await this.firstVisible(byRole);
      return visible ?? byRole.first();
    }

    const escaped = buttonName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const flexibleApostrophePattern = escaped.replace(/['’]/g, "['’]");
    const byRoleFlexible = this.page.getByRole('button', {
      name: new RegExp(`^\\s*${flexibleApostrophePattern}\\s*$`, 'i'),
    });
    if (await byRoleFlexible.count()) {
      const visible = await this.firstVisible(byRoleFlexible);
      return visible ?? byRoleFlexible.first();
    }

    const byAria = this.page.locator(`[aria-label="${buttonName}"]`);
    if (await byAria.count()) {
      const visible = await this.firstVisible(byAria);
      return visible ?? byAria.first();
    }

    const byTitle = this.page.locator(`[title="${buttonName}"]`);
    if (await byTitle.count()) {
      const visible = await this.firstVisible(byTitle);
      return visible ?? byTitle.first();
    }

    const byButtonText = this.page
      .locator('button, [role="button"]')
      .filter({ hasText: new RegExp(`^\\s*${flexibleApostrophePattern}\\s*$`, 'i') });
    if (await byButtonText.count()) {
      const visible = await this.firstVisible(byButtonText);
      return visible ?? byButtonText.first();
    }

    return byRole.first();
  }

  private async firstVisible(locator: Locator): Promise<Locator | null> {
    const count = await locator.count();
    for (let i = 0; i < count; i++) {
      const candidate = locator.nth(i);
      if (await candidate.isVisible()) {
        return candidate;
      }
    }
    return null;
  }

  private async findLink(linkText: string): Promise<Locator> {
    const byRole = this.page.getByRole('link', { name: linkText, exact: true });
    if (await byRole.count()) {
      const visible = await this.firstVisible(byRole);
      return visible ?? byRole.first();
    }

    const escaped = linkText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const flexibleApostrophePattern = escaped.replace(/['’]/g, "['’]");
    const byRoleFlexible = this.page.getByRole('link', {
      name: new RegExp(`^\\s*${flexibleApostrophePattern}\\s*$`, 'i'),
    });
    if (await byRoleFlexible.count()) {
      const visible = await this.firstVisible(byRoleFlexible);
      return visible ?? byRoleFlexible.first();
    }

    const byText = this.page.locator('a').filter({ hasText: new RegExp(`^\\s*${flexibleApostrophePattern}\\s*$`, 'i') });
    if (await byText.count()) {
      const visible = await this.firstVisible(byText);
      return visible ?? byText.first();
    }

    return byRole.first();
  }

  private async findLinkByHref(expectedHref: string, occurrence = 0): Promise<Locator> {
    const allAnchors = this.page.locator('a[href]');
    const matchedIndexes: number[] = [];
    const visibleMatchedIndexes: number[] = [];
    const count = await allAnchors.count();

    for (let i = 0; i < count; i++) {
      const anchor = allAnchors.nth(i);
      const href = await anchor.getAttribute('href');
      if (!href) {
        continue;
      }

      const resolvedHref = new URL(href, this.page.url()).toString();
      if (this.normalizeUrl(resolvedHref) === this.normalizeUrl(expectedHref)) {
        matchedIndexes.push(i);
        if (await anchor.isVisible()) {
          visibleMatchedIndexes.push(i);
        }
      }
    }

    if (visibleMatchedIndexes.length > occurrence) {
      return allAnchors.nth(visibleMatchedIndexes[occurrence]);
    }

    if (matchedIndexes.length > occurrence) {
      return allAnchors.nth(matchedIndexes[occurrence]);
    }

    if (visibleMatchedIndexes.length > 0) {
      return allAnchors.nth(visibleMatchedIndexes[0]);
    }

    if (matchedIndexes.length > 0) {
      return allAnchors.nth(matchedIndexes[0]);
    }

    return allAnchors.first();
  }

  private async nthVisible(locator: Locator, occurrence: number): Promise<Locator | null> {
    let visibleIndex = 0;
    const count = await locator.count();
    for (let i = 0; i < count; i++) {
      const candidate = locator.nth(i);
      if (await candidate.isVisible()) {
        if (visibleIndex === occurrence) {
          return candidate;
        }
        visibleIndex += 1;
      }
    }
    return null;
  }

  async open(): Promise<void> {
    await this.page.goto(this.jumpstarterSecretUrl());
    await this.acceptCookiesIfPresent();
    await this.page.waitForURL(this.jumpstarterStartUrl(), { timeout: 60000 });
    await this.page.goto(this.homeUrl());
    await this.page.waitForLoadState('networkidle');
  }

  async handleInitialPopup(): Promise<void> {
    await this.ensureOnHomepage();

    await this.clickIfVisible(this.page.locator('#onetrust-close-btn-container button'));
    await this.clickIfVisible(this.page.getByRole('button', { name: 'Close' }));
    await this.clickIfVisible(this.page.getByRole('button', { name: 'No Thanks' }));
  }

  async launchViaJumpstarterAndAcceptCookie(): Promise<void> {
    await this.page.goto(this.jumpstarterSecretUrl());
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    await this.page.waitForLoadState('domcontentloaded');
    await this.acceptCookiesIfPresent();
    await this.page.waitForURL(this.jumpstarterStartUrl(), { timeout: 60000 });
  }

  async navigateToHomePage(): Promise<void> {
    await this.page.goto(this.homeUrl());
    await this.page.waitForLoadState('domcontentloaded');
  }

  async takeFullPageScreenshot(filePath: string): Promise<void> {
    await this.page.screenshot({ path: filePath, fullPage: true });
  }

  async verifyPageTitle(expectedTitle = 'Kitchen Remodel & Design: Create Your Dream Kitchen | Rebode'): Promise<void> {
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  async verifyHeading(headingType: 'H1' | 'H2' | 'H3', expectedText: string): Promise<void> {
    const level = Number.parseInt(headingType.slice(1), 10) as 1 | 2 | 3;
    const heading = this.page.getByRole('heading', { level, name: expectedText, exact: true }).first();
    await expect(heading).toBeVisible();
  }

  async verifyButton(buttonName: string): Promise<void> {
    const button = await this.findButton(buttonName);
    await expect(button).toBeVisible();
  }

  async verifyButtonNotEmpty(buttonName: string): Promise<void> {
    const button = await this.findButton(buttonName);
    await expect(button).toBeVisible();

    const text = ((await button.textContent()) ?? '').trim();
    const aria = (await button.getAttribute('aria-label')) ?? '';
    const title = (await button.getAttribute('title')) ?? '';
    expect((text || aria || title).trim().length).toBeGreaterThan(0);
  }

  async clickLinkAndVerifyNavigation(linkText: string, expectedUrl: string): Promise<void> {
    const link = await this.findLink(linkText);
    await expect(link).toBeVisible();

    const href = await link.getAttribute('href');
    if (expectedUrl.startsWith('mailto:')) {
      expect(href).toContain('mailto:');
      expect(href?.toLowerCase()).toContain(expectedUrl.toLowerCase());
      return;
    }

    if (href) {
      const resolved = new URL(href, this.page.url()).toString();
      expect(this.normalizeUrl(resolved)).toContain(this.normalizeUrl(expectedUrl));
    }

    const currentUrl = this.page.url();
    await link.click();

    const isExternal = /^https?:\/\//i.test(expectedUrl);
    if (isExternal) {
      const normalizedCurrent = this.normalizeUrl(currentUrl);
      const normalizedExpected = this.normalizeUrl(expectedUrl);
      const normalizedAfter = this.normalizeUrl(this.page.url());

      if (normalizedAfter !== normalizedCurrent) {
        expect(normalizedAfter).toContain(normalizedExpected);
      } else {
        const target = (await link.getAttribute('target')) ?? '';
        if (target === '_blank') {
          expect((href ?? '').toLowerCase()).toContain(normalizedExpected);
        }
      }
    }
  }

  async verifyAllHeaders(): Promise<void> {
    await this.assertHeadingText(
      this.page.locator('h1').first(),
      'Everything you need to plan your kitchen remodel',
    );

    await this.assertHeadingText(this.page.locator('h2').nth(0), 'How it works');
    await this.assertHeadingText(
      this.page.locator('h2').nth(1),
      'From vision to renovation: kitchens that started here',
    );
    await this.assertHeadingText(this.page.locator('h2').nth(2), 'Tools to shape your dream kitchen with ease');

    await this.assertHeadingText(this.page.locator('h3').nth(0), 'FREE DESIGN TOOL');
    await this.assertHeadingText(this.page.locator('h3').nth(1), 'JOIN FREE TO ACCESS');
    await this.assertHeadingText(this.page.locator('h3').nth(2), 'FREE SERVICE');
    await this.assertHeadingText(this.page.locator('h3').nth(3), 'SPECIAL PREVIEW');

    await this.assertHeadingText(this.page.locator('h2').nth(3), 'See your dream kitchen come to life - FREE.');
    await this.assertHeadingText(this.page.locator('h2').nth(4), 'Still exploring?');
    await this.assertHeadingText(this.page.locator('h2').nth(5), 'Your questions, answered');
    await this.assertHeadingText(
      this.page.locator('h2').nth(6),
      "We're on a mission to transform the kitchen remodeling experience",
    );
  }

  async verifyAllButtons(): Promise<void> {
    const namedButtons = [
      'Find your Style',
      'Design your Flow',
      'Plan your Budget',
      'Build your Team',
      'Social Bistro, Charlotte, NC',
      'Industrial, Organized Family Center, Irvine, CA',
      'Social Club, Annapolis, MD',
      'Do I have to pay to work with Rebode for my kitchen remodel?',
      'What is a Rebode expert, and how do they help?',
      'How does Rebode select their kitchen designers?',
      'How long does it take to match with a local kitchen designer?',
      "I'm already working with a designer; can I still use Rebode tools?",
    ];

    for (const name of namedButtons) {
      await this.assertNamedButton(name);
    }

    const optionalCookieControls = [
      'Cookies Settings',
      'Reject All',
      'Accept All Cookies',
      'Allow All',
      'Back Button',
      'Filter Icon',
      'Clear',
      'Apply',
      'Cancel',
      'Confirm My Choices',
    ];
    for (const name of optionalCookieControls) {
      await this.assertCookieButtonIfVisible(name);
    }

    const anonymousButtonIndexes = [0, 5, 6, 7, 8, 9, 10, 11, 12, 16, 17, 18, 24, 25, 29, 30, 32, 33, 41, 42];
    const allButtons = this.page.getByRole('button');
    const totalButtons = await allButtons.count();
    for (const idx of anonymousButtonIndexes) {
      if (idx >= totalButtons) {
        continue;
      }

      const btn = allButtons.nth(idx);
      if (!(await btn.isVisible())) {
        continue;
      }

      await expect(btn).toBeVisible();

      const btnText = await btn.innerText();
      const ariaLabel = await btn.getAttribute('aria-label');
      expect(btnText.trim().length > 0 || (ariaLabel !== null && ariaLabel.trim().length > 0)).toBeTruthy();
    }
  }

  async verifyAllLinks(): Promise<void> {
    await this.assertNamedLinkHref('Kitchen Jumpstarter', 'https://js.int.digitalmbd.net?ref=navbar', 0);
    await this.assertNamedLinkHref('Blog', 'https://home.int.digitalmbd.net/blog', 0);
    await this.assertNamedLinkHref('About Rebode', 'https://home.int.digitalmbd.net/about', 0);
    await this.assertNamedLinkHref('Request your design', 'https://home.int.digitalmbd.net/home/designers', 0);
    await this.assertNamedLinkHref('Start here', 'https://jumpstarter.rebode.us/', 0);
    await this.assertNamedLinkHref('Privacy Statement', 'https://masterbrand.com/privacy-statement/default.aspx', 0);
    await this.assertNamedLinkHref('Terms of Use', 'https://masterbrand.com/terms-of-use/default.aspx', 0);
    await this.assertNamedLinkHref('Plan your dream kitchen', 'https://jumpstarter.rebode.us/', 0);
    await this.assertNamedLinkHref('What will yours look like', 'https://jumpstarter.rebode.us/', 0);
    await this.assertNamedLinkHref('Get started', 'https://jumpstarter.rebode.us/', 0);
    await this.assertNamedLinkHref('Sign up to try it', 'https://jumpstarter.rebode.us/', 0);
    await this.assertNamedLinkHref('Talk to an expert', 'mailto:hello@rebode.us', 0);
    await this.assertNamedLinkHref('Launch Rebode Vision', 'https://rebode.us/vision', 0);
    await this.assertNamedLinkHref('Start your kitchen transformation', 'https://jumpstarter.rebode.us/', 0);
    await this.assertNamedLinkHref('What to expect from your first meeting with a kitchen designer', 'https://www.rebode.us/blog/posts/what-to-expect-in-your-first-meeting-with-a-kitchen-designer', 0);
    await this.assertNamedLinkHref('Functional custom kitchen cabinet ideas for any kitchen style', 'https://www.rebode.us/blog/posts/functional-custom-kitchen-cabinet-ideas', 0);
    await this.assertNamedLinkHref('Stunning kitchen cabinet styles to define your space', 'https://www.rebode.us/blog/posts/stunning-kitchen-cabinet-styles-to-define-your-space', 0);
    await this.assertNamedLinkHref('See more blog articles', 'https://www.rebode.us/blog', 0);
    await this.assertNamedLinkHref('FAQs', 'https://www.rebode.us/frequently-asked-questions', 0);
    await this.assertNamedLinkHref('Plan your dream kitchen', 'https://jumpstarter.rebode.us/start', 1);
    await this.assertNamedLinkHref('Learn More', 'https://home.int.digitalmbd.net/rebate', 0);
    await this.assertNamedLinkHref('Kitchen Jumpstarter', 'https://js.int.digitalmbd.net/?ref=footer', 1);
    await this.assertNamedLinkHref('Rebode Measure for iOS', 'https://apps.apple.com/us/app/rebode-measure/id6745407959?platform=iphone', 0);
    await this.assertNamedLinkHref('Expert Support', 'https://home.int.digitalmbd.net/expertsupport', 0);
    await this.assertNamedLinkHref('Blog', 'https://home.int.digitalmbd.net/blog', 1);
    await this.assertNamedLinkHref('Instagram', 'https://www.instagram.com/rebodehome/', 0);
    await this.assertNamedLinkHref('Facebook', 'https://www.facebook.com/people/Rebode/61563160505548/', 0);
    await this.assertNamedLinkHref('Pinterest', 'https://www.pinterest.com/rebodehome/', 0);
    await this.assertNamedLinkHref('About Rebode', 'https://home.int.digitalmbd.net/about', 1);
    await this.assertNamedLinkHref('FAQ', 'https://home.int.digitalmbd.net/frequently-asked-questions', 0);
    await this.assertNamedLinkHref('Your Privacy Choices', 'https://home.int.digitalmbd.net/privacy', 0);
    await this.assertNamedLinkHref('Terms of Use', 'https://masterbrand.com/terms-of-use/default.aspx', 1);
    await this.assertNamedLinkHref('Privacy Statement', 'https://masterbrand.com/privacy-statement/default.aspx', 1);

    const hiddenTextHrefs = [
      'https://home.int.digitalmbd.net/',
      'https://www.instagram.com/rebodehome/',
      'https://www.facebook.com/people/Rebode/61563160505548/',
      'https://www.pinterest.com/rebodehome/',
      'https://www.masterbrandcabinets.com/',
      'https://www.onetrust.com/products/cookie-consent/',
    ];

    for (const href of hiddenTextHrefs) {
      await this.assertHrefOnlyLink(href);
    }
  }

  async verifyAllImages(): Promise<void> {
    await this.assertImageAltByContains('left-pattern.png', 'pattern');
    await this.assertImageAltByContains('right-pattern.png', 'pattern');
    await this.assertImageAltByContains('style-transitional-2_2000x1300.jpg', 'Hero banner image');
    await this.assertImageAltByContains('KitchenHotspot.png', 'background image');

    await this.assertImageAltByContains('testimonialhead.jpg&w=96', 'Nicole B., Age 30, Texas', 0);
    await this.assertImageAltByContains('testimonialhead2.jpg', 'Josh S., Age 45, Pennsylvania', 0);
    await this.assertImageAltByContains('testimonialhead3.jpg', 'Vincent P., Age 54, California', 0);
    await this.assertImageAltByContains('testimonialhead4.jpg', 'Sharon., Age 58, Georgia', 0);
    await this.assertImageAltByContains('houzz.png', 'Houzz', 0);

    await this.assertImageAltByContains('testimonialhead.jpg&w=96', 'Nicole B., Age 30, Texas', 1);
    await this.assertImageAltByContains('testimonialhead2.jpg', 'Josh S., Age 45, Pennsylvania', 1);
    await this.assertImageAltByContains('testimonialhead3.jpg', 'Vincent P., Age 54, California', 1);
    await this.assertImageAltByContains('testimonialhead4.jpg', 'Sharon., Age 58, Georgia', 1);
    await this.assertImageAltByContains('houzz.png', 'Houzz', 1);

    await this.assertImageAltByContains('hit1.jpg', 'hit1.jpg');
    await this.assertImageAltByContains('hit2.jpg', 'hit2.jpg');
    await this.assertImageAltByContains('hit3.jpg', 'hit3.jpg');
    await this.assertImageAltByContains('hit4.png', 'hit4.png');
    await this.assertImageAltByContains('hit1.jpg?w=2560&q=75&auto=format', 'hit1.jpg');

    await this.assertImageAltByContains('tab1.png', 'image', 0);
    await this.assertImageAltByContains('hs.jpg&w=128', 'avatar', 0);
    await this.assertImageAltByContains('tab1.png', 'image', 1);
    await this.assertImageAltByContains('hs.jpg&w=128', 'avatar', 1);
    await this.assertImageAltByContains('hs.jpg&w=128', 'avatar', 2);
    await this.assertImageAltByExactSrc('https://home.int.digitalmbd.net/svg/rebode-color-logo.svg', 'avatar');
    await this.assertImageAltByContains('tab2.jpg', 'image');
    await this.assertImageAltByContains('hs.jpg&w=128', 'avatar', 3);
    await this.assertImageAltByExactSrc('https://home.int.digitalmbd.net/svg/petals.svg', 'avatar');
    await this.assertImageAltByContains('tab3.jpg', 'image');
    await this.assertImageAltByContains('tab4.png', 'image');
    await this.assertImageAltByContains('hs.jpg&w=128', 'avatar', 4);

    await this.assertImageAltByContains('tool1.png', 'Free Design Tool');
    await this.assertImageAltByContains('tool3.png', 'JOIN FREE TO ACCESS');
    await this.assertImageAltByContains('tool4.jpg', 'FREE SERVICE');
    await this.assertImageAltByContains('tool5.png', 'Special Preview');
    await this.assertImageAltByContains('screen.jpg', 'image with text');
    await this.assertImageAltByContains('Image1.png', 'Image1.png');
    await this.assertImageAltByExactSrc('https://home.int.digitalmbd.net/svg/rebode-logo-rounded.svg', 'rebode-logo', 0);
    await this.assertImageAltByContains('Image2.png', 'Image2.png');
    await this.assertImageAltByExactSrc('https://home.int.digitalmbd.net/svg/rebode-logo-rounded.svg', 'rebode-logo', 1);
    await this.assertImageAltByContains('Image3.png', 'Image3.png');
    await this.assertImageAltByExactSrc('https://home.int.digitalmbd.net/svg/rebode-logo-rounded.svg', 'rebode-logo', 2);

    const promoIcon = this.page.locator('img[src="https://home.int.digitalmbd.net/svg/promo-icon.svg"]').first();
    await expect(promoIcon).toBeVisible();
    const promoAlt = (await promoIcon.getAttribute('alt')) ?? '';
    expect(promoAlt.trim().length > 0).toBeTruthy();

    await this.assertImageAltByContains('Content%2520Icon.png', 'icon');

    const imgAt44 = this.page.locator('img').nth(44);
    await expect(imgAt44).toBeVisible();
    const img44Alt = (await imgAt44.getAttribute('alt')) ?? '';
    expect(img44Alt.trim().length > 0).toBeTruthy();

    await this.assertImageAltByContains('rebode-horizontal-logo.png', 'Company Logo');
    await this.assertImageAltByContains('powered_by_logo.svg', 'Powered by Onetrust');
  }

  async verifySliderPresenceAndFunctionality(): Promise<void> {
    const candidateSelectors = ['[role="slider"]', 'input[type="range"]', '.slider', '[class*="slider"]'];

    let slider: Locator | null = null;
    for (const selector of candidateSelectors) {
      const candidate = this.page.locator(selector).first();
      if (await candidate.count()) {
        slider = candidate;
        break;
      }
    }

    expect(slider).not.toBeNull();
    const sliderLocator = slider as Locator;

    await expect(sliderLocator).toBeVisible();

    await sliderLocator.focus();
    await sliderLocator.press('ArrowRight');
    await sliderLocator.press('ArrowLeft');

    const box = await sliderLocator.boundingBox();
    if (box) {
      await this.page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
      await this.page.mouse.down();
      await this.page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5);
      await this.page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5);
      await this.page.mouse.up();
    }

    await expect(sliderLocator).toBeVisible();
    await expect(sliderLocator).toBeEnabled();
  }

  private async assertHeadingText(locator: Locator, expectedText: string): Promise<void> {
    await expect(locator).toBeVisible();
    await expect(locator).toHaveText(expectedText);
  }

  private async assertNamedButton(name: string): Promise<void> {
    const button = await this.findButton(name);
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
  }

  private async assertCookieButtonIfVisible(name: string): Promise<void> {
    try {
      const button = this.page.getByRole('button', { name, exact: true }).first();
      if (await button.isVisible()) {
        await expect(button).toBeVisible();
        await expect(button).toBeEnabled();
      }
    } catch {
      // Cookie controls may not be rendered for all sessions.
    }
  }

  private async assertLinkHref(locator: Locator, expectedHref: string, requireVisible = true): Promise<void> {
    if (requireVisible) {
      await expect(locator).toBeVisible();
    } else {
      await expect(locator).toHaveCount(1);
    }

    const href = await locator.getAttribute('href');
    expect(href).not.toBeNull();

    const resolvedHref = new URL(href as string, this.page.url()).toString();
    expect(this.normalizeUrl(resolvedHref)).toBe(this.normalizeUrl(expectedHref));
  }

  private async assertNamedLinkHref(linkText: string, expectedHref: string, occurrence = 0): Promise<void> {
    let link = await this.findLinkByHref(expectedHref, occurrence);

    if (!(await link.count()) || !(await link.isVisible())) {
      link = await this.findLink(linkText);
    }

    await this.assertLinkHref(link, expectedHref);
  }

  private async assertHrefOnlyLink(expectedHref: string): Promise<void> {
    const anchor = await this.findLinkByHref(expectedHref);
    await this.assertLinkHref(anchor, expectedHref, false);
  }

  private async assertImageAltByContains(srcContains: string, expectedAlt: string, occurrence = 0): Promise<void> {
    const img = this.page.locator(`img[src*="${srcContains}"]`).nth(occurrence);
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute('alt', expectedAlt);
  }

  private async assertImageAltByExactSrc(src: string, expectedAlt: string, occurrence = 0): Promise<void> {
    const img = this.page.locator(`img[src="${src}"]`).nth(occurrence);
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute('alt', expectedAlt);
  }
}
