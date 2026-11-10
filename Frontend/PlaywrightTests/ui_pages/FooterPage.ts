import { expect, APIRequestContext, Locator, Page } from "@playwright/test";
import { waitForSpinnerToDisappear, hideChatBubble, acceptCookiesIfPresent } from '../helpers/waitHelpers';

type FooterLink = {
    name: string;
    href: string;
    target: string;
};

export default class FooterPage {

    // Environments that must never be referenced from a lower environment footer.
    private readonly foreignEnvironments = ['int', 'qa', 'uat', 'stg', 'prod'];

    // Production hostnames that must not appear while testing a non production environment.
    private readonly productionHosts = ['rebode.us', 'jumpstarter.rebode.us', 'www.rebode.us'];

    constructor(public page: Page) {
        page.on('console', msg => {
            const timestamp = new Date().toUTCString();
            console.log(`${timestamp} - ${msg.type().toUpperCase()} - ${msg.text()}`);
        });
    }

    private get environment(): string {
        const environment = process.env.environment;
        if (!environment) {
            throw new Error('environment variable is not set. Check PlaywrightTests/.env');
        }
        return environment;
    }

    private jumpstarterSecretUrl(): string {
        return `https://js.${this.environment}.digitalmbd.net/secret/straw-serve-pound.html`;
    }

    private jumpstarterStartUrl(): string {
        return `https://js.${this.environment}.digitalmbd.net/start`;
    }

    private homeUrl(): string {
        return `https://home.${this.environment}.digitalmbd.net/`;
    }

    private async dismissCookieBannerIfPresent() {
        const closeButton = this.page.locator('#onetrust-close-btn-container button');
        if (await closeButton.count() && await closeButton.first().isVisible().catch(() => false)) {
            await closeButton.first().click().catch(() => undefined);
        }
    }

    /**
     * Jumpstarter can only be reached through the cookie/secret URL, which redirects to /start.
     */
    async launchJumpstarterPage() {
        console.log('Launching Jumpstarter page');
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.page.goto(this.jumpstarterSecretUrl(), { waitUntil: 'domcontentloaded' });
        await acceptCookiesIfPresent(this.page);
        await this.page.waitForURL(this.jumpstarterStartUrl(), { timeout: 60000 });
        await this.page.waitForLoadState('domcontentloaded');
        await this.dismissCookieBannerIfPresent();
        console.log('Successfully navigated to Jumpstarter page');
    }

    /**
     * Homepage cannot be opened directly, so the cookie/secret URL is loaded first in the same tab.
     */
    async launchHomePage() {
        console.log('Launching Homepage via Jumpstarter cookie URL');
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.page.goto(this.jumpstarterSecretUrl(), { waitUntil: 'domcontentloaded' });
        await this.page.waitForURL(this.jumpstarterStartUrl(), { timeout: 60000 });
        await this.page.goto(this.homeUrl(), { waitUntil: 'domcontentloaded' });
        await this.dismissCookieBannerIfPresent();
        console.log('Successfully navigated to Homepage');
    }

    private footerLocator(): Locator {
        const contentInfo = this.page.getByRole('contentinfo');
        return contentInfo;
    }

    private async resolveFooter(): Promise<Locator> {
        const contentInfo = this.footerLocator();
        if (await contentInfo.count()) {
            return contentInfo.first();
        }

        const footerTag = this.page.locator('footer');
        if (await footerTag.count()) {
            return footerTag.first();
        }

        return this.page.locator('[class*="footer" i]').first();
    }

    private async collectFooterLinks(): Promise<FooterLink[]> {
        const footer = await this.resolveFooter();
        await footer.scrollIntoViewIfNeeded();
        await expect(footer).toBeVisible({ timeout: 30000 });

        const anchors = footer.locator('a');
        const total = await anchors.count();
        expect(total, 'Footer should contain at least one link').toBeGreaterThan(0);

        const links: FooterLink[] = [];
        for (let index = 0; index < total; index++) {
            const anchor = anchors.nth(index);
            const href = (await anchor.getAttribute('href'))?.trim() ?? '';
            const text = (await anchor.innerText().catch(() => ''))?.trim();
            const ariaLabel = (await anchor.getAttribute('aria-label'))?.trim();
                const target = (await anchor.getAttribute('target'))?.trim() ?? '';
                links.push({ name: text || ariaLabel || `link[${index}]`, href, target });
        }
        return links;
    }

    private absoluteHref(href: string): string {
        return new URL(href, this.page.url()).toString();
    }

    /**
     * Ensures a digitalmbd link targets the environment under test and never leaks to another one.
     */
    private assertEnvironmentIsCorrect(link: FooterLink, absoluteUrl: string) {
        const host = new URL(absoluteUrl).hostname.toLowerCase();

        if (host.endsWith('digitalmbd.net')) {
            expect(host, `Footer link "${link.name}" (${absoluteUrl}) must point to the ${this.environment} environment`)
                .toContain(`.${this.environment}.`);
            return;
        }

        const isProductionHost = this.productionHosts.includes(host);
        expect(isProductionHost, `Footer link "${link.name}" (${absoluteUrl}) points to production while testing ${this.environment}`)
            .toBeFalsy();

        const leakedEnvironment = this.foreignEnvironments
            .filter(env => env !== this.environment)
            .find(env => host.includes(`.${env}.digitalmbd`));
        expect(leakedEnvironment, `Footer link "${link.name}" (${absoluteUrl}) points to the ${leakedEnvironment} environment`)
            .toBeUndefined();
    }

    /**
     * A response of any status below 400 means the link resolves; 401/403/405/429 are returned by
     * third party sites that block automation but are still reachable.
     */
    private isReachableStatus(status: number): boolean {
        return status < 400 || [401, 403, 405, 429].includes(status);
    }

    private async checkLinkIsWorking(request: APIRequestContext, absoluteUrl: string): Promise<number> {
        const response = await request.get(absoluteUrl, { failOnStatusCode: false, maxRedirects: 5, timeout: 45000 });
        return response.status();
    }

    private comparableUrl(url: string): string {
        const parsed = new URL(url);
        return `${parsed.origin}${parsed.pathname.replace(/\/$/, '')}`.toLowerCase();
    }

    /**
     * Finds the first clickable anchor in the freshly loaded footer that resolves to the given URL.
     */
    private async findVisibleFooterAnchor(absoluteUrl: string): Promise<Locator | null> {
        const footer = await this.resolveFooter();
        await footer.scrollIntoViewIfNeeded();
        const anchors = footer.locator('a');
        const total = await anchors.count();

        for (let index = 0; index < total; index++) {
            const anchor = anchors.nth(index);
            const href = (await anchor.getAttribute('href'))?.trim();
            if (!href || this.absoluteHref(href) !== absoluteUrl) {
                continue;
            }
            if (await anchor.isVisible().catch(() => false)) {
                return anchor;
            }
        }
        return null;
    }

    /**
     * A 200 response is not enough for an SPA route, so the rendered destination is inspected too.
     */
    private async assertDestinationContent(destination: Page, link: FooterLink, absoluteUrl: string, failures: string[], pageLabel: string) {
        await destination.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => undefined);

        const landedUrl = destination.url();
        if (this.comparableUrl(landedUrl) !== this.comparableUrl(absoluteUrl)) {
            failures.push(`${pageLabel} footer link "${link.name}" navigated to ${landedUrl} instead of ${absoluteUrl}`);
            return;
        }

        const bodyText = (await destination.locator('body').innerText({ timeout: 30000 }).catch(() => '')).trim();
        if (bodyText.length === 0) {
            failures.push(`${pageLabel} footer link "${link.name}" -> ${absoluteUrl} rendered an empty page`);
            return;
        }

        const errorPattern = /page not found|404 error|page you (are|were) looking for|something went wrong|internal server error|service unavailable/i;
        const errorMatch = bodyText.match(errorPattern);
        if (errorMatch) {
            failures.push(`${pageLabel} footer link "${link.name}" -> ${absoluteUrl} rendered an error page (matched "${errorMatch[0]}")`);
            return;
        }

        console.log(`${pageLabel} footer link "${link.name}" -> ${absoluteUrl} rendered content OK`);
    }

    /**
     * Clicks each internal footer link and validates the destination renders real content.
     * External links stay API-only because third party sites block automated browsers.
     */
    private async verifyDestinationsByClicking(links: FooterLink[], relaunch: () => Promise<void>, pageLabel: string, failures: string[]) {
        const visited = new Set<string>();

        for (const link of links) {
            if (!link.href || link.href === '#' || /^(javascript:|mailto:|tel:)/.test(link.href)) {
                continue;
            }

            const absoluteUrl = this.absoluteHref(link.href);
            if (!new URL(absoluteUrl).hostname.toLowerCase().endsWith('digitalmbd.net') || visited.has(absoluteUrl)) {
                continue;
            }
            visited.add(absoluteUrl);

            await relaunch();
            const anchor = await this.findVisibleFooterAnchor(absoluteUrl);
            if (!anchor) {
                failures.push(`${pageLabel} footer link "${link.name}" -> ${absoluteUrl} is not clickable (no visible anchor)`);
                continue;
            }

            const opensNewTab = link.target === '_blank';
            const popupPromise = opensNewTab
                ? this.page.context().waitForEvent('page', { timeout: 30000 }).catch(() => null)
                : Promise.resolve(null);

            try {
                await anchor.click({ timeout: 30000 });
                const popup = await popupPromise;
                const destination = popup ?? this.page;
                await this.assertDestinationContent(destination, link, absoluteUrl, failures, pageLabel);
                if (popup) {
                    await popup.close().catch(() => undefined);
                }
            }
            catch (error) {
                failures.push(`${pageLabel} footer link "${link.name}" -> ${absoluteUrl} failed on click/navigation: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }

    private async verifyFooterLinks(request: APIRequestContext, pageLabel: string, relaunch: () => Promise<void>): Promise<string> {
        try {
            const links = await this.collectFooterLinks();
            const failures: string[] = [];
            const checkedUrls = new Map<string, number>();

            for (const link of links) {
                if (!link.href || link.href === '#' || link.href.startsWith('javascript:')) {
                    failures.push(`${pageLabel} footer link "${link.name}" has no usable href (found: "${link.href}")`);
                    continue;
                }

                if (link.href.startsWith('mailto:') || link.href.startsWith('tel:')) {
                    console.log(`Skipping reachability check for "${link.name}" -> ${link.href}`);
                    continue;
                }

                const absoluteUrl = this.absoluteHref(link.href);
                this.assertEnvironmentIsCorrect(link, absoluteUrl);

                let status = checkedUrls.get(absoluteUrl);
                if (status === undefined) {
                    status = await this.checkLinkIsWorking(request, absoluteUrl);
                    checkedUrls.set(absoluteUrl, status);
                }

                if (!this.isReachableStatus(status)) {
                    failures.push(`${pageLabel} footer link "${link.name}" -> ${absoluteUrl} returned status ${status}`);
                } else {
                    console.log(`${pageLabel} footer link "${link.name}" -> ${absoluteUrl} [${status}]`);
                }
            }

            await this.verifyDestinationsByClicking(links, relaunch, pageLabel, failures);

            expect(failures, `Broken ${pageLabel} footer links:\n${failures.join('\n')}`).toHaveLength(0);
            console.log(`Successfully verified ${links.length} ${pageLabel} footer links for environment ${this.environment}`);
            return 'Passed';
        }
        catch (error) {
            console.error(`Error verifying ${pageLabel} footer links: ${error instanceof Error ? error.stack ?? error.message : String(error)}`);
            throw error;
        }
    }

    async verifyJumpstarterFooterLinks(request: APIRequestContext): Promise<string> {
        return this.verifyFooterLinks(request, 'Jumpstarter', () => this.launchJumpstarterPage());
    }

    async verifyHomePageFooterLinks(request: APIRequestContext): Promise<string> {
        return this.verifyFooterLinks(request, 'Homepage', () => this.launchHomePage());
    }
}
