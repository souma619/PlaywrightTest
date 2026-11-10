import { test } from '../BaseFixtures/baseFixtures.ts';
import homePage from '../../ui_pages/HomePage.ts';
import IceBreakerPage from '../../ui_pages/IceBreakerPage.ts';
import StylePage from '../../ui_pages/StylePage.ts';
import DesignPage from '../../ui_pages/DesignPage.ts';
import BudgetPage from '../../ui_pages/BudgetPage.ts';
import MatchmakerMomentsPage from '../../ui_pages/MatchmakerMomentsPage';
import AuthHelper from '../../helpers/api-helpers.js';
import fs from 'fs';

const logBoundary = (message: string) => {
  const prefix = '>'.repeat(11);
  const suffix = '<'.repeat(10);
  console.log(prefix + message + suffix);
};

test.describe.configure({ mode: 'default' });
let HomePage: homePage;
let iceBreakerPage: IceBreakerPage;
let stylePage: StylePage;
let designPage: DesignPage;
let budgetPage: BudgetPage;
let matchmakerMomentsPage: MatchmakerMomentsPage;

let runId;
let coverageJS;
let coverageCSS;
let coverageData=[];

test.beforeEach(async ({ page }) => {
    await page.coverage.startJSCoverage({
      resetOnNavigation: false
    });
    await page.coverage.startCSSCoverage({
      resetOnNavigation: false
    });
  });
  
  test.afterEach(async ({ page }) => {
    // Collect coverage after each test
    coverageJS = await page.coverage.stopJSCoverage();
    coverageCSS= await page.coverage.stopCSSCoverage();
    coverageData = coverageData.concat(coverageJS);
    coverageData = coverageData.concat(coverageCSS);
  });
  
  test.afterAll(() => {
    // Save raw coverage data
    fs.writeFileSync('v8-coverage.json', JSON.stringify(coverageData, null, 2));
  });

test('Homepage / Footer - Verify "About Rebode"(TestCaseId:15423)', async ({ page, request }) => {
  test.setTimeout(60000);
  logBoundary("Starting test: Homepage / Footer - Verify \"About Rebode\"");
  //load UI  
  HomePage = new homePage(page);
  const authHelper = new AuthHelper(request);
  var tcStatus_15423 = 'Failed';
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100000, 15423, tcStatus_15423);
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
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100000, 15423, tcStatus_15423);
  logBoundary("Completed test: Homepage / Footer - Verify \"About Rebode\"");
  
});

test('Homepage - Verify page scroll behavior(TestCaseId:15425)', async ({ page, request }) => {
  test.setTimeout(30000);
  logBoundary("Starting test: Homepage - Verify page scroll behavior");
  let tcStatus_15425 = 'Failed';
  //load UI  
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100001, 15425, tcStatus_15425);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  //close cookie pop-up
  await HomePage.closeCookiePopup();
  //verify scroll behavior
  tcStatus_15425=await HomePage.homePageScroll();
    await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt','utf8')) ,100001,15425,tcStatus_15425);
  logBoundary("Completed test: Homepage - Verify page scroll behavior");
});

test('Homepage - Verify see what others have created side scroll behavior(TestCaseId:15426)', async ({ page, request }) => {
  test.setTimeout(60000);
  logBoundary("Starting test: Homepage - Verify see what others have created side scroll behavior");
  var tcStatus_15426 = 'Failed';
  //load UI
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100002, 15426, tcStatus_15426);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  //close cookie pop-up
  await HomePage.closeCookiePopup();
  //verify Side scroll
  tcStatus_15426 = await HomePage.verifySideScroll();
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100002, 15426, tcStatus_15426);
  logBoundary("Completed test: Homepage - Verify see what others have created side scroll behavior");

});

test('Homepage - Verify that the Rebode logo click functionality(TestCaseId:15424)', async ({ page, request }) => {
  test.setTimeout(60000);
  logBoundary("Starting test: Homepage - Verify that the Rebode logo click functionality");
  var tcStatus_15424 = 'Failed';
  //load UI
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100003, 15424, tcStatus_15424);
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
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100003, 15424, tcStatus_15424);
  logBoundary("Completed test: Homepage - Verify that the Rebode logo click functionality");
});

test('Homepage - Verify design process navigation select/click behavior(TestCaseId:15502)', async ({ page, request }) => {
  test.setTimeout(60000);
  logBoundary("Starting test: Homepage - Verify design process navigation select/click behavior");
  //load UI
  var tcStatus_15502 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100005, 15502, tcStatus_15502);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  //close cookie pop-up
  await HomePage.closeCookiePopup();
  //verify scroll behavior
  tcStatus_15502 = await HomePage.homePageScroll();
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100005, 15502, tcStatus_15502);
  logBoundary("Completed test: Homepage - Verify design process navigation select/click behavior");
});

test('Homepage  / Footer - Verify "Privacy Policy"(TestCaseId:18882)', async ({ page, request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Homepage  / Footer - Verify \"Privacy Policy\"");
  //load UI
  var tcStatus_18882 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100006, 18882, tcStatus_18882);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  //verify Privacy Statement
  tcStatus_18882 = await HomePage.verifyPrivacyStatementInCreateMyDreamKitchen();
  await HomePage.verifyPrivacyStatementInLaunchJummstarter();
  tcStatus_18882 = await HomePage.verifyPrivacyStatementInPageFooter();
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100006, 18882, tcStatus_18882);
  logBoundary("Completed test: Homepage  / Footer - Verify \"Privacy Policy\"");
});

test('Homepage  / Footer - Verify "Terms & Conditions"(TestCaseId:18884)', async ({ page, request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Homepage  / Footer - Verify \"Terms & Conditions\"");
  var tcStatus_18884 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100007, 18884, tcStatus_18884);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_18884 = await HomePage.verifyTermsOfUseAtFooter();
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100007, 18884, tcStatus_18884);
  logBoundary("Completed test: Homepage  / Footer - Verify \"Terms & Conditions\"");

});

test('Homepage / Footer - Verify "FAQ"(TestCaseId:18885)', async ({ page, request }) => {
  test.setTimeout(60000);
  logBoundary("Starting test: Homepage / Footer - Verify \"FAQ\"");
  var tcStatus_18885 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100008, 18885, tcStatus_18885);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_18885 = await HomePage.verifyFAQAtFooter();
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100008, 18885, tcStatus_18885);
  logBoundary("Completed test: Homepage / Footer - Verify \"FAQ\"");

});

test('Homepage / Footer - Verify "Kitchen Jumpstarter" link(TestCaseId:18886)', async ({ page, request }) => {
  test.setTimeout(60000);
  logBoundary("Starting test: Homepage / Footer - Verify \"Kitchen Jumpstarter\" link");
  var tcStatus_18886 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100009, 18886, tcStatus_18886);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_18886 = await HomePage.verifyKitchenJumpstarterAtFooter();
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100009, 18886, tcStatus_18886);
  logBoundary("Completed test: Homepage / Footer - Verify \"Kitchen Jumpstarter\" link");

});

test('Homepage / Footer - Verify "Your Privacy Choices" in "Kitchen Jumpstarter"(TestCaseId:18954)', async ({ page, request }) => {
  test.setTimeout(60000);
  logBoundary("Starting test: Homepage / Footer - Verify \"Your Privacy Choices\" in \"Kitchen Jumpstarter\"");
  var tcStatus_18954 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100010, 18954, tcStatus_18954);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_18954 = await HomePage.verifyPrivacyChoiceAtFooter();
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100010, 18954, tcStatus_18954);
  logBoundary("Completed test: Homepage / Footer - Verify \"Your Privacy Choices\" in \"Kitchen Jumpstarter\"");

});

test('Verify Blog page header links(TestCaseId:25056)', async ({ page, request }) => {
  test.setTimeout(60000);
  logBoundary("Starting test: Verify Blog page header links");
  var tcStatus_25056 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100011, 25056, tcStatus_25056);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_25056 = await HomePage.verifyBlogHeaderLinks();
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100011, 25056, tcStatus_25056);
  logBoundary("Completed test: Verify Blog page header links");

});

test('Verify rebode website notification bar is displayed on Homepage(TestCaseId:25057)', async ({ page, request }) => {
  test.setTimeout(60000);
  logBoundary("Starting test: Verify rebode website notification bar is displayed on Homepage");
  var tcStatus_25057 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100012, 25057, tcStatus_25057);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_25057 = await HomePage.verifyNotificationIsDisplayed();
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100012, 25057, tcStatus_25057);
  logBoundary("Completed test: Verify rebode website notification bar is displayed on Homepage");
});

test('Verify user is able to close the notification bar(TestCaseId:25058)', async ({ page, request }) => {
  test.setTimeout(60000);
  logBoundary("Starting test: Verify user is able to close the notification bar");
  var tcStatus_25058 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100013, 25058, tcStatus_25058);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_25058 = await HomePage.verifyNotificationIsDisplayed();
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100013, 25058, tcStatus_25058);
  logBoundary("Completed test: Verify user is able to close the notification bar");
});

test('Verify user is able to view notification bar on about page(TestCaseId:25059)', async ({ page, request }) => {
  test.setTimeout(60000);
  logBoundary("Starting test: Verify user is able to view notification bar on about page");
  var tcStatus_25059 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100014, 25059, tcStatus_25059);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_25059 = await HomePage.verifyNotificationOnAboutPage();
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100014, 25059, tcStatus_25059);
  logBoundary("Completed test: Verify user is able to view notification bar on about page");
});

test('Verify Blog page details(TestCaseId:25186)', async ({ page, request }) => {
  test.setTimeout(60000);
  logBoundary("Starting test: Verify Blog page details");
  var tcStatus_25186 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100015, 25186, tcStatus_25186);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_25186 = await HomePage.verifyBlogDetails();
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100015, 25186, tcStatus_25186);
  logBoundary("Completed test: Verify Blog page details");
});

test('Verify Blog page footer details(TestCaseId:25214)', async ({ page, request }) => {
  test.setTimeout(60000);
  logBoundary("Starting test: Verify Blog page footer details");
  var tcStatus_25214 = 'Failed';
  const authHelper = new AuthHelper(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100016, 25214, tcStatus_25214);
  HomePage = new homePage(page);
  await HomePage.launchHomePage();
  tcStatus_25214 = await HomePage.verifyBlogFooterLinks();
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100016, 25214, tcStatus_25214);
  logBoundary("Completed test: Verify Blog page footer details");
});

test('Icebreaker - Verify Question 3 button selection behavior(TestCaseId:15134)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Icebreaker - Verify Question 3 button selection behavior");
  const authHelper = new AuthHelper(request);
  var tcStatus_15134 = 'Failed';
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100010, 15134, tcStatus_15134);
  //load UI
  iceBreakerPage = new IceBreakerPage(page);
  await iceBreakerPage.launchHomePage();
  await iceBreakerPage.verifyIceBreakerPageQuestion2NextButtonBehavior();
  tcStatus_15134 = await iceBreakerPage.verifyIceBreakerPageQuestion3NextButtonBehavior();
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100010, 15134, tcStatus_15134);
  logBoundary("Completed test: Icebreaker - Verify Question 3 button selection behavior");
});


test('Style - Verify Style Quiz - Question 4(TestCaseId:15141)', async ({ page,request }) => {
  test.setTimeout(90000);
  logBoundary("Starting test: Style - Verify Style Quiz - Question 4");
  const authHelper = new AuthHelper(request);
  var tcStatus_15141='Failed';  
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt','utf8')) ,100001,15141,tcStatus_15141);
  //load UI
  stylePage = new StylePage(page);
  await stylePage.launchHomePage();
  tcStatus_15141=await stylePage.verifyStyleQuizQuestion4();
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt','utf8')) ,100001,15141,tcStatus_15141);
  logBoundary("Completed test: Style - Verify Style Quiz - Question 4");
});


test('Style - Verify Style Finder (from Style Fork)(TestCaseId:15752)', async ({ page,request }) => {
  test.setTimeout(90000);
  logBoundary("Starting test: Style - Verify Style Finder (from Style Fork)");
  const authHelper = new AuthHelper(request);
  var tcStatus_15752='Failed';  
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt','utf8')) ,100011,15752,tcStatus_15752);
  //load UI
  stylePage = new StylePage(page);
  await stylePage.launchHomePage();
  tcStatus_15752=await stylePage.verifyStyleTunerSliders();
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt','utf8')) ,100011,15752,tcStatus_15752);
  logBoundary("Completed test: Style - Verify Style Finder (from Style Fork)");
});
 
test('Style - Verify Style Tuner slider Reset Sliders(TestCaseId:18824)', async ({ page,request }) => {
  test.setTimeout(240000);
  logBoundary("Starting test: Style - Verify Style Tuner slider Reset Sliders");
  const authHelper = new AuthHelper(request);
  var tcStatus_18824='Failed';  
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt','utf8')) ,100016,18824,tcStatus_18824);
  //load UI
  stylePage = new StylePage(page);
  await stylePage.launchHomePage();
  tcStatus_18824=await stylePage.verifyStyleTunerResetSliders();
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt','utf8')) ,100016,18824,tcStatus_18824);
  logBoundary("Completed test: Style - Verify Style Tuner slider Reset Sliders");
});

test('Style - Upload a photo through drop image (good path)(TestCaseId:15756)', async ({ page,request }) => {
  test.setTimeout(90000);
  logBoundary("Starting test: Style - Upload a photo through drop image (good path)");
  const authHelper = new AuthHelper(request);
  var tcStatus_15756='Failed';  
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt','utf8')) ,100012,15756,tcStatus_15756);
  //load UI
  stylePage = new StylePage(page);
  await stylePage.launchHomePage();
  tcStatus_15756=await stylePage.verifyUploadPhotoThroughDropImage();
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt','utf8')) ,100012,15756,tcStatus_15756);
  logBoundary("Completed test: Style - Upload a photo through drop image (good path)");
});
 
test('Design - Verify kitchen design question 4(TestCaseId:17481)', async ({ page }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Design - Verify kitchen design question 4");
  //load UI
  designPage = new DesignPage(page);
  await designPage.launchHomePage();
  await designPage.verifyDesignQuestion4();
  logBoundary("Completed test: Design - Verify kitchen design question 4");
});

test('Budget Flow - Verify the Budget Estimator(TestCaseId:18663)', async ({ page,request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Budget Flow - Verify the Budget Estimator");
  //load UI
  budgetPage = new BudgetPage(page);
  await budgetPage.deleteUser(request);
  await budgetPage.launchHomePage();
  const projectID=await budgetPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await budgetPage.createUser(request,projectID,"02018");
  await budgetPage.verifySignIn();
  await budgetPage.verifyBudgetEstimator();
  await budgetPage.deleteUser(request);
  logBoundary("Completed test: Budget Flow - Verify the Budget Estimator");
});

test('MatchMaker Moments - Style ad choice then stops(TestCaseId:28260)', async ({ page,request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: MatchMaker Moments - Style ad choice then stops");
  //load UI
  matchmakerMomentsPage = new MatchmakerMomentsPage(page);
  await matchmakerMomentsPage.deleteUser(request);
  await matchmakerMomentsPage.launchHomePage();
  const projectID=await matchmakerMomentsPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await matchmakerMomentsPage.createUser(request,projectID,"02018");
  await matchmakerMomentsPage.verifyStyleAdChoiceThenStops();
  await matchmakerMomentsPage.deleteUser(request);
  
  logBoundary("Completed test: MatchMaker Moments - Style ad choice then stops");
});
