import { expect, Page } from "@playwright/test";
import { acceptCookiesIfPresent, waitForSpinnerToDisappear } from "../helpers/waitHelpers";

export default class ConnectNow {
    constructor(public page: Page) {
        page.on("console", (msg) => {
            const now = new Date();
            const timestamp = now.toUTCString();
            console.log(`${timestamp} - ${msg.type().toUpperCase()} - ${msg.text()}`);
        });
    }

    private async logInfo(message: string) {
        try {
            await this.page.evaluate((msg) => console.log(msg), message);
        } catch {
            console.log(message);
        }
    }

    private async logWarn(message: string) {
        try {
            await this.page.evaluate((msg) => console.warn(msg), message);
        } catch {
            console.warn(message);
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

    async denyBrowserLocationPermission() {
        await this.logInfo('denyBrowserLocationPermission: adding geolocation denial init script');
        await this.page.addInitScript(() => {
            const deniedPositionError = {
                code: 1,
                message: "User denied Geolocation",
                PERMISSION_DENIED: 1,
                POSITION_UNAVAILABLE: 2,
                TIMEOUT: 3,
            } as GeolocationPositionError;

            Object.defineProperty(navigator, "geolocation", {
                configurable: true,
                value: {
                    getCurrentPosition: (_success: PositionCallback, error?: PositionErrorCallback) => {
                        error?.(deniedPositionError);
                    },
                    watchPosition: (_success: PositionCallback, error?: PositionErrorCallback) => {
                        error?.(deniedPositionError);
                        return 0;
                    },
                    clearWatch: () => { },
                },
            });

            if (navigator.permissions?.query) {
                const originalQuery = navigator.permissions.query.bind(navigator.permissions);
                navigator.permissions.query = (permissionDescriptor: PermissionDescriptor) => {
                    if (permissionDescriptor.name === "geolocation") {
                        return Promise.resolve({ state: "denied", name: "geolocation" } as PermissionStatus);
                    }

                    return originalQuery(permissionDescriptor);
                };
            }
        });
    }

    async launchJumpstarterStartPage() {
        await this.logInfo('launchJumpstarterStartPage: setting viewport to 1920x1080');
        this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.logInfo('launchJumpstarterStartPage: navigating to Jumpstarter secret URL');
        await this.page.goto("https://js." + process.env.environment + ".digitalmbd.net/secret/straw-serve-pound.html");
        await this.logInfo('launchJumpstarterStartPage: waiting for /start URL');
        //Accept OneTrust cookie consent if present
        await acceptCookiesIfPresent(this.page);
        await waitForSpinnerToDisappear(this.page, 10000);


        await this.page.waitForTimeout(5000);
        await this.page.waitForURL("https://js." + process.env.environment + ".digitalmbd.net/start");
        await this.logInfo('launchJumpstarterStartPage: waiting for DOM content loaded');
        await this.page.waitForLoadState("domcontentloaded");
        await this.logInfo('launchJumpstarterStartPage: waiting for spinner to disappear');
        await waitForSpinnerToDisappear(this.page, 15000);
        await this.logInfo('launchJumpstarterStartPage: verifying Connect Now header button is visible');
        await expect(this.page.getByTestId("TestId_ConnectNow_KRJ_Header_Button")).toBeVisible({ timeout: 30000 });
        await this.logInfo('launchJumpstarterStartPage: verifying current URL contains /start');
        expect(this.page.url()).toContain("/start");
    }

    async navigateToConnectNow() {
        await this.logInfo('navigateToConnectNow: verifying Connect Now header button is visible');
        await expect(this.page.getByTestId("TestId_ConnectNow_KRJ_Header_Button")).toBeVisible();
        await this.logInfo('navigateToConnectNow: clicking Connect Now header button');
        await this.page.getByTestId("TestId_ConnectNow_KRJ_Header_Button").click();
        await this.logInfo('navigateToConnectNow: waiting for designers URL');
        await this.page.waitForURL("https://home." + process.env.environment + ".digitalmbd.net/home/designers", { timeout: 30000 });
        await acceptCookiesIfPresent(this.page);
        await this.logInfo('navigateToConnectNow: verifying designers URL');
        await expect(this.page).toHaveURL("https://home." + process.env.environment + ".digitalmbd.net/home/designers");
        // verify landed on style tuner page
        await acceptCookiesIfPresent(this.page);
        await this.logInfo('navigateToConnectNow: waiting for DOM content loaded');
        await this.page.waitForLoadState("domcontentloaded");
        await this.logInfo('navigateToConnectNow: waiting for network idle');
        await this.page.waitForLoadState("networkidle");
    }

    private zipInput(zipCode?: string) {
        const base = this.page.getByPlaceholder("Detecting location\u2026").or(this.page.getByPlaceholder("e.g. 30301"));
        return zipCode ? base.or(this.page.locator(`input[value="${zipCode}"]`)) : base;
    }

    private async verifySingleDesignerRating(experience: string) {
        const rating = this.page.getByLabel(/^[1-5](?:\.\d)? out of 5 stars$/);
        await this.logInfo(`${experience}: verifying one designer rating is displayed`);
        await expect(rating).toHaveCount(1);
        await expect(rating).toBeVisible();
        await this.logInfo(`${experience}: verifying rating source text`);
        await expect(this.page.getByText("Ratings are sourced from Google and updated periodically.")).toBeVisible();
    }

    async handleUseYourLocationAlert() {
        // If the app shows a custom modal, choose "Never allow".
        const neverAllowButton = this.page.getByRole("button", { name: /never allow/i });
        await this.logInfo('handleUseYourLocationAlert: checking for Never allow button');
        const isNeverAllowVisible = await neverAllowButton.isVisible({ timeout: 3000 }).catch(() => false);
        if (isNeverAllowVisible) {
            await this.logInfo('handleUseYourLocationAlert: clicking Never allow');
            await neverAllowButton.click();
        } else {
            await this.logInfo('handleUseYourLocationAlert: Never allow button not visible');
        }
    }

    async verifyUnsupportedExperience(zipCode: string = "96815") {
        await this.logInfo('verifyUnsupportedExperience: verifying start heading is visible');
        await expect(this.page.getByRole("heading", { name: "Get started with a" })).toBeVisible();
        await this.logInfo('verifyUnsupportedExperience: verifying complimentary design heading text');
        await expect(this.page.getByRole("heading")).toContainText("Get started with a complimentary design");
        await this.logInfo(`verifyUnsupportedExperience: verifying zip input is visible for ${zipCode}`);
        await expect(this.zipInput(zipCode)).toBeVisible({ timeout: 15000 });
        await this.logInfo('verifyUnsupportedExperience: verifying Find my designer button is visible');
        await expect(this.page.getByRole("button", { name: "Find my designer" })).toBeVisible();

        await this.logInfo(`verifyUnsupportedExperience: clicking zip input for ${zipCode}`);
        await this.zipInput(zipCode).click();
        await this.logInfo(`verifyUnsupportedExperience: filling zip code ${zipCode}`);
        await this.zipInput(zipCode).fill(zipCode);

        // If a JS confirm/prompt style dialog is used, dismissing maps to deny.
        await this.logInfo('verifyUnsupportedExperience: registering dialog dismiss handler');
        this.page.once("dialog", async (dialog) => {
            console.log('verifyUnsupportedExperience: dismissing browser dialog');
            await dialog.dismiss();
        });
        await this.logInfo('verifyUnsupportedExperience: clicking Find my designer');
        await this.page.getByRole("button", { name: "Find my designer" }).click();
        const remoteDesignersUrl = "https://home." + process.env.environment + ".digitalmbd.net/home/designers/remote";
        await this.logInfo('verifyUnsupportedExperience: waiting for remote designers URL');
        await this.page.waitForURL(remoteDesignersUrl, { timeout: 30000 });
        await this.logInfo('verifyUnsupportedExperience: verifying remote designers URL');
        await expect(this.page).toHaveURL(remoteDesignersUrl);
        await this.logInfo('verifyUnsupportedExperience: handling location alert if present');
        await this.handleUseYourLocationAlert();

        await this.logInfo('verifyUnsupportedExperience: verifying unsupported area heading');
        await expect(this.page.getByRole("heading")).toContainText("We're not in your area yet.");
        await this.logInfo('verifyUnsupportedExperience: verifying Explore with Jumpstarter link');
        await expect(this.page.getByRole("link", { name: "Explore with Jumpstarter" })).toBeVisible();
    }

    async enterZipCodeAndFindDesigner(zipCode: string = "07080") {
        await this.logInfo('enterZipCodeAndFindDesigner: verifying start heading is visible');
        await expect(this.page.getByRole("heading", { name: "Get started with a" })).toBeVisible();
        await this.logInfo('enterZipCodeAndFindDesigner: verifying complimentary design heading text');
        await expect(this.page.getByRole("heading")).toContainText("Get started with a complimentary design");
        await this.logInfo(`enterZipCodeAndFindDesigner: verifying zip input is visible for ${zipCode}`);
        await expect(this.zipInput(zipCode)).toBeVisible({ timeout: 15000 });
        await this.logInfo('enterZipCodeAndFindDesigner: verifying Find my designer button is visible');
        await expect(this.page.getByRole("button", { name: "Find my designer" })).toBeVisible();
        await this.logInfo(`enterZipCodeAndFindDesigner: clicking zip input for ${zipCode}`);
        await this.zipInput(zipCode).click();
        await this.logInfo(`enterZipCodeAndFindDesigner: filling zip code ${zipCode}`);
        await this.zipInput(zipCode).fill(zipCode);
        await this.logInfo('enterZipCodeAndFindDesigner: clicking Find my designer');
        await this.page.getByRole("button", { name: "Find my designer" }).click();
    }

    async selectDealersAndContinue() {
        await this.logInfo('selectDealersAndContinue: selecting first dealer checkbox');
        await this.page.getByRole("checkbox").first().check();
        await this.logInfo('selectDealersAndContinue: selecting second dealer checkbox');
        await this.page.getByRole("checkbox").nth(1).check();
        await this.logInfo('selectDealersAndContinue: clicking Continue');
        await this.page.getByRole("button", { name: "Continue" }).click();
    }

    async fillContactInfoAndSubmit(firstName: string, lastName: string, email: string, phone: string) {
        await this.logInfo('fillContactInfoAndSubmit: clicking first name field');
        await this.page.locator("#firstName").click();
        await this.logInfo(`fillContactInfoAndSubmit: filling first name ${firstName}`);
        await this.page.locator("#firstName").fill(firstName);
        await this.logInfo('fillContactInfoAndSubmit: clicking last name field');
        await this.page.locator("#lastName").click();
        await this.logInfo(`fillContactInfoAndSubmit: filling last name ${lastName}`);
        await this.page.locator("#lastName").fill(lastName);
        await this.logInfo('fillContactInfoAndSubmit: clicking email field');
        await this.page.locator("#email").click();
        await this.logInfo(`fillContactInfoAndSubmit: filling email ${email}`);
        await this.page.locator("#email").fill(email);
        await this.logInfo('fillContactInfoAndSubmit: clicking phone field');
        await this.page.locator("#phone").click();
        await this.logInfo(`fillContactInfoAndSubmit: filling phone ${phone}`);
        await this.page.locator("#phone").fill(phone);
        await this.logInfo('fillContactInfoAndSubmit: clicking Start your design');
        await this.page.getByRole("button", { name: "Start your design" }).click();
    }

    async submitContactForm() {
        await this.logInfo('submitContactForm: verifying first name is populated');
        await expect(this.page.locator("#firstName")).not.toBeEmpty({ timeout: 10000 });
        await this.logInfo('submitContactForm: clicking Start your design');
        await this.page.getByRole("button", { name: "Start your design" }).click();
    }

    async verifyEnrolledDealerConfirmation() {
        await this.logInfo('verifyEnrolledDealerConfirmation: verifying great hands heading');
        await expect(this.page.getByRole("heading", { name: "You\u2019re in great hands" })).toBeVisible();
        await this.logInfo('verifyEnrolledDealerConfirmation: verifying designers will reach out text');
        await expect(this.page.getByText("Your designers will reach out")).toBeVisible();
        await this.logInfo('verifyEnrolledDealerConfirmation: verifying Explore with Jumpstarter link');
        await expect(this.page.getByRole("link", { name: "Explore with Jumpstarter" })).toBeVisible();
    }

    async completeIceBreakerFlow() {
        await this.logInfo('completeIceBreakerFlow: waiting for start URL');
        await this.page.waitForURL("https://js." + process.env.environment + ".digitalmbd.net/start");
        await this.logInfo('completeIceBreakerFlow: waiting for DOM content loaded');
        await this.page.waitForLoadState("domcontentloaded");
        await this.logInfo('completeIceBreakerFlow: clicking Q1 answer A1');
        await this.page.getByTestId("TestId_Icebreaker_Q1_A1").click();
        await this.logInfo('completeIceBreakerFlow: clicking Q1 next button');
        await this.page.getByTestId("TestId_Icebreaker_Q1_Next_Btn").click();
        await this.logInfo('completeIceBreakerFlow: verifying Q2 answer A1 is visible');
        await expect(this.page.getByTestId("TestId_Icebreaker_Q2_A1")).toBeVisible();

        await this.logInfo('completeIceBreakerFlow: clicking Q2 answer A1');
        await this.page.getByTestId("TestId_Icebreaker_Q2_A1").click();
        await this.logInfo('completeIceBreakerFlow: clicking Q2 next button');
        await this.page.getByTestId("TestId_Icebreaker_Q2_Next_Btn").click();
        await this.logInfo('completeIceBreakerFlow: verifying Q3 answer A1 is visible');
        await expect(this.page.getByTestId("TestId_Icebreaker_Q3_A1")).toBeVisible();

        await this.logInfo('completeIceBreakerFlow: clicking Q3 answer A1');
        await this.page.getByTestId("TestId_Icebreaker_Q3_A1").click();
        await this.logInfo('completeIceBreakerFlow: clicking Q3 next button');
        await this.page.getByTestId("TestId_Icebreaker_Q3_Next_Btn").click();
        await this.logInfo('completeIceBreakerFlow: verifying Q4 answer A4 is visible');
        await expect(this.page.getByTestId("TestId_Icebreaker_Q4_A4")).toBeVisible();

        await this.logInfo('completeIceBreakerFlow: clicking Q4 answer A4');
        await this.page.getByTestId("TestId_Icebreaker_Q4_A4").click();
        await this.logInfo('completeIceBreakerFlow: clicking Q4 next button');
        await this.page.getByTestId("TestId_Icebreaker_Q4_Next_Btn").click();
        await this.logInfo('completeIceBreakerFlow: verifying Q5 answer A1 is visible');
        await expect(this.page.getByTestId("TestId_Icebreaker_Q5_A1")).toBeVisible();

        await this.logInfo('completeIceBreakerFlow: clicking Q5 answer A1');
        await this.page.getByTestId("TestId_Icebreaker_Q5_A1").click();
        await this.logInfo('completeIceBreakerFlow: clicking Q5 next button');
        await this.page.getByTestId("TestId_Icebreaker_Q5_Next_Btn").click();
        await this.logInfo('completeIceBreakerFlow: clicking Continue next button');
        await this.page.getByTestId("TestId_Icebreaker_CONTINUE_Next_Btn").click();
        await this.logInfo('completeIceBreakerFlow: waiting for style URL');
        await this.page.waitForURL("https://js." + process.env.environment + ".digitalmbd.net/style");
        await this.logInfo('completeIceBreakerFlow: waiting for network idle');
        await this.page.waitForLoadState("networkidle");
    }

    async completeStyleFlow() {
        await this.logInfo('completeStyleFlow: verifying Start The Quiz button is visible');
        await expect(this.page.getByTestId("TestId_Style_StartTheQuiz_Btn")).toBeVisible({ timeout: 15000 });
        await this.logInfo('completeStyleFlow: clicking Start The Quiz button');
        await this.page.getByTestId("TestId_Style_StartTheQuiz_Btn").click();
        await this.logInfo('completeStyleFlow: clicking Style Quiz Q1 answer A2');
        await this.page.getByTestId("TestId_StyleQuiz_Q1_A2").click();
        await this.logInfo('completeStyleFlow: clicking Style Quiz Q2 answer A3');
        await this.page.getByTestId("TestId_StyleQuiz_Q2_A3").click();
        await this.logInfo('completeStyleFlow: clicking Style Quiz Q3 answer A3');
        await this.page.getByTestId("TestId_StyleQuiz_Q3_A3").click();
        await this.logInfo('completeStyleFlow: clicking Style Quiz Q4 answer A3');
        await this.page.getByTestId("TestId_StyleQuiz_Q4_A3").click();
        await this.logInfo('completeStyleFlow: clicking dock navigation next button');
        await this.page.getByTestId("TestId_DockNavigation_Next_Btn").click();
        await this.logInfo('completeStyleFlow: waiting for style tuner URL');
        await this.page.waitForURL("https://js." + process.env.environment + ".digitalmbd.net/style/tuner");
        await this.logInfo('completeStyleFlow: waiting for network idle');
        await this.page.waitForLoadState("networkidle");
    }

    async clickConnectNowFromStyleTuner() {
        await this.logInfo('clickConnectNowFromStyleTuner: verifying ready to get started CTA is visible');
        await expect(this.page.getByTestId("TestId_ReadyToGetStarted_CTA_Btn")).toBeVisible({ timeout: 15000 });
        await this.logInfo('clickConnectNowFromStyleTuner: clicking ready to get started CTA');
        await this.page.getByTestId("TestId_ReadyToGetStarted_CTA_Btn").click();
        await this.logInfo('clickConnectNowFromStyleTuner: waiting for designers URL');
        await this.page.waitForURL("https://home." + process.env.environment + ".digitalmbd.net/home/designers", { timeout: 30000 });
        await this.logInfo('clickConnectNowFromStyleTuner: verifying designers URL');
        await expect(this.page).toHaveURL("https://home." + process.env.environment + ".digitalmbd.net/home/designers");
        await this.logInfo('clickConnectNowFromStyleTuner: waiting for network idle');
        await this.page.waitForLoadState("networkidle");
    }

    async navigateToVisionPage() {
        await this.logInfo('navigateToVisionPage: navigating to vision page');
        await this.page.goto("https://home." + process.env.environment + ".digitalmbd.net/vision");
        await this.logInfo('navigateToVisionPage: waiting for DOM content loaded');
        await this.page.waitForLoadState("domcontentloaded");
        await this.logInfo('navigateToVisionPage: verifying Request your Design button is visible');
        await expect(this.page.getByRole("button", { name: "Request your Design" })).toBeVisible({ timeout: 60000 });
    }

    async clickConnectNowFromVisionPage() {
        await this.logInfo('clickConnectNowFromVisionPage: clicking Request your Design button');
        await this.page.getByRole("button", { name: "Request your Design" }).click();
        await this.logInfo('clickConnectNowFromVisionPage: waiting for designers URL');
        await this.page.waitForURL("https://home." + process.env.environment + ".digitalmbd.net/home/designers", { timeout: 30000 });
        await this.logInfo('clickConnectNowFromVisionPage: verifying designers URL');
        await expect(this.page).toHaveURL("https://home." + process.env.environment + ".digitalmbd.net/home/designers");
        await this.logInfo('clickConnectNowFromVisionPage: waiting for network idle');
        await this.page.waitForLoadState("networkidle");
    }

    async navigateToHomePage() {
        await this.logInfo('navigateToHomePage: navigating to home page');
        await this.page.goto("https://home." + process.env.environment + ".digitalmbd.net/");
        await this.logInfo('navigateToHomePage: waiting for DOM content loaded');
        await this.page.waitForLoadState("domcontentloaded");
        await this.logInfo('navigateToHomePage: waiting for network idle');
        await this.page.waitForLoadState("networkidle");
        await this.logInfo('navigateToHomePage: verifying Request your design link is visible');
        await expect(this.page.getByRole("link", { name: "Request your design" })).toBeVisible({ timeout: 30000 });
    }

    async clickConnectNowFromHomePage() {
        await this.logInfo('clickConnectNowFromHomePage: clicking Request your design link');
        await this.page.getByRole("link", { name: "Request your design" }).click();
        await this.logInfo('clickConnectNowFromHomePage: waiting for designers URL');
        await this.page.waitForURL("https://home." + process.env.environment + ".digitalmbd.net/home/designers", { timeout: 30000 });
        await this.logInfo('clickConnectNowFromHomePage: verifying designers URL');
        await expect(this.page).toHaveURL("https://home." + process.env.environment + ".digitalmbd.net/home/designers");
        await this.logInfo('clickConnectNowFromHomePage: waiting for network idle');
        await this.page.waitForLoadState("networkidle");
    }

    async verifyPDQDesignerExperience(zipCode: string = "28246") {
        await this.logInfo(`verifyPDQDesignerExperience: clicking zip input for ${zipCode}`);
        await this.zipInput(zipCode).click();
        await this.logInfo(`verifyPDQDesignerExperience: filling zip code ${zipCode}`);
        await this.zipInput(zipCode).fill(zipCode);
        await this.logInfo('verifyPDQDesignerExperience: clicking Find my designer');
        await this.page.getByRole("button", { name: "Find my designer" }).click();
        await this.logInfo('verifyPDQDesignerExperience: verifying PDQ Designer text');
        await expect(this.page.getByRole("main")).toContainText("PDQ Designer, LLC");
        await this.logInfo('verifyPDQDesignerExperience: verifying PDQ designer team text');
        await expect(this.page.getByRole("main")).toContainText("Your PDQ Designers: Wallie Rogerson, Brandy Rogerson, Makenna Joseph, Dani Pelletier");
        await this.logInfo('verifyPDQDesignerExperience: verifying Calendly root text');
        await expect(this.page.locator('iframe[title="Calendly Scheduling Page"]').contentFrame().locator("#root")).toContainText("Rebode consultations by PDQ Designer");
        await this.logInfo('verifyPDQDesignerExperience: clicking Select a Day heading');
        await this.page.locator('iframe[title="Calendly Scheduling Page"]').contentFrame().getByRole("heading", { name: "Select a Day" }).click();
        await this.logInfo('verifyPDQDesignerExperience: verifying Select a Day heading is visible');
        await expect(this.page.locator('iframe[title="Calendly Scheduling Page"]').contentFrame().getByRole("heading", { name: "Select a Day" })).toBeVisible();
        await this.logInfo('verifyPDQDesignerExperience: clicking What you will receive text');
        await this.page.getByText("What you\u2019ll receive").click();
    }

    async verifyICabDesignerExperience(zipCode: string = "98335") {
        await this.logInfo(`verifyICabDesignerExperience: clicking zip input for ${zipCode}`);
        await this.zipInput(zipCode).click();
        await this.logInfo(`verifyICabDesignerExperience: filling zip code ${zipCode}`);
        await this.zipInput(zipCode).fill(zipCode);
        await this.logInfo('verifyICabDesignerExperience: clicking Find my designer');
        await this.page.getByRole("button", { name: "Find my designer" }).click();
        await this.verifySingleDesignerRating('verifyICabDesignerExperience');
        await this.logInfo('verifyICabDesignerExperience: verifying design team text');
        await expect(this.page.getByText("Your design team")).toBeVisible();
        await this.logInfo('verifyICabDesignerExperience: verifying iCabinetry Direct text');
        await expect(this.page.getByRole("main")).toContainText("iCabinetry Direct");
        await this.logInfo('verifyICabDesignerExperience: verifying iCabinetry designer team text');
        await expect(this.page.getByRole("main")).toContainText("Your iCabinetry Direct Designers: Kathleen I., Tiffany N., Laura M.");
        await this.logInfo('verifyICabDesignerExperience: verifying iCab Calendly image');
        await expect(this.page.getByRole("img", { name: "icab calendly" })).toBeVisible();
        await this.logInfo('verifyICabDesignerExperience: verifying Calendly root text');
        await expect(this.page.locator('iframe[title="Calendly Scheduling Page"]').contentFrame().locator("#root")).toContainText("Rebode consultations by iCabinetry");
        await this.logInfo('verifyICabDesignerExperience: verifying Select a Day heading is visible');
        await expect(this.page.locator('iframe[title="Calendly Scheduling Page"]').contentFrame().getByRole("heading", { name: "Select a Day" })).toBeVisible();
    }

    async verifyTraVekRebodeDirectExperience(zipCode: string = "85307", firstName: string = "fname", lastName: string = "lname", email: string = "pramodrebodetest+int26travekautomationtest@gmail.com", phone: string = "(741) 258-9631") {
        await this.logInfo(`verifyTraVekRebodeDirectExperience: clicking zip input for ${zipCode}`);
        await this.zipInput(zipCode).click();
        await this.logInfo(`verifyTraVekRebodeDirectExperience: filling zip code ${zipCode}`);
        await this.zipInput(zipCode).fill(zipCode);
        await this.logInfo('verifyTraVekRebodeDirectExperience: clicking Find my designer');
        await this.page.getByRole("button", { name: "Find my designer" }).click();
        await this.verifySingleDesignerRating('verifyTraVekRebodeDirectExperience');
        await this.logInfo('verifyTraVekRebodeDirectExperience: verifying TraVek Remodeling text');
        await expect(this.page.getByRole("main")).toContainText("TraVek Remodeling");
        await this.logInfo('verifyTraVekRebodeDirectExperience: verifying design team heading');
        await expect(this.page.getByRole("heading", { name: "Connect with your design team" })).toBeVisible();
        await this.logInfo('verifyTraVekRebodeDirectExperience: clicking first name field');
        await this.page.getByRole("textbox", { name: "Enter first name" }).click();
        await this.logInfo(`verifyTraVekRebodeDirectExperience: filling first name ${firstName}`);
        await this.page.getByRole("textbox", { name: "Enter first name" }).fill(firstName);
        await this.logInfo('verifyTraVekRebodeDirectExperience: clicking last name field');
        await this.page.getByRole("textbox", { name: "Enter last name" }).click();
        await this.logInfo(`verifyTraVekRebodeDirectExperience: filling last name ${lastName}`);
        await this.page.getByRole("textbox", { name: "Enter last name" }).fill(lastName);
        await this.logInfo('verifyTraVekRebodeDirectExperience: clicking email field');
        await this.page.getByRole("textbox", { name: "hello@gmail.com" }).click();
        await this.logInfo(`verifyTraVekRebodeDirectExperience: filling email ${email}`);
        await this.page.getByRole("textbox", { name: "hello@gmail.com" }).fill(email);
        await this.logInfo('verifyTraVekRebodeDirectExperience: clicking phone field');
        await this.page.getByRole("textbox", { name: "-456-7890" }).click();
        await this.logInfo(`verifyTraVekRebodeDirectExperience: filling phone ${phone}`);
        await this.page.getByRole("textbox", { name: "-456-7890" }).fill(phone);
        await this.logInfo('verifyTraVekRebodeDirectExperience: verifying Start your design button');
        await expect(this.page.getByRole("button", { name: "Start your design" })).toBeVisible();
        await this.logInfo('verifyTraVekRebodeDirectExperience: clicking Start your design');
        await this.page.getByRole("button", { name: "Start your design" }).click();
        await this.logInfo('verifyTraVekRebodeDirectExperience: verifying great hands heading');
        await expect(this.page.getByRole("heading", { name: "You\u2019re in great hands" })).toBeVisible();
        await this.logInfo('verifyTraVekRebodeDirectExperience: verifying TraVek Remodeling confirmation text');
        await expect(this.page.getByText("TraVek Remodeling")).toBeVisible();
    }

    async clickExploreWithJumpstarter() {
        await this.logInfo('clickExploreWithJumpstarter: clicking Explore with Jumpstarter link');
        await this.page.getByRole("link", { name: "Explore with Jumpstarter" }).click();
        await this.logInfo('clickExploreWithJumpstarter: waiting for Jumpstarter URL');
        await this.page.waitForURL("https://js." + process.env.environment + ".digitalmbd.net/**", { timeout: 30000 });
        await this.logInfo('clickExploreWithJumpstarter: waiting for DOM content loaded');
        await this.page.waitForLoadState("domcontentloaded");
        await this.logInfo('clickExploreWithJumpstarter: waiting for network idle');
        await this.page.waitForLoadState("networkidle");
    }

    async smokeVerifyUnsupportedExperience(zipCode: string = "96815") {
        await this.logInfo(`smokeVerifyUnsupportedExperience: verifying zip input is visible for ${zipCode}`);
        await expect(this.zipInput(zipCode)).toBeVisible({ timeout: 15000 });
        await this.logInfo(`smokeVerifyUnsupportedExperience: filling zip code ${zipCode}`);
        await this.zipInput(zipCode).fill(zipCode);
        await this.logInfo('smokeVerifyUnsupportedExperience: registering dialog dismiss handler');
        this.page.once("dialog", async (dialog) => {
            console.log('smokeVerifyUnsupportedExperience: dismissing browser dialog');
            await dialog.dismiss();
        });
        await this.logInfo('smokeVerifyUnsupportedExperience: clicking Find my designer');
        await this.page.getByRole("button", { name: "Find my designer" }).click();
        await this.logInfo('smokeVerifyUnsupportedExperience: waiting for remote designers URL');
        await this.page.waitForURL("**/home/designers/remote", { timeout: 30000 });
        await this.logInfo('smokeVerifyUnsupportedExperience: verifying unsupported area heading');
        await expect(this.page.getByRole("heading")).toContainText("We're not in your area yet.");
        await this.logInfo('smokeVerifyUnsupportedExperience: verifying Explore with Jumpstarter link');
        await expect(this.page.getByRole("link", { name: "Explore with Jumpstarter" })).toBeVisible();
    }

    async smokeVerifyPDQExperience(zipCode: string = "28246") {
        await this.logInfo(`smokeVerifyPDQExperience: verifying zip input is visible for ${zipCode}`);
        await expect(this.zipInput(zipCode)).toBeVisible({ timeout: 25000 });
        await this.logInfo(`smokeVerifyPDQExperience: filling zip code ${zipCode}`);
        await this.zipInput(zipCode).fill(zipCode);
        await this.logInfo('smokeVerifyPDQExperience: clicking Find my designer');
        await this.page.getByRole("button", { name: "Find my designer" }).click();
        await this.logInfo('smokeVerifyPDQExperience: waiting for designer result URL');
        await this.page.waitForURL("**/home/designers/**", { timeout: 30000 });
        await this.logInfo('smokeVerifyPDQExperience: waiting for designer page DOM content');
        await this.page.waitForLoadState("domcontentloaded");

        await this.logInfo('smokeVerifyPDQExperience: verifying main heading');
        const mainHeading = this.page.locator('h1', { hasText: 'Talk with a designer for free' });
        await expect(mainHeading).toBeVisible({ timeout: 30000 });

        await this.logInfo('smokeVerifyPDQExperience: verifying hero sub text');
        const subText = this.page.locator('p', { hasText: 'See how a designer can bring your style, space, and budget together.' });
        await expect(subText).toBeVisible();

        await this.logInfo('smokeVerifyPDQExperience: verifying PDQ Designer text');
        await expect(this.page.getByRole('heading', { level: 2, name: 'PDQ Kitchen & Bath Design Services' })).toBeVisible({ timeout: 30000 });
        await expect(this.page.getByText('Trusted by homeowners throughout the Southeast for over 10 years.')).toBeVisible();

        await this.logInfo('smokeVerifyPDQExperience: verifying design team content');
        await expect(this.page.getByText('Meet your design team')).toBeVisible();
        await expect(this.page.getByText(/Your PDQ Designers: Wallie Rogerson, Brandy Rogerson, Makenna Joseph, Dani Pelletier/)).toBeVisible();

        await this.logInfo('smokeVerifyPDQExperience: verifying what you will receive section');
        await expect(this.page.getByText('What you\u2019ll receive')).toBeVisible();

        const receivedItems = [
            'A personalized review of your space, goals, and style preferences',
            'Expert guidance on cabinet styles, layouts, and design options',
            'A 3D rendering of your kitchen design',
            'A detailed project quote with transparent pricing',
        ];

        for (const item of receivedItems) {
            await this.logInfo(`smokeVerifyPDQExperience: verifying received item - ${item}`);
            await expect(this.page.getByText(item)).toBeVisible();
        }

        await this.logInfo('smokeVerifyPDQExperience: verifying contact panel heading');
        await expect(this.page.getByRole('heading', { level: 3, name: 'Let\u2019s talk about your kitchen' })).toBeVisible();

        await this.logInfo('smokeVerifyPDQExperience: verifying Calendly iframe is visible');
        await expect(this.page.getByRole('complementary').locator('iframe[title="Calendly Scheduling Page"]')).toBeVisible({ timeout: 30000 });

        await this.logInfo('smokeVerifyPDQExperience: verifying FAQ section heading');
        const faqSectionHeading = this.page.getByRole('heading', { level: 2, name: 'Common questions before you book' });
        await expect(faqSectionHeading).toBeVisible();

        const faqQuestions = [
            'What do I get with my complimentary call?',
            'Do I have to commit to anything after the call?',
            'Is this tailored to my home and budget?',
            'What if I’m unsure about certain colors or materials?',
            'Who handles the construction and installation?',
        ];

        for (const question of faqQuestions) {
            await this.logInfo(`smokeVerifyPDQExperience: verifying FAQ question - ${question}`);
            const faqLabel = this.page.locator('label', { hasText: question });
            await expect(faqLabel).toBeVisible();
        }

        await this.logInfo('smokeVerifyPDQExperience: completed PDQ smoke verification');
    }

    async smokeVerifyICabExperience(zipCode: string = "98335") {
        await this.logInfo(`smokeVerifyICabExperience: verifying zip input is visible for ${zipCode}`);
        await expect(this.zipInput(zipCode)).toBeVisible({ timeout: 25000 });
        await this.logInfo(`smokeVerifyICabExperience: filling zip code ${zipCode}`);
        await this.zipInput(zipCode).fill(zipCode);
        await this.logInfo('smokeVerifyICabExperience: clicking Find my designer');
        await this.page.getByRole("button", { name: "Find my designer" }).click();
        await this.logInfo('smokeVerifyICabExperience: waiting for designer result URL');
        await this.page.waitForURL("**/home/designers/**", { timeout: 30000 });
        await this.logInfo('smokeVerifyICabExperience: waiting for designer page DOM content');
        await this.page.waitForLoadState("domcontentloaded");
        // Main heading
        await this.logInfo('smokeVerifyICabExperience: verifying main heading');
        const mainHeading = this.page.locator('h1', { hasText: 'Talk with a designer for free' });
        await expect(mainHeading).toBeVisible({ timeout: 30000 });

        // Sub text under heading
        await this.logInfo('smokeVerifyICabExperience: verifying hero sub text');
        const subText = this.page.locator('p', { hasText: 'See how a designer can bring your style, space, and budget together.' });
        await expect(subText).toBeVisible();

        await this.logInfo('smokeVerifyICabExperience: verifying design team content');
        await expect(this.page.getByText('Meet your design team')).toBeVisible();
        await expect(this.page.getByText(/Your iCabinetry Direct Designers: Keith L\., Kathleen I\., Tiffany N\., Laura M\./)).toBeVisible();
        await this.logInfo('smokeVerifyICabExperience: verifying what you will receive section');
        await expect(this.page.getByText('What you\u2019ll receive')).toBeVisible();

        const receivedItems = [
            'A personalized review of your space, goals, and style preferences',
            'Expert guidance on cabinet styles, layouts, and design options',
            'A 3D rendering of your kitchen design',
            'A detailed project quote with transparent pricing',
        ];

        for (const item of receivedItems) {
            await this.logInfo(`smokeVerifyICabExperience: verifying received item - ${item}`);
            await expect(this.page.getByText(item)).toBeVisible();
        }

        await this.logInfo('smokeVerifyICabExperience: verifying contact panel heading');
        await expect(this.page.getByRole('heading', { level: 3, name: 'Let\u2019s talk about your kitchen' })).toBeVisible();

        // FAQ section heading
        await this.logInfo('smokeVerifyICabExperience: verifying FAQ section heading');
        const faqSectionHeading = this.page.getByRole('heading', { level: 2, name: 'Common questions before you book' });
        await expect(faqSectionHeading).toBeVisible();

        // FAQ list items - question labels
        const faqQuestions = [
            'What do I get with my complimentary call?',
            'Do I have to commit to anything after the call?',
            'Is this tailored to my home and budget?',
            'What if I’m unsure about certain colors or materials?',
            'Who handles the construction and installation?',
        ];

        for (const question of faqQuestions) {
            await this.logInfo(`smokeVerifyICabExperience: verifying FAQ question - ${question}`);
            const faqLabel = this.page.locator('label', { hasText: question });
            await expect(faqLabel).toBeVisible();
        }

        // FAQ answers (only the first one is expanded/checked by default per the HTML - "checked" attribute)
        await this.logInfo('smokeVerifyICabExperience: verifying first FAQ answer');
        const firstFaqAnswer = this.page.locator('#faq-_r_0_-faq-1-panel p', {
            hasText: 'You’ll review your space and goals with your designer, followed by a 3D design reveal to refine details and discuss a budget range. You’ll receive a design summary and if you decide to proceed, we can order and ship the cabinets direct to you.',
        });
        await expect(firstFaqAnswer).toBeVisible();
        await this.logInfo('smokeVerifyICabExperience: completed iCab smoke verification');
    }

    async smokeVerifyTraVekExperience(zipCode: string = "85307") {
        await this.logInfo(`smokeVerifyTraVekExperience: verifying zip input is visible for ${zipCode}`);
        await expect(this.zipInput(zipCode)).toBeVisible({ timeout: 25000 });
        await this.logInfo(`smokeVerifyTraVekExperience: filling zip code ${zipCode}`);
        await this.zipInput(zipCode).fill(zipCode);
        await this.logInfo('smokeVerifyTraVekExperience: clicking Find my designer');
        await this.page.getByRole("button", { name: "Find my designer" }).click();
        await this.logInfo('smokeVerifyTraVekExperience: waiting for designer result URL');
        await this.page.waitForURL("**/home/designers/**", { timeout: 30000 });
        await this.logInfo('smokeVerifyTraVekExperience: waiting for designer page DOM content');
        await this.page.waitForLoadState("domcontentloaded");

        await this.logInfo('smokeVerifyTraVekExperience: verifying main heading');
        const mainHeading = this.page.locator('h1', { hasText: 'Talk with a designer for free' });
        await expect(mainHeading).toBeVisible({ timeout: 30000 });

        await this.logInfo('smokeVerifyTraVekExperience: verifying hero sub text');
        const subText = this.page.locator('p', { hasText: 'See how a designer can bring your style, space, and budget together.' });
        await expect(subText).toBeVisible();

        await this.logInfo('smokeVerifyTraVekExperience: verifying TraVek Remodeling text');
        await expect(this.page.getByRole('heading', { level: 2, name: 'TraVek Remodeling' })).toBeVisible({ timeout: 30000 });
        await expect(this.page.getByText('For over 20 years, TraVek has been the leading source for beautiful bathroom remodeling, kitchen remodeling, and whole home transformations in the Greater Phoenix Valley.')).toBeVisible();

        await this.logInfo('smokeVerifyTraVekExperience: verifying design team content');
        await expect(this.page.getByText('Meet your design team')).toBeVisible();
        await expect(this.page.getByText(/Your TraVek Designers: Don, Catherine, Jacque, Trevor, Noah, Courtney, Shelica/)).toBeVisible();

        await this.logInfo('smokeVerifyTraVekExperience: verifying what you will receive section');
        await expect(this.page.getByText('What you\u2019ll receive')).toBeVisible();

        const receivedItems = [
            'A personalized review of your space, goals, and style preferences',
            'Expert guidance on cabinetry and other materials, layouts, and storage options',
            'A realistic budget based on your wants and needs',
            'A customized remodel plan for your new kitchen',
        ];

        for (const item of receivedItems) {
            await this.logInfo(`smokeVerifyTraVekExperience: verifying received item - ${item}`);
            await expect(this.page.getByText(item)).toBeVisible();
        }

        await this.logInfo('smokeVerifyTraVekExperience: verifying contact panel heading');
        await expect(this.page.getByRole('heading', { level: 3, name: 'Let\u2019s talk about your kitchen' })).toBeVisible();
        await this.logInfo('smokeVerifyTraVekExperience: verifying Connect with TraVek button');
        await expect(this.page.getByRole('button', { name: 'Connect with TraVek' })).toBeVisible();

        await this.logInfo('smokeVerifyTraVekExperience: verifying FAQ section heading');
        const faqSectionHeading = this.page.getByRole('heading', { level: 2, name: 'Common questions before you book' });
        await expect(faqSectionHeading).toBeVisible();

        const faqQuestions = [
            'What happens when I connect with TraVek?',
            'Do I have to commit to anything after the consultation?',
            'Is this tailored to my home and budget?',
            'What if I’m unsure about certain colors or materials?',
            'Who handles the construction and installation?',
        ];

        for (const question of faqQuestions) {
            await this.logInfo(`smokeVerifyTraVekExperience: verifying FAQ question - ${question}`);
            const faqLabel = this.page.locator('label', { hasText: question });
            await expect(faqLabel).toBeVisible();
        }

        await this.logInfo('smokeVerifyTraVekExperience: completed TraVek smoke verification');
    }

    async smokeVerifyEnrolledDealerExperience(zipCode: string = "07080") {
        await this.logInfo(`smokeVerifyEnrolledDealerExperience: verifying zip input is visible for ${zipCode}`);
        await expect(this.zipInput(zipCode)).toBeVisible({ timeout: 15000 });
        await this.logInfo(`smokeVerifyEnrolledDealerExperience: filling zip code ${zipCode}`);
        await this.zipInput(zipCode).fill(zipCode);
        await this.logInfo('smokeVerifyEnrolledDealerExperience: clicking Find my designer');
        await this.page.getByRole("button", { name: "Find my designer" }).click();
        await this.logInfo('smokeVerifyEnrolledDealerExperience: waiting for enrolled dealer results heading');
        await expect(this.page.getByRole("heading", { name: "Your dream kitchen begins here" })).toBeVisible({ timeout: 30000 });
        await this.logInfo('smokeVerifyEnrolledDealerExperience: verifying first enrolled dealer is visible');
        await expect(this.page.getByRole("heading", { name: "Tewksbury Kitchens & Baths Div Of Huston Lumber" })).toBeVisible();
        await this.logInfo('smokeVerifyEnrolledDealerExperience: verifying first dealer checkbox is visible');
        await expect(this.page.getByRole("checkbox").first()).toBeVisible({ timeout: 15000 });
        await this.logInfo('smokeVerifyEnrolledDealerExperience: selecting first dealer checkbox');
        await this.page.getByRole("checkbox").first().check();
        await this.logInfo('smokeVerifyEnrolledDealerExperience: verifying selected dealer checkbox is checked');
        await expect(this.page.getByRole("checkbox").first()).toBeChecked();
    }

    async verifyAutoSharedDealersOnConsolidatedProfile() {
        await this.logInfo('verifyAutoSharedDealersOnConsolidatedProfile: navigating to consolidated profile overview');
        await this.page.goto("https://js." + process.env.environment + ".digitalmbd.net/remodel/profile/overview");
        await this.logInfo('verifyAutoSharedDealersOnConsolidatedProfile: waiting for DOM content loaded');
        await this.page.waitForLoadState("domcontentloaded");
        await this.logInfo('verifyAutoSharedDealersOnConsolidatedProfile: waiting for network idle');
        await this.page.waitForLoadState("networkidle");
        await this.logInfo('verifyAutoSharedDealersOnConsolidatedProfile: verifying profile overview ready text');
        await expect(this.page.getByText(/You\u2019re ready for the next/)).toBeVisible({ timeout: 30000 });
        await this.logInfo('verifyAutoSharedDealersOnConsolidatedProfile: verifying tewksbury dealer in list');
        await expect(this.page.getByRole("list")).toContainText("tewksbury kitchens & baths");
        await this.logInfo('verifyAutoSharedDealersOnConsolidatedProfile: verifying builders general dealer in list');
        await expect(this.page.getByRole("list")).toContainText("builders general supply co");
        await this.logInfo('verifyAutoSharedDealersOnConsolidatedProfile: verifying Pros will reach out text');
        await expect(this.page.getByRole("list")).toContainText("Pros will reach out");
    }

    async verifyManualShareOfNonAutoSharedDealer() {
        await this.logInfo('verifyManualShareOfNonAutoSharedDealer: verifying Monk design studio is visible');
        await expect(this.page.getByText(/monk.s design studio/i)).toBeVisible({ timeout: 15000 });
        await this.logInfo('verifyManualShareOfNonAutoSharedDealer: clicking Monk design studio');
        await this.page.getByText(/monk.s design studio/i).click();
        await this.logInfo('verifyManualShareOfNonAutoSharedDealer: verifying share profile button is visible');
        await expect(this.page.getByTestId("TestId_ProfileOverview_DealerLocatorList_Item3_ShareProfile_Btn")).toBeVisible();
        await this.logInfo('verifyManualShareOfNonAutoSharedDealer: clicking share profile button');
        await this.page.getByTestId("TestId_ProfileOverview_DealerLocatorList_Item3_ShareProfile_Btn").click();
        await this.logInfo('verifyManualShareOfNonAutoSharedDealer: verifying shared profile image is visible');
        await expect(this.page.getByRole("img", { name: "Your profile has been shared" })).toBeVisible({ timeout: 15000 });
        await this.logInfo('verifyManualShareOfNonAutoSharedDealer: verifying Continue button is visible');
        await expect(this.page.getByRole("button", { name: "Continue" })).toBeVisible();
        await this.logInfo('verifyManualShareOfNonAutoSharedDealer: clicking Continue button');
        await this.page.getByRole("button", { name: "Continue" }).click();
        await this.logInfo('verifyManualShareOfNonAutoSharedDealer: verifying third dealer status span is visible');
        await expect(this.page.getByRole("listitem").filter({ hasText: /3\.monk.s design studio/ }).locator("span")).toBeVisible({ timeout: 15000 });
    }

    async verifyUnsupportedExperienceForSignedInUser(signedInZip: string, unsupportedZip: string = "96815") {
        await this.logInfo('verifyUnsupportedExperienceForSignedInUser: verifying start heading is visible');
        await expect(this.page.getByRole("heading", { name: "Get started with a" })).toBeVisible();
        await this.logInfo('verifyUnsupportedExperienceForSignedInUser: verifying complimentary design heading text');
        await expect(this.page.getByRole("heading")).toContainText("Get started with a complimentary design");
        await this.logInfo(`verifyUnsupportedExperienceForSignedInUser: verifying signed-in zip input is visible for ${signedInZip}`);
        await expect(this.zipInput(signedInZip)).toBeVisible({ timeout: 15000 });
        await this.logInfo(`verifyUnsupportedExperienceForSignedInUser: clicking signed-in zip input for ${signedInZip}`);
        await this.zipInput(signedInZip).click();
        await this.logInfo(`verifyUnsupportedExperienceForSignedInUser: filling unsupported zip code ${unsupportedZip}`);
        await this.zipInput(signedInZip).fill(unsupportedZip);
        await this.logInfo('verifyUnsupportedExperienceForSignedInUser: registering dialog dismiss handler');
        this.page.once("dialog", async (dialog) => {
            console.log('verifyUnsupportedExperienceForSignedInUser: dismissing browser dialog');
            await dialog.dismiss();
        });
        await this.logInfo('verifyUnsupportedExperienceForSignedInUser: clicking Find my designer');
        await this.page.getByRole("button", { name: "Find my designer" }).click();
        const remoteDesignersUrl = "https://home." + process.env.environment + ".digitalmbd.net/home/designers/remote";
        await this.logInfo('verifyUnsupportedExperienceForSignedInUser: waiting for remote designers URL');
        await this.page.waitForURL(remoteDesignersUrl, { timeout: 30000 });
        await this.logInfo('verifyUnsupportedExperienceForSignedInUser: verifying remote designers URL');
        await expect(this.page).toHaveURL(remoteDesignersUrl);
        await this.logInfo('verifyUnsupportedExperienceForSignedInUser: handling location alert if present');
        await this.handleUseYourLocationAlert();
        await this.logInfo('verifyUnsupportedExperienceForSignedInUser: verifying unsupported area heading');
        await expect(this.page.getByRole("heading")).toContainText("We're not in your area yet.");
        await this.logInfo('verifyUnsupportedExperienceForSignedInUser: verifying Explore with Jumpstarter link');
        await expect(this.page.getByRole("link", { name: "Explore with Jumpstarter" })).toBeVisible();
    }

    async verifyNoAutoSharedDealersOnConsolidatedProfile() {
        await this.logInfo('verifyNoAutoSharedDealersOnConsolidatedProfile: navigating to consolidated profile overview');
        await this.page.goto("https://js." + process.env.environment + ".digitalmbd.net/remodel/profile/overview");
        await this.logInfo('verifyNoAutoSharedDealersOnConsolidatedProfile: waiting for DOM content loaded');
        await this.page.waitForLoadState("domcontentloaded");
        await this.logInfo('verifyNoAutoSharedDealersOnConsolidatedProfile: waiting for network idle');
        await this.page.waitForLoadState("networkidle");
        await this.logInfo('verifyNoAutoSharedDealersOnConsolidatedProfile: verifying profile overview ready text');
        await expect(this.page.getByText(/You\u2019re ready for the next/)).toBeVisible({ timeout: 30000 });
        await this.logInfo('verifyNoAutoSharedDealersOnConsolidatedProfile: verifying Pros will reach out text is absent');
        await expect(this.page.getByRole("list")).not.toContainText("Pros will reach out");
    }

    async verifyFirstDealerIsAutoSharedOnConsolidatedProfile() {
        await this.logInfo('verifyFirstDealerIsAutoSharedOnConsolidatedProfile: navigating to consolidated profile overview');
        await this.page.goto("https://js." + process.env.environment + ".digitalmbd.net/remodel/profile/overview");
        await this.logInfo('verifyFirstDealerIsAutoSharedOnConsolidatedProfile: waiting for DOM content loaded');
        await this.page.waitForLoadState("domcontentloaded");
        await this.logInfo('verifyFirstDealerIsAutoSharedOnConsolidatedProfile: waiting for network idle');
        await this.page.waitForLoadState("networkidle");
        await this.logInfo('verifyFirstDealerIsAutoSharedOnConsolidatedProfile: verifying profile overview ready text');
        await expect(this.page.getByText(/You\u2019re ready for the next/)).toBeVisible({ timeout: 30000 });
        await this.logInfo('verifyFirstDealerIsAutoSharedOnConsolidatedProfile: verifying first dealer status span is visible');
        await expect(this.page.getByRole("listitem").first().locator("span")).toBeVisible({ timeout: 15000 });
        await this.logInfo('verifyFirstDealerIsAutoSharedOnConsolidatedProfile: verifying Pros will reach out text');
        await expect(this.page.getByRole("list")).toContainText("Pros will reach out");
    }

    async shareFirstDealerManually() {
        await this.logInfo('shareFirstDealerManually: verifying first dealer list item is visible');
        await expect(this.page.getByRole("listitem").first()).toBeVisible({ timeout: 15000 });
        await this.logInfo('shareFirstDealerManually: clicking first dealer list item');
        await this.page.getByRole("listitem").first().click();
        await this.logInfo('shareFirstDealerManually: verifying first dealer share profile button is visible');
        await expect(this.page.getByTestId("TestId_ProfileOverview_DealerLocatorList_Item1_ShareProfile_Btn")).toBeVisible({ timeout: 10000 });
        await this.logInfo('shareFirstDealerManually: clicking first dealer share profile button');
        await this.page.getByTestId("TestId_ProfileOverview_DealerLocatorList_Item1_ShareProfile_Btn").click();
        await this.logInfo('shareFirstDealerManually: verifying shared profile image is visible');
        await expect(this.page.getByRole("img", { name: "Your profile has been shared" })).toBeVisible({ timeout: 15000 });
        await this.logInfo('shareFirstDealerManually: verifying Continue button is visible');
        await expect(this.page.getByRole("button", { name: "Continue" })).toBeVisible();
        await this.logInfo('shareFirstDealerManually: clicking Continue button');
        await this.page.getByRole("button", { name: "Continue" }).click();
        await this.logInfo('shareFirstDealerManually: verifying first dealer status span is visible');
        await expect(this.page.getByRole("listitem").first().locator("span")).toBeVisible({ timeout: 15000 });
    }

    async shareSecondDealerManually() {
        await this.logInfo('shareSecondDealerManually: verifying second dealer list item is visible');
        await expect(this.page.getByRole("listitem").nth(1)).toBeVisible({ timeout: 15000 });
        await this.logInfo('shareSecondDealerManually: clicking second dealer list item');
        await this.page.getByRole("listitem").nth(1).click();
        await this.logInfo('shareSecondDealerManually: verifying second dealer share profile button is visible');
        await expect(this.page.getByTestId("TestId_ProfileOverview_DealerLocatorList_Item2_ShareProfile_Btn")).toBeVisible({ timeout: 10000 });
        await this.logInfo('shareSecondDealerManually: clicking second dealer share profile button');
        await this.page.getByTestId("TestId_ProfileOverview_DealerLocatorList_Item2_ShareProfile_Btn").click();
        await this.logInfo('shareSecondDealerManually: verifying shared profile image is visible');
        await expect(this.page.getByRole("img", { name: "Your profile has been shared" })).toBeVisible({ timeout: 15000 });
        await this.logInfo('shareSecondDealerManually: verifying Continue button is visible');
        await expect(this.page.getByRole("button", { name: "Continue" })).toBeVisible();
        await this.logInfo('shareSecondDealerManually: clicking Continue button');
        await this.page.getByRole("button", { name: "Continue" }).click();
        await this.logInfo('shareSecondDealerManually: verifying second dealer status span is visible');
        await expect(this.page.getByRole("listitem").nth(1).locator("span")).toBeVisible({ timeout: 15000 });
    }
}
