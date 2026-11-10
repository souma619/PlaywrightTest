import { test, expect } from "@playwright/test";
import ConnectNow from "../../ui_pages/ConnectNow";
import SmokePage from "../../ui_pages/SmokePage.ts";
import AuthHelper from "../../helpers/api-helpers";

test.describe("Connect Now", () => {
    test("Connect Now - Verify unsupported experience", async ({ page }) => {
        test.setTimeout(90000);

        const connectNow = new ConnectNow(page);
        await connectNow.launchJumpstarterStartPage();
        await connectNow.navigateToConnectNow();
        await connectNow.verifyUnsupportedExperience("96815");
    });

    test("Connect Now - Verify enrolled dealer experience", async ({ page }) => {
        test.setTimeout(90000);

        const connectNow = new ConnectNow(page);
        await connectNow.launchJumpstarterStartPage();
        await connectNow.navigateToConnectNow();
        await connectNow.enterZipCodeAndFindDesigner("07080");
        await connectNow.selectDealersAndContinue();
        await connectNow.fillContactInfoAndSubmit(
            "Pramod",
            "ManualShareViaAuto",
            "pramodrebodetest+manualshareviaauto@gmail.com",
            "(741) 258-9630"
        );
        await connectNow.verifyEnrolledDealerConfirmation();
    });

    test("Connect Now - Verify PDQ designer experience", async ({ page }) => {
        test.setTimeout(90000);

        const connectNow = new ConnectNow(page);
        await connectNow.launchJumpstarterStartPage();
        await connectNow.navigateToConnectNow();
        await connectNow.verifyPDQDesignerExperience("28246");
    });

    test("Connect Now - Verify iCab online dealer experience", async ({ page }) => {
        test.setTimeout(90000);

        const connectNow = new ConnectNow(page);
        await connectNow.launchJumpstarterStartPage();
        await connectNow.navigateToConnectNow();
        await connectNow.verifyICabDesignerExperience("98335");
    });

    test("Connect Now - Verify TraVek Rebode direct experience", async ({ page }) => {
        test.setTimeout(90000);

        const connectNow = new ConnectNow(page);
        await connectNow.launchJumpstarterStartPage();
        await connectNow.navigateToConnectNow();
        await connectNow.verifyTraVekRebodeDirectExperience(
            "85307",
            "fname",
            "lname",
            "pramodrebodetest+int26travekautomationtest@gmail.com",
            "(741) 258-9631"
        );
    });

    test("Style Tuner ingress - Verify PDQ designer experience", async ({ page }) => {
        test.setTimeout(180000);

        const connectNow = new ConnectNow(page);
        await connectNow.launchJumpstarterStartPage();
        await connectNow.completeIceBreakerFlow();
        await connectNow.completeStyleFlow();
        await connectNow.clickConnectNowFromStyleTuner();
        await connectNow.verifyPDQDesignerExperience("28246");
    });

    test("Style Tuner ingress - Verify iCab online dealer experience", async ({ page }) => {
        test.setTimeout(180000);

        const connectNow = new ConnectNow(page);
        await connectNow.launchJumpstarterStartPage();
        await connectNow.completeIceBreakerFlow();
        await connectNow.completeStyleFlow();
        await connectNow.clickConnectNowFromStyleTuner();
        await connectNow.verifyICabDesignerExperience("98335");
    });

    test("Style Tuner ingress - Verify TraVek Rebode direct experience", async ({ page }) => {
        test.setTimeout(180000);

        const connectNow = new ConnectNow(page);
        await connectNow.launchJumpstarterStartPage();
        await connectNow.completeIceBreakerFlow();
        await connectNow.completeStyleFlow();
        await connectNow.clickConnectNowFromStyleTuner();
        await connectNow.verifyTraVekRebodeDirectExperience(
            "85307",
            "fname",
            "lname",
            "pramodrebodetest+int26travekautomationtest@gmail.com",
            "(741) 258-9631"
        );
    });

    test("Style Tuner ingress - Verify unsupported experience", async ({ page }) => {
        test.setTimeout(180000);

        const connectNow = new ConnectNow(page);
        await connectNow.launchJumpstarterStartPage();
        await connectNow.completeIceBreakerFlow();
        await connectNow.completeStyleFlow();
        await connectNow.clickConnectNowFromStyleTuner();
        await connectNow.verifyUnsupportedExperience("96815");
    });

    test("Style Tuner ingress - Verify enrolled dealer experience", async ({ page }) => {
        test.setTimeout(180000);

        const connectNow = new ConnectNow(page);
        await connectNow.launchJumpstarterStartPage();
        await connectNow.completeIceBreakerFlow();
        await connectNow.completeStyleFlow();
        await connectNow.clickConnectNowFromStyleTuner();
        await connectNow.enterZipCodeAndFindDesigner("07080");
        await connectNow.selectDealersAndContinue();
        await connectNow.fillContactInfoAndSubmit(
            "Pramod",
            "ManualShareViaAuto",
            "pramodrebodetest+manualshareviaauto@gmail.com",
            "(741) 258-9630"
        );
        await connectNow.verifyEnrolledDealerConfirmation();
    });

    test("Vision ingress - Verify PDQ designer experience", async ({ page }) => {
        test.setTimeout(180000);

        const connectNow = new ConnectNow(page);
        await connectNow.launchJumpstarterStartPage();
        await connectNow.navigateToVisionPage();
        await connectNow.clickConnectNowFromVisionPage();
        await connectNow.verifyPDQDesignerExperience("28246");
    });

    test("Vision ingress - Verify iCab online dealer experience", async ({ page }) => {
        test.setTimeout(180000);

        const connectNow = new ConnectNow(page);
        await connectNow.launchJumpstarterStartPage();
        await connectNow.navigateToVisionPage();
        await connectNow.clickConnectNowFromVisionPage();
        await connectNow.verifyICabDesignerExperience("98335");
    });

    test("Vision ingress - Verify TraVek Rebode direct experience", async ({ page }) => {
        test.setTimeout(180000);

        const connectNow = new ConnectNow(page);
        await connectNow.launchJumpstarterStartPage();
        await connectNow.navigateToVisionPage();
        await connectNow.clickConnectNowFromVisionPage();
        await connectNow.verifyTraVekRebodeDirectExperience(
            "85307",
            "fname",
            "lname",
            "pramodrebodetest+int26travekautomationtest@gmail.com",
            "(741) 258-9631"
        );
    });

    test("Vision ingress - Verify unsupported experience", async ({ page }) => {
        test.setTimeout(180000);

        const connectNow = new ConnectNow(page);
        await connectNow.launchJumpstarterStartPage();
        await connectNow.navigateToVisionPage();
        await connectNow.clickConnectNowFromVisionPage();
        await connectNow.verifyUnsupportedExperience("96815");
    });

    test("Vision ingress - Verify enrolled dealer experience", async ({ page }) => {
        test.setTimeout(180000);

        const connectNow = new ConnectNow(page);
        await connectNow.launchJumpstarterStartPage();
        await connectNow.navigateToVisionPage();
        await connectNow.clickConnectNowFromVisionPage();
        await connectNow.enterZipCodeAndFindDesigner("07080");
        await connectNow.selectDealersAndContinue();
        await connectNow.fillContactInfoAndSubmit(
            "Pramod",
            "ManualShareViaAuto",
            "pramodrebodetest+manualshareviaauto@gmail.com",
            "(741) 258-9630"
        );
        await connectNow.verifyEnrolledDealerConfirmation();
    });

    test("Home page ingress - Verify PDQ designer experience", async ({ page }) => {
        test.setTimeout(180000);

        const connectNow = new ConnectNow(page);
        await connectNow.launchJumpstarterStartPage();
        await connectNow.navigateToHomePage();
        await connectNow.clickConnectNowFromHomePage();
        await connectNow.verifyPDQDesignerExperience("28246");
    });

    test("Home page ingress - Verify iCab online dealer experience", async ({ page }) => {
        test.setTimeout(180000);

        const connectNow = new ConnectNow(page);
        await connectNow.launchJumpstarterStartPage();
        await connectNow.navigateToHomePage();
        await connectNow.clickConnectNowFromHomePage();
        await connectNow.verifyICabDesignerExperience("98335");
    });

    test("Home page ingress - Verify TraVek Rebode direct experience", async ({ page }) => {
        test.setTimeout(180000);

        const connectNow = new ConnectNow(page);
        await connectNow.launchJumpstarterStartPage();
        await connectNow.navigateToHomePage();
        await connectNow.clickConnectNowFromHomePage();
        await connectNow.verifyTraVekRebodeDirectExperience(
            "85307",
            "fname",
            "lname",
            "pramodrebodetest+int26travekautomationtest@gmail.com",
            "(741) 258-9631"
        );
    });

    test("Home page ingress - Verify unsupported experience", async ({ page }) => {
        test.setTimeout(180000);

        const connectNow = new ConnectNow(page);
        await connectNow.launchJumpstarterStartPage();
        await connectNow.navigateToHomePage();
        await connectNow.clickConnectNowFromHomePage();
        await connectNow.verifyUnsupportedExperience("96815");
    });

    test("Home page ingress - Verify enrolled dealer experience", async ({ page }) => {
        test.setTimeout(180000);

        const connectNow = new ConnectNow(page);
        await connectNow.launchJumpstarterStartPage();
        await connectNow.navigateToHomePage();
        await connectNow.clickConnectNowFromHomePage();
        await connectNow.enterZipCodeAndFindDesigner("07080");
        await connectNow.selectDealersAndContinue();
        await connectNow.fillContactInfoAndSubmit(
            "Pramod",
            "ManualShareViaAuto",
            "pramodrebodetest+manualshareviaauto@gmail.com",
            "(741) 258-9630"
        );
        await connectNow.verifyEnrolledDealerConfirmation();
    });

    test("Connect Now - Sign in, enrolled dealer, explore with Jumpstarter, complete full flow", async ({ page, request }) => {
        test.setTimeout(300000);

        // Sign in with existing account and reset project state
        const smokePage = new SmokePage(page);
        const authHelper = new AuthHelper(request);
        await smokePage.launchHomePage();
        const projectID = await smokePage.getProjectID();
        console.log("New ProjectID :" + projectID);
        await smokePage.captureUserDetailsID();
        const { status, email } = await smokePage.verifySignInExistingAccount("07080");
        const { projectId: oldProjectID, userId: oldUserID } = await smokePage.getProjectOldID();
        console.log("Old ProjectID :" + oldProjectID);
        console.log("Old UserID :" + oldUserID);
        await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
        await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);

        // Connect Now flow from home page
        const connectNow = new ConnectNow(page);
        await connectNow.navigateToHomePage();
        await connectNow.clickConnectNowFromHomePage();
        await connectNow.enterZipCodeAndFindDesigner("07080");
        await connectNow.selectDealersAndContinue();
        await connectNow.submitContactForm();
        await connectNow.verifyEnrolledDealerConfirmation();
        await connectNow.clickExploreWithJumpstarter();

        // Complete full Jumpstarter flows
        await smokePage.completeIceBreakerFlow();
        await smokePage.completeStyleFlow();
        await smokePage.completeDesignFlow();
        await smokePage.completeBudgetFlow('Premium');

        // Verify auto-shared dealers on consolidated profile
        await connectNow.verifyAutoSharedDealersOnConsolidatedProfile();

        // Select a non-auto-shared dealer and manually share profile
        await connectNow.verifyManualShareOfNonAutoSharedDealer();

        // Cleanup
        await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
        await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
    });

    test("Connect Now - Sign in, unsupported zip, explore with Jumpstarter, verify auto-shared dealer and manual share second dealer", async ({ page, request }) => {
        test.setTimeout(300000);

        // Sign in with existing account and reset project state
        const smokePage = new SmokePage(page);
        const authHelper = new AuthHelper(request);
        await smokePage.launchHomePage();
        const projectID = await smokePage.getProjectID();
        console.log("New ProjectID :" + projectID);
        await smokePage.captureUserDetailsID();
        const { status, email } = await smokePage.verifySignInExistingAccount("07080");
        const { projectId: oldProjectID, userId: oldUserID } = await smokePage.getProjectOldID();
        console.log("Old ProjectID :" + oldProjectID);
        console.log("Old UserID :" + oldUserID);
        await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
        await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);

        // Connect Now - unsupported zip (input is auto-populated with sign-in zip "07080")
        const connectNow = new ConnectNow(page);
        await connectNow.navigateToHomePage();
        await connectNow.clickConnectNowFromHomePage();
        await connectNow.verifyUnsupportedExperienceForSignedInUser("07080", "96815");
        await connectNow.clickExploreWithJumpstarter();

        // Complete full Jumpstarter flows
        await smokePage.completeIceBreakerFlow();
        await smokePage.completeStyleFlow();
        await smokePage.completeDesignFlow();
        await smokePage.completeBudgetFlow('Premium');

        // Verify first dealer is already auto-shared (platform shares dealer 1 for sign-in zip 07080)
        await connectNow.verifyFirstDealerIsAutoSharedOnConsolidatedProfile();

        // Manually share the second dealer
        await connectNow.shareSecondDealerManually();

        // Cleanup
        await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
        await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
    });

    test("Connect Now - Anonymous enrolled dealer, explore with Jumpstarter, sign in and verify lead on profile", async ({ page, request }) => {
        test.setTimeout(300000);

        const connectNow = new ConnectNow(page);
        const smokePage = new SmokePage(page);
        const authHelper = new AuthHelper(request);

        // Launch anonymously and click Connect Now from icebreaker header button
        await connectNow.launchJumpstarterStartPage();
        await connectNow.navigateToConnectNow();

        // Manual share zip 07080 — fill form with the same email used by the existing test account
        const testEmail = `soumabha.bhandari.mbd01+${process.env.environment}automation@gmail.com`;
        await connectNow.enterZipCodeAndFindDesigner("07080");
        await connectNow.selectDealersAndContinue();
        await connectNow.fillContactInfoAndSubmit("Pramod", "ConnectNowAnon", testEmail, "(741) 258-9630");
        await connectNow.verifyEnrolledDealerConfirmation();
        await connectNow.clickExploreWithJumpstarter();

        // Sign in with the same account email used in the Connect Now form
        await smokePage.captureUserDetailsID();
        const { status, email } = await smokePage.verifySignInExistingAccount("07080");
        const { projectId: oldProjectID, userId: oldUserID } = await smokePage.getProjectOldID();
        console.log("Old ProjectID :" + oldProjectID);
        console.log("Old UserID :" + oldUserID);
        await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
        await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);

        // Complete full Jumpstarter flows
        await smokePage.completeIceBreakerFlow();
        await smokePage.completeStyleFlow();
        await smokePage.completeDesignFlow();
        await smokePage.completeBudgetFlow('Premium');

        // Verify lead shared on consolidated profile (dealers submitted via Connect Now form)
        await connectNow.verifyAutoSharedDealersOnConsolidatedProfile();

        // Cleanup
        await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
        await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
    });

    test("Connect Now - Anonymous unsupported zip, explore with Jumpstarter, sign in and verify first dealer auto-shared", async ({ page, request }) => {
        test.setTimeout(300000);

        const connectNow = new ConnectNow(page);
        const smokePage = new SmokePage(page);
        const authHelper = new AuthHelper(request);

        // Launch anonymously and click Connect Now from icebreaker header button
        await connectNow.launchJumpstarterStartPage();
        await connectNow.navigateToConnectNow();

        // Enter unsupported zip — verify "We're not in your area yet." then go back to Jumpstarter
        await connectNow.verifyUnsupportedExperience("96815");
        await connectNow.clickExploreWithJumpstarter();

        // Sign in with existing account
        await smokePage.captureUserDetailsID();
        const { status, email } = await smokePage.verifySignInExistingAccount("07080");
        const { projectId: oldProjectID, userId: oldUserID } = await smokePage.getProjectOldID();
        console.log("Old ProjectID :" + oldProjectID);
        console.log("Old UserID :" + oldUserID);
        await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
        await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);

        // Complete full Jumpstarter flows
        await smokePage.completeIceBreakerFlow();
        await smokePage.completeStyleFlow();
        await smokePage.completeDesignFlow();
        await smokePage.completeBudgetFlow('Premium');

        // No Connect Now sharing occurred (unsupported zip) — first dealer is auto-shared by platform (account zip 07080)
        await connectNow.verifyFirstDealerIsAutoSharedOnConsolidatedProfile();

        // Manually share the second dealer
        await connectNow.shareSecondDealerManually();

        // Cleanup
        await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
        await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
    });

    test("Connect Now - Anonymous enrolled dealer, complete all flows, account wall sign-in, verify lead on profile", async ({ page, request }) => {
        test.setTimeout(300000);

        const connectNow = new ConnectNow(page);
        const smokePage = new SmokePage(page);
        const authHelper = new AuthHelper(request);

        // Launch anonymously and do Connect Now with enrolled dealer zip
        await connectNow.launchJumpstarterStartPage();
        await connectNow.navigateToConnectNow();
        const testEmail = `soumabha.bhandari.mbd01+${process.env.environment}automation@gmail.com`;
        await connectNow.enterZipCodeAndFindDesigner("07080");
        await connectNow.selectDealersAndContinue();
        await connectNow.fillContactInfoAndSubmit("Pramod", "ConnectNowAnon", testEmail, "(741) 258-9630");
        await connectNow.verifyEnrolledDealerConfirmation();
        await connectNow.clickExploreWithJumpstarter();

        // Complete all 4 flows as anonymous user
        await smokePage.completeIceBreakerFlow();
        await smokePage.completeStyleFlow();
        await smokePage.completeDesignFlow();
        await smokePage.completeBudgetFlow('Premium');

        // Account wall — click Continue and sign in with existing account (same email as Connect Now form)
        await expect(page.getByText('Bring your dream kitchen to')).toBeVisible({ timeout: 30000 });
        await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
        await page.getByRole('button', { name: 'Continue' }).click();
        await expect(page.getByRole('heading', { name: 'Create your free account' })).toBeVisible({ timeout: 15000 });
        await smokePage.captureUserDetailsID();
        const { status: statusE, email: emailE } = await smokePage.verifySignInExistingAccountFromAccountWall("07080");
        const { projectId: oldProjectIDE, userId: oldUserIDE } = await smokePage.getProjectOldID();
        console.log("Old ProjectID :" + oldProjectIDE);
        console.log("Old UserID :" + oldUserIDE);

        // Verify Connect Now dealers are shared on consolidated profile
        await connectNow.verifyAutoSharedDealersOnConsolidatedProfile();

        // Cleanup
        await authHelper.updateProjectProfileAPIIDToDefault(oldProjectIDE, oldUserIDE);
        await authHelper.updateInterviewAPIIDsToDefault(oldProjectIDE);
    });

    test("Connect Now - Anonymous unsupported zip, complete all flows, account wall sign-in, verify first dealer auto-shared", async ({ page, request }) => {
        test.setTimeout(300000);

        const connectNow = new ConnectNow(page);
        const smokePage = new SmokePage(page);
        const authHelper = new AuthHelper(request);

        // Launch anonymously and do Connect Now with unsupported zip
        await connectNow.launchJumpstarterStartPage();
        await connectNow.navigateToConnectNow();
        await connectNow.verifyUnsupportedExperience("96815");
        await connectNow.clickExploreWithJumpstarter();

        // Complete all 4 flows as anonymous user
        await smokePage.completeIceBreakerFlow();
        await smokePage.completeStyleFlow();
        await smokePage.completeDesignFlow();
        await smokePage.completeBudgetFlow('Premium');

        // Account wall — click Continue and sign in with existing account
        await expect(page.getByText('Bring your dream kitchen to')).toBeVisible({ timeout: 30000 });
        await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
        await page.getByRole('button', { name: 'Continue' }).click();
        await expect(page.getByRole('heading', { name: 'Create your free account' })).toBeVisible({ timeout: 15000 });
        await smokePage.captureUserDetailsID();
        const { status: statusU, email: emailU } = await smokePage.verifySignInExistingAccountFromAccountWall("07080");
        const { projectId: oldProjectIDU, userId: oldUserIDU } = await smokePage.getProjectOldID();
        console.log("Old ProjectID :" + oldProjectIDU);
        console.log("Old UserID :" + oldUserIDU);

        // No Connect Now sharing (unsupported zip) — first dealer auto-shared by platform, share second manually
        await connectNow.verifyFirstDealerIsAutoSharedOnConsolidatedProfile();
        await connectNow.shareSecondDealerManually();

        // Cleanup
        await authHelper.updateProjectProfileAPIIDToDefault(oldProjectIDU, oldUserIDU);
        await authHelper.updateInterviewAPIIDsToDefault(oldProjectIDU);
    });
});
