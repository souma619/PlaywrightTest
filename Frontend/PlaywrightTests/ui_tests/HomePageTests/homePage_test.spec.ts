import { test, expect, Page } from '@playwright/test';
import homePage from '../../ui_pages/HomePage.ts';
import AuthHelper from '../../helpers/api-helpers';
import fs from 'fs';
import NewHomePage from '../../ui_pages/NewHomepage.ts';

const logBoundary = (message: string) => {
  const prefix = '>'.repeat(11);
  const suffix = '<'.repeat(10);
  console.log(prefix + message + suffix);
};

async function closeAllPagesInContext(page: Page) {
  for (const contextPage of page.context().pages()) {
    if (!contextPage.isClosed()) {
      await contextPage.close({ runBeforeUnload: false }).catch(() => {
        // Ignore close failures during cleanup.
      });
    }
  }
}

const planId = '15124';
const suiteId = '15151';

const homePagePointsTCMap = new Map();
homePagePointsTCMap.set(308, 15126);
homePagePointsTCMap.set(476, 15423);
homePagePointsTCMap.set(477, 15424);
homePagePointsTCMap.set(478, 15425);
homePagePointsTCMap.set(479, 15426);
homePagePointsTCMap.set(527, 15502);
homePagePointsTCMap.set(4007, 18882);
homePagePointsTCMap.set(4008, 18884);
homePagePointsTCMap.set(4009, 18885);
homePagePointsTCMap.set(4010, 18886);
homePagePointsTCMap.set(4073, 18954);
homePagePointsTCMap.set(5846, 25056);
homePagePointsTCMap.set(5847, 25057);
homePagePointsTCMap.set(5848, 25058);
homePagePointsTCMap.set(5849, 25059);
homePagePointsTCMap.set(5866, 25186);
homePagePointsTCMap.set(5891, 25214);
homePagePointsTCMap.set(6073, 27256);
homePagePointsTCMap.set(6074, 27257);
homePagePointsTCMap.set(6075, 27258);
homePagePointsTCMap.set(6076, 27259);
homePagePointsTCMap.set(6594, 34653);
homePagePointsTCMap.set(6599, 35470);
homePagePointsTCMap.set(6600, 35471);
homePagePointsTCMap.set(6601, 35473);
homePagePointsTCMap.set(6602, 35474);
homePagePointsTCMap.set(6603, 35475);
homePagePointsTCMap.set(6604, 35477);
homePagePointsTCMap.set(6605, 35478);
homePagePointsTCMap.set(6606, 35480);
homePagePointsTCMap.set(6607, 35485);

test.describe.configure({ mode: 'default' });
let HomePage: homePage;
let runId;

test('Create Test Report Run ID for Test Plan', async ({ request }) => {
  test.setTimeout(60000);
  const authHelper = new AuthHelper(request);
  runId = await authHelper.getPointsIDforTestPlanTestSuite(homePagePointsTCMap, planId, 'HomePage');
  fs.writeFileSync('temp-id.txt', runId.toString());
  console.log("Test Result Report ID:" + runId);
});

test('Homepage / Footer - Verify "About Rebode"(TestCaseId:15423)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Homepage / Footer - Verify \"About Rebode\"");
  //load UI  
  HomePage = new homePage(page);
  const authHelper = new AuthHelper(request);
  var tcStatus_15423 = 'Failed';
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100000', '15423', tcStatus_15423);
  await HomePage.launchHomePage();
  
  await HomePage.verifyRebodeImageisVisibleOnTopOfPage();
  //verify Kitchen Jumpstarted is visible
  await HomePage.verifyKitchenJumpStarterisVisibleOnTopOfPage();
  //verify About Rebode is visible
  await HomePage.verifyAboutRebodeisVisibleOnTopOfPage();
  //verify Blog is visible
  await HomePage.verifyBlogisVisibleOnTopOfPage();
  //scroll to bottom of page
  await HomePage.verifyScrollTillBottomOfThePage();
  //click on About Rebode from bottom of the page
  await HomePage.clickOnAboutRebodeBottomOfThePage();
  //verify Image is visible
  await HomePage.verifyImageIsDisplayedOnAboutPage();
  //verify Our Story
  await HomePage.verifyOurStoryIsDisplayedOnAboutPage();
  //verify Launch JumpStarter
  tcStatus_15423 = await HomePage.verifyLaunchJumpStarterIsDisplayedOnAboutPage();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100000', '15423', tcStatus_15423);
  logBoundary("Completed test: Homepage / Footer - Verify \"About Rebode\"");
  
});

test('Homepage - Verify page scroll behavior(TestCaseId:15425)', async ({ page, request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Homepage - Verify page scroll behavior");
  let tcStatus_15425 = 'Failed';
  //load UI  
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100001', '15425', tcStatus_15425);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  //close cookie pop-up
  await HomePage.closeCookiePopup();
  //verify scroll behavior
  tcStatus_15425=await HomePage.homePageScroll();
    await authHelper.patchRequest((fs.readFileSync('temp-id.txt','utf8')) ,'100001','15425',tcStatus_15425);
  logBoundary("Completed test: Homepage - Verify page scroll behavior");
});

test('Homepage - Verify see what others have created side scroll behavior(TestCaseId:15426)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Homepage - Verify see what others have created side scroll behavior");
  var tcStatus_15426 = 'Failed';
  //load UI
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100002', '15426', tcStatus_15426);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  //close cookie pop-up
  await HomePage.closeCookiePopup();
  //verify Side scroll
  tcStatus_15426 = await HomePage.verifySideScroll();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100002', '15426', tcStatus_15426);
  logBoundary("Completed test: Homepage - Verify see what others have created side scroll behavior");

});

test('Homepage - Verify that the Rebode logo click functionality(TestCaseId:15424)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Homepage - Verify that the Rebode logo click functionality");
  var tcStatus_15424 = 'Failed';
  //load UI
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100003', '15424', tcStatus_15424);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  //verify rebode image is visible
  await HomePage.verifyRebodeImageisVisibleOnTopOfPage();
  //verify Kitchen Jumpstarted is visible
  await HomePage.verifyKitchenJumpStarterisVisibleOnTopOfPage();
  //verify About Rebode is visible
  await HomePage.verifyAboutRebodeisVisibleOnTopOfPage();
  //verify Blog is visible
  await HomePage.verifyBlogisVisibleOnTopOfPage();
  //click on About rebode link
  await HomePage.clickAboutRebodeisVisibleOnTopOfPage();
  //verify Our Story
  await HomePage.verifyOurStoryIsDisplayedOnAboutPage()
  //click on Link to Home Page
  await HomePage.clickOnLinkToHomePage();
  //verify home page details
  await HomePage.verifyRebodeImageisVisibleOnTopOfPage();
  //verify Kitchen Jumpstarted is visible
  await HomePage.verifyKitchenJumpStarterisVisibleOnTopOfPage();
  //verify About Rebode is visible
  await HomePage.verifyAboutRebodeisVisibleOnTopOfPage();
  //verify Blog is visible
  tcStatus_15424 = await HomePage.verifyBlogisVisibleOnTopOfPage();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100003', '15424', tcStatus_15424);
  logBoundary("Completed test: Homepage - Verify that the Rebode logo click functionality");
});

test('Homepage - Verify that user is able to launch Jumpstarter Application from Rebode home page(TestCaseId:15126)', async ({ page, request }) => {
  test.setTimeout(240000);
  logBoundary("Starting test: Homepage - Verify that user is able to launch Jumpstarter Application from Rebode home page");
  //load UI
  var tcStatus_15126 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100004', '15126', tcStatus_15126);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  //close cookie pop-up
  await HomePage.closeCookiePopup();
  //verify CCPA Onetrust icon
  await HomePage.verifyCCPAOneTrustIcon();
  //verify link Jumpstarter
  tcStatus_15126 = await HomePage.clickOnJumpStarterLinkAndVerifyPageDetails()
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100004', '15126', tcStatus_15126);
  logBoundary("Completed test: Homepage - Verify that user is able to launch Jumpstarter Application from Rebode home page");
});

test('Homepage - Verify design process navigation select/click behavior(TestCaseId:15502)', async ({ page, request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Homepage - Verify design process navigation select/click behavior");
  //load UI
  var tcStatus_15502 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100005', '15502', tcStatus_15502);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  //close cookie pop-up
  await HomePage.closeCookiePopup();
  //verify scroll behavior
  tcStatus_15502 = await HomePage.homePageScroll();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100005', '15502', tcStatus_15502);
  logBoundary("Completed test: Homepage - Verify design process navigation select/click behavior");
});

test('Homepage  / Footer - Verify "Privacy Policy"(TestCaseId:18882)', async ({ page, request }) => {
  test.setTimeout(300000);
  logBoundary("Starting test: Homepage  / Footer - Verify \"Privacy Policy\"");
  //load UI
  var tcStatus_18882 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100006', '18882', tcStatus_18882);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  //verify Privacy Statement
  tcStatus_18882 = await HomePage.verifyPrivacyStatementInCreateMyDreamKitchen();
  await HomePage.launchHomePage();
  await HomePage.verifyPrivacyStatementInLaunchJummstarter();
  await HomePage.launchHomePage();
  tcStatus_18882 = await HomePage.verifyPrivacyStatementInPageFooter();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100006', '18882', tcStatus_18882);
  logBoundary("Completed test: Homepage  / Footer - Verify \"Privacy Policy\"");
});

test('Homepage  / Footer - Verify "Terms & Conditions"(TestCaseId:18884)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Homepage  / Footer - Verify \"Terms & Conditions\"");
  var tcStatus_18884 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100007', '18884', tcStatus_18884);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_18884 = await HomePage.verifyTermsOfUseAtFooter();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100007', '18884', tcStatus_18884);
  logBoundary("Completed test: Homepage  / Footer - Verify \"Terms & Conditions\"");

});

test('Homepage / Footer - Verify "FAQ"(TestCaseId:18885)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Homepage / Footer - Verify \"FAQ\"");
  var tcStatus_18885 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100008', '18885', tcStatus_18885);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_18885 = await HomePage.verifyFAQAtFooter();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100008', '18885', tcStatus_18885);
  logBoundary("Completed test: Homepage / Footer - Verify \"FAQ\"");

});

test('Homepage / Footer - Verify "Kitchen Jumpstarter" link(TestCaseId:18886)', async ({ page, request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Homepage / Footer - Verify \"Kitchen Jumpstarter\" link");
  var tcStatus_18886 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100009', '18886', tcStatus_18886);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_18886 = await HomePage.verifyKitchenJumpstarterAtFooter();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100009', '18886', tcStatus_18886);
  logBoundary("Completed test: Homepage / Footer - Verify \"Kitchen Jumpstarter\" link");

});

test('Homepage / Footer - Verify "Your Privacy Choices" in "Kitchen Jumpstarter"(TestCaseId:18954)', async ({ page, request }) => {
  test.setTimeout(90000);
  logBoundary("Starting test: Homepage / Footer - Verify \"Your Privacy Choices\" in \"Kitchen Jumpstarter\"");
  var tcStatus_18954 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100010', '18954', tcStatus_18954);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_18954 = await HomePage.verifyPrivacyChoiceAtFooter();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100010', '18954', tcStatus_18954);
  logBoundary("Completed test: Homepage / Footer - Verify \"Your Privacy Choices\" in \"Kitchen Jumpstarter\"");

});

test('Verify Blog page header links(TestCaseId:25056)', async ({ page, request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Verify Blog page header links");
  var tcStatus_25056 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100011', '25056', tcStatus_25056);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_25056 = await HomePage.verifyBlogHeaderLinks();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100011', '25056', tcStatus_25056);
  logBoundary("Completed test: Verify Blog page header links");

});

test('Verify rebode website notification bar is displayed on Homepage(TestCaseId:25057)', async ({ page, request }) => {
  test.setTimeout(90000);
  logBoundary("Starting test: Verify rebode website notification bar is displayed on Homepage");
  var tcStatus_25057 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100012', '25057', tcStatus_25057);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_25057 = await HomePage.verifyNotificationIsDisplayed();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100012', '25057', tcStatus_25057);
  logBoundary("Completed test: Verify rebode website notification bar is displayed on Homepage");
});

test('Verify user is able to close the notification bar(TestCaseId:25058)', async ({ page, request }) => {
  test.setTimeout(90000);
  logBoundary("Starting test: Verify user is able to close the notification bar");
  var tcStatus_25058 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100013', '25058', tcStatus_25058);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_25058 = await HomePage.verifyNotificationIsDisplayed();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100013', '25058', tcStatus_25058);
  logBoundary("Completed test: Verify user is able to close the notification bar");
});

test('Verify user is able to view notification bar on about page(TestCaseId:25059)', async ({ page, request }) => {
  test.setTimeout(150000);
  logBoundary("Starting test: Verify user is able to view notification bar on about page");
  var tcStatus_25059 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100014', '25059', tcStatus_25059);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_25059 = await HomePage.verifyNotificationOnAboutPage();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100014', '25059', tcStatus_25059);
  logBoundary("Completed test: Verify user is able to view notification bar on about page");
});

test('Verify Blog page details(TestCaseId:25186)', async ({ page, request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Verify Blog page details");
  var tcStatus_25186 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100015', '25186', tcStatus_25186);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_25186 = await HomePage.verifyBlogDetails();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100015', '25186', tcStatus_25186);
  logBoundary("Completed test: Verify Blog page details");
});

test('Verify Blog page footer details(TestCaseId:25214)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Verify Blog page footer details");
  var tcStatus_25214 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100016', '25214', tcStatus_25214);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_25214 = await HomePage.verifyBlogFooterLinks();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100016', '25214', tcStatus_25214);
  logBoundary("Completed test: Verify Blog page footer details");
});

test('NewHomePage - Verify homepage headlines and CTAs(TestCaseId:35470)', async ({ page, request }) => {
  test.setTimeout(300000);
  logBoundary("Starting test: NewHomePage - Verify homepage headlines and CTAs");
  var tcStatus_35470 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100017', '35470', tcStatus_35470);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_35470 = await HomePage.verifyHomepageHeadlinesAndCTAs();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100017', '35470', tcStatus_35470);
  logBoundary("Completed test: NewHomePage - Verify homepage headlines and CTAs");
});


test('NewHomePage - Validate Hero Navigation Tabs(TestCaseId:35471)', async ({ page, request }) => {
  test.setTimeout(240000);
  logBoundary("Starting test: NewHomePage - Validate Hero Navigation Tabs");
  var tcStatus_35471 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100018', '35471', tcStatus_35471);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_35471 = await HomePage.verifyHeroNavigationTabs();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100018', '35471', tcStatus_35471);
  logBoundary("Completed test: NewHomePage - Validate Hero Navigation Tabs");
});

test('NewHomePage - Validate How it Works Section(TestCaseId:35473)', async ({ page, request }) => {
  test.setTimeout(240000);
  logBoundary("Starting test: NewHomePage - Validate How it Works Section");
  var tcStatus_35473 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100019', '35473', tcStatus_35473);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_35473 = await HomePage.verifyHowItWorksSection();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100019', '35473', tcStatus_35473);
  logBoundary("Completed test: NewHomePage - Validate How it Works Section");
});

test('NewHomePage - Validate From Vision To Renovation Section(TestCaseId:35474)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: NewHomePage - Validate From Vision To Renovation Section");
  var tcStatus_35474 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100020', '35474', tcStatus_35474);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_35474=await HomePage.verifyFromVisionToRenovation();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100020', '35474', tcStatus_35474);
  logBoundary("Completed test: NewHomePage - Validate From Vision To Renovation Section");
});

test('NewHomePage - Validate Tools To Shape Your Dream Section(TestCaseId:35475)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: NewHomePage - Validate Tools To Shape Your Dream Section");
  var tcStatus_35475 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100021', '35475', tcStatus_35475);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_35475 = await HomePage.verifyToolsToShapeYourDream();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100021', '35475', tcStatus_35475);
  logBoundary("Completed test: NewHomePage - Validate Tools To Shape Your Dream Section");
});

test('NewHomePage - Validate See Your Dream Kitchen Come To Life Section(TestCaseId:35477)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: NewHomePage - Validate See Your Dream Kitchen Come To Life Section");
  var tcStatus_35477 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100022', '35477', tcStatus_35477);
  //load UI
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_35477 = await HomePage.verifySeeYourDreamKitchenComeToLife();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100022', '35477', tcStatus_35477);
  logBoundary("Completed test: NewHomePage - Validate See Your Dream Kitchen Come To Life Section");
});

test('NewHomePage - Validate Still Exploring Section(TestCaseId:35478)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: NewHomePage - Validate Still Exploring Section");
  var tcStatus_35478 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100023', '35478', tcStatus_35478);
  //load UI
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  //verify still exploring section
  tcStatus_35478 = await HomePage.verifyStillExploring();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100023', '35478', tcStatus_35478);
  logBoundary("Completed test: NewHomePage - Validate Still Exploring Section");
});

test('NewHomePage - Validate YourQuestionsAnswered FAQs Section(TestCaseId:35480)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: NewHomePage - Validate YourQuestionsAnswered FAQs Section");
  var tcStatus_35480 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100024', '35480', tcStatus_35480);
  //load UI
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  //verify your questions answered section
 
  tcStatus_35480 = await HomePage.verifyYourQuestionsAnswered();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100024', '35480', tcStatus_35480);
  logBoundary("Completed test: NewHomePage - Validate YourQuestionsAnswered FAQs Section");
});

test('NewHomePage - Validate About Rebode Section(TestCaseId:35485)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: NewHomePage - Validate About Rebode Section");
  var tcStatus_35485 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100025', '35485', tcStatus_35485);
  //load UI
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  //verify about rebode section
  tcStatus_35485 = await HomePage.verifyAboutRebode();
  await authHelper.patchRequest((fs.readFileSync('temp-id.txt', 'utf8')), '100025', '35485', tcStatus_35485);
  logBoundary("Completed test: NewHomePage - Validate About Rebode Section");
});

test('Complete Test Report Run for Test Plan', async ({ request }) => {
  test.setTimeout(60000);
  const authHelper = new AuthHelper(request);
  await authHelper.patchToCompleteTestRunRequest((fs.readFileSync('temp-id.txt', 'utf8')));
  console.log("Completed Test Result Update for HomePage");
});
 
 