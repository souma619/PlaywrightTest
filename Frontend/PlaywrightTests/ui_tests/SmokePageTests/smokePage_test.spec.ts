import { test, expect } from '@playwright/test';
import SmokePage from '../../ui_pages/SmokePage.ts';
import ConnectNow from '../../ui_pages/ConnectNow';
import AuthHelper from '../../helpers/api-helpers';
import fs from 'fs';

const planId = '15124';
const suiteId = '15436';

const smokePagePointsTCMap = new Map();
smokePagePointsTCMap.set(5844, 24492);
smokePagePointsTCMap.set(538, 15126);
smokePagePointsTCMap.set(6383, 15423);
smokePagePointsTCMap.set(6384, 18882);
smokePagePointsTCMap.set(6385, 18884);
smokePagePointsTCMap.set(6386, 18885);
smokePagePointsTCMap.set(6387, 18886);
smokePagePointsTCMap.set(6388, 18954);
smokePagePointsTCMap.set(6389, 25186);
smokePagePointsTCMap.set(6390, 27256);
smokePagePointsTCMap.set(546, 15313);
smokePagePointsTCMap.set(540, 15155);
smokePagePointsTCMap.set(4563, 22052);
smokePagePointsTCMap.set(549, 15752);
smokePagePointsTCMap.set(6395, 15756);
smokePagePointsTCMap.set(4002, 18823);
smokePagePointsTCMap.set(542, 15205);
smokePagePointsTCMap.set(547, 15490);
smokePagePointsTCMap.set(6397, 15214);
smokePagePointsTCMap.set(543, 15223);
smokePagePointsTCMap.set(6398, 18663);
smokePagePointsTCMap.set(4561, 21647);
smokePagePointsTCMap.set(4562, 21648);
smokePagePointsTCMap.set(628, 16262);
smokePagePointsTCMap.set(630, 16270);
smokePagePointsTCMap.set(4001, 18696);
smokePagePointsTCMap.set(5989, 26863);
smokePagePointsTCMap.set(512, 15310);
smokePagePointsTCMap.set(545, 15377);
smokePagePointsTCMap.set(6391, 30336);
smokePagePointsTCMap.set(6392, 30345);
smokePagePointsTCMap.set(6424, 30407);
smokePagePointsTCMap.set(6371, 28256);
smokePagePointsTCMap.set(5850, 25088);
smokePagePointsTCMap.set(6370, 25094);
smokePagePointsTCMap.set(6362, 29904);
smokePagePointsTCMap.set(6368, 30382);
smokePagePointsTCMap.set(6369, 30384);
smokePagePointsTCMap.set(544, 15230);
smokePagePointsTCMap.set(6432, 15138);
smokePagePointsTCMap.set(6434, 30411);
smokePagePointsTCMap.set(6496, 30775);
smokePagePointsTCMap.set(6595, 34653);
smokePagePointsTCMap.set(6978, 36155);
smokePagePointsTCMap.set(6979, 36488);
smokePagePointsTCMap.set(6980, 36489);
smokePagePointsTCMap.set(6981, 36490);
smokePagePointsTCMap.set(6982, 37800);

let smokePage: SmokePage;
let runId;

const logBoundary = (message: string) => {
  const prefix = '>'.repeat(11);
  const suffix = '<'.repeat(10);
  console.log(prefix + message + suffix);
};

// Setup: create test report run ID for test plan
test('Create Test Report Run ID for Test Plan', async ({ request }) => {
  const authHelper = new AuthHelper(request);
  runId = await authHelper.getPointsIDforTestPlanTestSuite(smokePagePointsTCMap, planId, 'SmokePage');
  fs.writeFileSync('temp-id.txt', runId.toString());
  console.log("Test Result Report ID:" + runId);
});

// =====================================================================
// PARALLEL BLOCK — everything between setup and teardown runs concurrently
// See the note at the top of this file (or the chat) about shared-account
// state (phone "07080", the "default" profile reset calls) before relying
// on this for real parallel runs.
// =====================================================================
test.describe('SmokePage - parallel test cases', () => {
  test.describe.configure({ mode: 'parallel' });

// TestCaseId: 15313 - Account - Sign up and account created
test('Account - Sign up and account created(TestCaseId:15313)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Account - Sign up and account created");
  const authHelper = new AuthHelper(request);
  var tcStatus_15313 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15313', tcStatus_15313);
  //load UI
  smokePage = new SmokePage(page);
  await smokePage.launchHomePage();
  const projectID = await smokePage.getProjectID();
  console.log("New ProjectID :" + projectID);
  // ✅ Destructure both status and email from verifySignIn
  await smokePage.captureUserDetailsID();
  const { status, email } = await smokePage.verifySignIn("07080");
  tcStatus_15313 = status;
  // ✅ Pass email into deleteUser
  await smokePage.deleteUser(request, email);
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15313', tcStatus_15313);
  logBoundary("Completed test: Account - Sign up and account created");
});

// TestCaseId: 15155 - Account - Sign in success
test('Account - Sign in success(TestCaseId:15155)', async ({ page, request }) => {
  test.setTimeout(125000);
  logBoundary("Starting test: Account - Sign in success");
  const authHelper = new AuthHelper(request);
  var tcStatus_15155 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100001', '15155', tcStatus_15155);
  //load UI
  smokePage = new SmokePage(page);
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
  tcStatus_15155 = status;
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100001', '15155', tcStatus_15155);
  logBoundary("Completed test: Account - Sign in success");

});

// TestCaseId: 15205 - Design - Verify the Intro Text Boxes before the Question 1
test('Design - Verify the Intro Text Boxes before the Question 1(TestCaseId:15205)', async ({ page, request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Design - Verify the Intro Text Boxes before the Question 1");
  const authHelper = new AuthHelper(request);
  var tcStatus_15205 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100002', '15205', tcStatus_15205);
  //load UI
  smokePage = new SmokePage(page);
  await smokePage.launchHomePage();
  await smokePage.completeIceBreakerFlow();
  await smokePage.completeStyleFlow();
  tcStatus_15205 = await smokePage.verifyDesignIntroTextBoxes();
  expect(tcStatus_15205).toBe('Passed');
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100002', '15205', tcStatus_15205);
  logBoundary("Completed test: Design - Verify the Intro Text Boxes before the Question 1");
});

// TestCaseId: 15490 - Design - Verify design profile "You said you want to remodel your kitchen because:"
test('Design - Verify design profile "You said you want to remodel your kitchen because:"(TestCaseId:15490)', async ({ page, request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Design - Verify design profile \"You said you want to remodel your kitchen because:\"");
  const authHelper = new AuthHelper(request);
  var tcStatus_15490 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100003', '15490', tcStatus_15490);
  //load UI
  smokePage = new SmokePage(page);
  await smokePage.launchHomePage();
  tcStatus_15490 = await smokePage.verifyDesignIntroTextBoxes();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100003', '15490', tcStatus_15490);
  logBoundary("Completed test: Design - Verify design profile \"You said you want to remodel your kitchen because:\"");
});

// TestCaseId: 15230 - Navigation Bar - Verify that the user can return to the current phase after going back to previously completed phase
test('Navigation Bar - Verify that the user can return to the current phase after going back to previously completed phase(TestCaseId:15230)', async ({ page, request }) => {
  test.setTimeout(300000);
  logBoundary("Starting test: Navigation Bar - Verify that the user can return to the current phase after going back to previously completed phase");
  const authHelper = new AuthHelper(request);
  var tcStatus_15230 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100004', '15230', tcStatus_15230);
  //load UI
  smokePage = new SmokePage(page);
  await smokePage.launchHomePage();
   const projectID = await smokePage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await smokePage.captureUserDetailsID();
  const { status, email } = await smokePage.verifySignInExistingAccount("01867");
  const { projectId: oldProjectID, userId: oldUserID } = await smokePage.getProjectOldID();
  console.log("Old ProjectID :" + oldProjectID);
  console.log("Old UserID :" + oldUserID);
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  await smokePage.completeIceBreakerFlow();
  await smokePage.completeStyleFlow();
  await smokePage.completeDesignFlow();
  await smokePage.completeBudgetFlow('Premium');
  tcStatus_15230 = await smokePage.verifyNavigationBar();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100004', '15230', tcStatus_15230);
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  logBoundary("Completed test: Navigation Bar - Verify that the user can return to the current phase after going back to previously completed phase");
});

// TestCaseId: 15377 - Consolidated Profile - Verify Download PDF button
test('Consolidated Profile - Verify Download PDF button(TestCaseId:15377)', async ({ page, request }) => {
  test.setTimeout(300000);
  logBoundary("Starting test: Consolidated Profile - Verify Download PDF button");
  const authHelper = new AuthHelper(request);
  var tcStatus_15377 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100005', '15377', tcStatus_15377);
  //load UI
  smokePage = new SmokePage(page);
  await smokePage.launchHomePage();
  const projectID = await smokePage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await smokePage.captureUserDetailsID();
  const { status, email } = await smokePage.verifySignInExistingAccount("19070");
  const { projectId: oldProjectID, userId: oldUserID } = await smokePage.getProjectOldID();
  console.log("Old ProjectID :" + oldProjectID);
  console.log("Old UserID :" + oldUserID);
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  await smokePage.completeIceBreakerFlow();
  await smokePage.completeStyleFlow();
  await smokePage.completeDesignFlow();
  await smokePage.completeBudgetFlow('Premium');
  tcStatus_15377 = await smokePage.verifyDownloadRemodelProfilePDF('Stock');
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100005', '15377', tcStatus_15377);
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  logBoundary("Completed test: Consolidated Profile - Verify Download PDF button");
});

// TestCaseId: 15752 - Style - Verify Style Finder (from Style Fork)
test('Style - Verify Style Finder (from Style Fork)(TestCaseId:15752)', async ({ page, request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Style - Verify Style Finder (from Style Fork)");
  const authHelper = new AuthHelper(request);
  var tcStatus_15752 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100006', '15752', tcStatus_15752);
  //load UI
  smokePage = new SmokePage(page);
  await smokePage.launchHomePage();
  tcStatus_15752 = await smokePage.verifyStyleFinderIsNotVisibleOnPage();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100006', '15752', tcStatus_15752);
  logBoundary("Completed test: Style - Verify Style Finder (from Style Fork)");
});

// TestCaseId: 16262 - Consolidated Profile -  Verify that the "Share profile" button is visible for Wave 1 Zip Code
test('Consolidated Profile -  Verify that the "Share profile" button is visible for Wave 1 Zip Code(TestCaseId:16262)', async ({ page, request }) => {
  test.setTimeout(300000);
  logBoundary("Starting test: Consolidated Profile -  Verify that the \"Share profile\" button is visible for Wave 1 Zip Code");
  const authHelper = new AuthHelper(request);
  var tcStatus_16262 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100007', '16262', tcStatus_16262);
  //load UI
  smokePage = new SmokePage(page);
  await smokePage.launchHomePage();
    const projectID = await smokePage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await smokePage.captureUserDetailsID();
  const { status, email } = await smokePage.verifySignInExistingAccount("22180");
  const { projectId: oldProjectID, userId: oldUserID } = await smokePage.getProjectOldID();
  console.log("Old ProjectID :" + oldProjectID);
  console.log("Old UserID :" + oldUserID);
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  await smokePage.completeIceBreakerFlow();
  await smokePage.completeStyleFlow();
  await smokePage.completeDesignFlow();
  await smokePage.completeBudgetFlow('Premium');
  tcStatus_16262 = await smokePage.verifyAutoAndManualShareOfTheDealers();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100007', '16262', tcStatus_16262);
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  logBoundary("Completed test: Consolidated Profile -  Verify that the \"Share profile\" button is visible for Wave 1 Zip Code");
});

// TestCaseId: 16270 - Consolidated Profile -  Verify that the "Share profile" button is NOT visible for zip code outside of Wave1
test('Consolidated Profile -  Verify that the "Share profile" button is NOT visible for zip code outside of Wave1(TestCaseId:16270)', async ({ page, request }) => {
  test.setTimeout(300000);
  logBoundary("Starting test: Consolidated Profile -  Verify that the \"Share profile\" button is NOT visible for zip code outside of Wave1");
  const authHelper = new AuthHelper(request);
  var tcStatus_16270 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100008', '16270', tcStatus_16270);
  //load UI
  smokePage = new SmokePage(page);
  await smokePage.launchHomePage();
  const projectID = await smokePage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await smokePage.captureUserDetailsID();
  const { status, email } = await smokePage.verifySignInExistingAccount("11772");
  const { projectId: oldProjectID, userId: oldUserID } = await smokePage.getProjectOldID();
  console.log("Old ProjectID :" + oldProjectID);
  console.log("Old UserID :" + oldUserID);
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  await smokePage.completeIceBreakerFlow();
  await smokePage.completeStyleFlow();
  await smokePage.completeDesignFlow();
  await smokePage.completeBudgetFlow('Premium');
  tcStatus_16270 = await smokePage.verifyManualShareIsNotPresentForZipCodeOutsideOfWave1();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100008', '16270', tcStatus_16270);
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  logBoundary("Completed test: Consolidated Profile -  Verify that the \"Share profile\" button is NOT visible for zip code outside of Wave1");
});

// TestCaseId: 18696 - Remodel Profile - Verify User Feedback and Rating
test('Remodel Profile - Verify User Feedback and Rating(TestCaseId:18696)', async ({ page, request }) => {
  test.setTimeout(300000);
  logBoundary("Starting test: Remodel Profile - Verify User Feedback and Rating");
  const authHelper = new AuthHelper(request);
  var tcStatus_18696 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100009', '18696', tcStatus_18696);
  //load UI
  smokePage = new SmokePage(page);
  await smokePage.launchHomePage();
    const projectID = await smokePage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await smokePage.captureUserDetailsID();
  const { status, email } = await smokePage.verifySignInExistingAccount("32073");
  const { projectId: oldProjectID, userId: oldUserID } = await smokePage.getProjectOldID();
  console.log("Old ProjectID :" + oldProjectID);
  console.log("Old UserID :" + oldUserID);
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  await smokePage.completeIceBreakerFlow();
  await smokePage.completeStyleFlow();
  await smokePage.completeDesignFlow();
  await smokePage.completeBudgetFlow('Premium');
  tcStatus_18696 = await smokePage.verifySubmitUserRatingAndFeedback();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100009', '18696', tcStatus_18696);
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  logBoundary("Completed test: Remodel Profile - Verify User Feedback and Rating");
});

// TestCaseId: 18823 - Style - Verify Style Tuner Sliders
test('Style - Verify Style Tuner Sliders(TestCaseId:18823)', async ({ page, request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Style - Verify Style Tuner Sliders");
  const authHelper = new AuthHelper(request);
  var tcStatus_18823 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100010', '18823', tcStatus_18823);
  //load UI
  smokePage = new SmokePage(page);
  await smokePage.launchHomePage();
  tcStatus_18823 = await smokePage.verifyStyleFinderIsNotVisibleOnPage();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100010', '18823', tcStatus_18823);
  logBoundary("Completed test: Style - Verify Style Tuner Sliders");
});

// TestCaseId: 18956 - Account - Zip code in, and not in, Wave 1 - Confirm Dealers based on "Stock" cabinet Selection
test('Account - Zip code in, and not in, Wave 1 - Confirm Dealers based on "Stock" cabinet Selection(TestCaseId:18956)', async ({ page, request }) => {
  test.setTimeout(300000);
  logBoundary("Starting test: Account - Zip code in, and not in, Wave 1 - Confirm Dealers based on \"Stock\" cabinet Selection");
  const authHelper = new AuthHelper(request);
  var tcStatus_18956 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100011', '18956', tcStatus_18956);
  //load UI
  smokePage = new SmokePage(page);
  await smokePage.launchHomePage();
  const projectID = await smokePage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await smokePage.captureUserDetailsID();
  const { status, email } = await smokePage.verifySignIn("07080");
  await smokePage.completeIceBreakerFlow();
  await smokePage.completeStyleFlow();
  await smokePage.completeDesignFlow();
  await smokePage.completeBudgetFlow('Premium');
  tcStatus_18956 = await smokePage.verifyDownloadRemodelProfilePDF('Stock');
  await smokePage.deleteUser(request, email);
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100011', '18956', tcStatus_18956);
  logBoundary("Completed test: Account - Zip code in, and not in, Wave 1 - Confirm Dealers based on \"Stock\" cabinet Selection");
});

// TestCaseId: 18957 - Account - Zip code in, and not in, Wave 1 - Confirm Dealers based on "Semi Custom" cabinet Selection
test('Account - Zip code in, and not in, Wave 1 - Confirm Dealers based on "Semi Custom" cabinet Selection(TestCaseId:18957)', async ({ page, request }) => {
  test.setTimeout(300000);
  logBoundary("Starting test: Account - Zip code in, and not in, Wave 1 - Confirm Dealers based on \"Semi Custom\" cabinet Selection");
  const authHelper = new AuthHelper(request);
  var tcStatus_18957 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100012', '18957', tcStatus_18957);
  //load UI
  smokePage = new SmokePage(page);
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
  await smokePage.completeIceBreakerFlow();
  await smokePage.completeStyleFlow();
  await smokePage.completeDesignFlow();
  await smokePage.completeBudgetFlow('Premium');
  tcStatus_18957 = await smokePage.verifyDownloadRemodelProfilePDF('semi-custom');
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100012', '18957', tcStatus_18957);
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  logBoundary("Completed test: Account - Zip code in, and not in, Wave 1 - Confirm Dealers based on \"Semi Custom\" cabinet Selection");

});

// TestCaseId: 18958 - Account - Zip code in, and not in, Wave 1 - Confirm Dealers based on "Premium" cabinet Selection
test('Account - Zip code in, and not in, Wave 1 - Confirm Dealers based on "Premium" cabinet Selection(TestCaseId:18958)', async ({ page, request }) => {
  test.setTimeout(300000);
  logBoundary("Starting test: Account - Zip code in, and not in, Wave 1 - Confirm Dealers based on \"Premium\" cabinet Selection");
  const authHelper = new AuthHelper(request);
  var tcStatus_18958 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100013', '18958', tcStatus_18958);
  //load UI
  smokePage = new SmokePage(page);
  await smokePage.launchHomePage();
  const projectID = await smokePage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await smokePage.captureUserDetailsID();
  const { status, email } = await smokePage.verifySignInExistingAccount("01867");
  const { projectId: oldProjectID, userId: oldUserID } = await smokePage.getProjectOldID();
  console.log("Old ProjectID :" + oldProjectID);
  console.log("Old UserID :" + oldUserID);
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  await smokePage.completeIceBreakerFlow();
  await smokePage.completeStyleFlow();
  await smokePage.completeDesignFlow();
  await smokePage.completeBudgetFlow('Premium');
  tcStatus_18958 = await smokePage.verifyDownloadRemodelProfilePDF('premium');
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100013', '18958', tcStatus_18958);
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  logBoundary("Completed test: Account - Zip code in, and not in, Wave 1 - Confirm Dealers based on \"Premium\" cabinet Selection");
});

// TestCaseId: 21647 - Consolidated Profile - Verify that the Dealer Map pins can select a dealer in the list for Wave 1 zip code
test('Consolidated Profile - Verify that the Dealer Map pins can select a dealer in the list for Wave 1 zip code(TestCaseId:21647)', async ({ page, request }) => {
  test.setTimeout(300000);
  logBoundary("Starting test: Consolidated Profile - Verify that the Dealer Map pins can select a dealer in the list for Wave 1 zip code");
  const authHelper = new AuthHelper(request);
  var tcStatus_21647 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100014', '21647', tcStatus_21647);
  //load UI
  smokePage = new SmokePage(page);
  await smokePage.launchHomePage();
    const projectID = await smokePage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await smokePage.captureUserDetailsID();
  const { status, email } = await smokePage.verifySignInExistingAccount("19070");
  const { projectId: oldProjectID, userId: oldUserID } = await smokePage.getProjectOldID();
  console.log("Old ProjectID :" + oldProjectID);
  console.log("Old UserID :" + oldUserID);
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  await smokePage.completeIceBreakerFlow();
  await smokePage.completeStyleFlow();
  await smokePage.completeDesignFlow();
  await smokePage.completeBudgetFlow('Premium');
  await smokePage.selectPinAndVerifyDealer(2);
  tcStatus_21647 = await smokePage.selectPinAndVerifyDealer(2);
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100014', '21647', tcStatus_21647);
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  logBoundary("Completed test: Consolidated Profile - Verify that the Dealer Map pins can select a dealer in the list for Wave 1 zip code");
});

// TestCaseId: 21648 - Consolidated Profile - Verify that the Dealer Map pins can open a dealer in the list for out of Wave zip code
test('Consolidated Profile - Verify that the Dealer Map pins can open a dealer in the list for out of Wave zip code(TestCaseId:21648)', async ({ page, request }) => {
  test.setTimeout(300000);
  logBoundary("Starting test: Consolidated Profile - Verify that the Dealer Map pins can open a dealer in the list for out of Wave zip code");
  const authHelper = new AuthHelper(request);
  var tcStatus_21648 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100011', '21648', tcStatus_21648);
  //load UI
  smokePage = new SmokePage(page);
  await smokePage.launchHomePage();
  const projectID = await smokePage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await smokePage.captureUserDetailsID();
  const { status, email } = await smokePage.verifySignInExistingAccount("22180");
  const { projectId: oldProjectID, userId: oldUserID } = await smokePage.getProjectOldID();
  console.log("Old ProjectID :" + oldProjectID);
  console.log("Old UserID :" + oldUserID);
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  await smokePage.completeIceBreakerFlow();
  await smokePage.completeStyleFlow();
  await smokePage.completeDesignFlow();
  await smokePage.completeBudgetFlow('Premium');
  tcStatus_21648 = await smokePage.selectPinAndOpenViewPrintPdf(2);
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100011', '21648', tcStatus_21648);
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  logBoundary("Completed test: Consolidated Profile - Verify that the Dealer Map pins can open a dealer in the list for out of Wave zip code");
});

// TestCaseId: 24492 - Consolidated Profile & Salesforce - End to End Test Case for New Users
test('Consolidated Profile & Salesforce - End to End Test Case for New Users(TestCaseId:24492)', async ({ page, request }) => {
  test.setTimeout(300000);
  logBoundary("Starting test: Consolidated Profile & Salesforce - End to End Test Case for New Users");
  const authHelper = new AuthHelper(request);
  var tcStatus_24492 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100012', '24492', tcStatus_24492);
  //load UI
  smokePage = new SmokePage(page);
  await smokePage.launchHomePage();
  const projectID = await smokePage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await smokePage.captureUserDetailsID();
  const { status, email } = await smokePage.verifySignIn("07080");
  await smokePage.completeIceBreakerFlow();
  await smokePage.completeStyleFlow();
  await smokePage.completeDesignFlow();
  await smokePage.completeBudgetFlow('Premium');
  tcStatus_24492 = await smokePage.verifyAutoAndManualShareOfTheDealers();

  // Saleforce side validation goes here..

  await smokePage.deleteUser(request, email);
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100012', '24492', tcStatus_24492);
  logBoundary("Completed test: Consolidated Profile & Salesforce - End to End Test Case for New Users");
});

// TestCaseId: 26863 - Consolidated Profile - Verify QR code in design profile tab
test('Consolidated Profile - Verify QR code in design profile tab(TestCaseId:26863)', async ({ page, request }) => {
  test.setTimeout(300000);
  logBoundary("Starting test: Consolidated Profile - Verify QR code in design profile tab");
  const authHelper = new AuthHelper(request);
  var tcStatus_26863 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100013', '26863', tcStatus_26863);
  //load UI
  smokePage = new SmokePage(page);
  await smokePage.launchHomePage();
  const projectID = await smokePage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await smokePage.captureUserDetailsID();
  const { status, email } = await smokePage.verifySignInExistingAccount("11772");
  const { projectId: oldProjectID, userId: oldUserID } = await smokePage.getProjectOldID();
  console.log("Old ProjectID :" + oldProjectID);
  console.log("Old UserID :" + oldUserID);
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  await smokePage.completeIceBreakerFlow();
  await smokePage.completeStyleFlow();
  await smokePage.completeDesignFlow();
  await smokePage.completeBudgetFlow('Premium');
  tcStatus_26863 = await smokePage.verifyQRCodeOnDesignProfileTab();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100013', '26863', tcStatus_26863);
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  logBoundary("Completed test: Consolidated Profile - Verify QR code in design profile tab");
});

// TestCaseId: 30336 - Consolidated Profile - Toys - Verify try on your style functionality
test('Consolidated Profile - Toys - Verify try on your style functionality(TestCaseId:30336)', async ({ page, request }) => {
  test.setTimeout(300000);
  logBoundary("Starting test: Consolidated Profile - Toys - Verify try on your style functionality");
  const authHelper = new AuthHelper(request);
  var tcStatus_30336 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100014', '30336', tcStatus_30336);
  //load UI
  smokePage = new SmokePage(page);
  await smokePage.launchHomePage();
    const projectID = await smokePage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await smokePage.captureUserDetailsID();
  const { status, email } = await smokePage.verifySignInExistingAccount("32073");
  const { projectId: oldProjectID, userId: oldUserID } = await smokePage.getProjectOldID();
  console.log("Old ProjectID :" + oldProjectID);
  console.log("Old UserID :" + oldUserID);
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  await smokePage.completeIceBreakerFlow();
  await smokePage.completeStyleFlow();
  await smokePage.completeDesignFlow();
  await smokePage.completeBudgetFlow('Premium');
  tcStatus_30336 = await smokePage.verifyTryOnYourStyleFlow();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100014', '30336', tcStatus_30336);
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  logBoundary("Completed test: Consolidated Profile - Toys - Verify try on your style functionality");
});

// TestCaseId: 36155 - Connect Now Smoke - Verify unsupported experience
test('Connect Now Smoke - Verify unsupported experience(TestCaseId:36155)', async ({ page, request }) => {
  test.setTimeout(150000);
  logBoundary('Starting test: Connect Now Smoke - Verify unsupported experience');
  const authHelper = new AuthHelper(request);
  var tcStatus_36155 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100015', '36155', tcStatus_36155);
  const connectNow = new ConnectNow(page);
  await connectNow.launchJumpstarterStartPage();
  await connectNow.navigateToConnectNow();
  await connectNow.smokeVerifyUnsupportedExperience('96815');
  tcStatus_36155 = 'Passed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100015', '36155', tcStatus_36155);
  logBoundary('Completed test: Connect Now Smoke - Verify unsupported experience');
});

// TestCaseId: 36488 - Connect Now Smoke - Verify iCab online dealer experience
test('Connect Now Smoke - Verify iCab online dealer experience(TestCaseId:36488)', async ({ page, request }) => {
  test.setTimeout(240000);
  logBoundary('Starting test: Connect Now Smoke - Verify iCab online dealer experience');
  const authHelper = new AuthHelper(request);
  var tcStatus_36488 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100016', '36488', tcStatus_36488);
  const connectNow = new ConnectNow(page);
  await connectNow.denyBrowserLocationPermission();
  await connectNow.launchJumpstarterStartPage();
  await connectNow.navigateToConnectNow();
  await connectNow.smokeVerifyICabExperience('98335');
  tcStatus_36488 = 'Passed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100016', '36488', tcStatus_36488);
  logBoundary('Completed test: Connect Now Smoke - Verify iCab online dealer experience');
});

// TestCaseId: 36489 - Connect Now Smoke - Verify enrolled dealer experience
test('Connect Now Smoke - Verify enrolled dealer experience(TestCaseId:36489)', async ({ page, request }) => {
  test.setTimeout(90000);
  logBoundary('Starting test: Connect Now Smoke - Verify enrolled dealer experience');
  const authHelper = new AuthHelper(request);
  var tcStatus_36489 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100017', '36489', tcStatus_36489);
  const connectNow = new ConnectNow(page);
  await connectNow.denyBrowserLocationPermission();
  await connectNow.launchJumpstarterStartPage();
  await connectNow.navigateToConnectNow();
  await connectNow.smokeVerifyEnrolledDealerExperience('07080');
  tcStatus_36489 = 'Passed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100017', '36489', tcStatus_36489);
  logBoundary('Completed test: Connect Now Smoke - Verify enrolled dealer experience');
});

// TestCaseId: 36490 - Connect Now Smoke - Verify Virtual Designer experience
test('Connect Now Smoke - Verify Virtual Designer experience(TestCaseId:36490)', async ({ page, request }) => {
  test.setTimeout(90000);
  logBoundary('Starting test: Connect Now Smoke - Verify Virtual Designer experience');
  const authHelper = new AuthHelper(request);
  var tcStatus_36490 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100018', '36490', tcStatus_36490);
  const connectNow = new ConnectNow(page);
  await connectNow.denyBrowserLocationPermission();
  await connectNow.launchJumpstarterStartPage();
  await connectNow.navigateToConnectNow();
  await connectNow.smokeVerifyICabExperience('28246');
  tcStatus_36490 = 'Passed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100018', '36490', tcStatus_36490);
  logBoundary('Completed test: Connect Now Smoke - Verify Virtual Designer experience');
});

// TestCaseId: 37800 - Connect Now Smoke - Verify TraVek direct experience
test('Connect Now Smoke - Verify TraVek direct experience(TestCaseId:37800)', async ({ page, request }) => {
  test.setTimeout(90000);
  logBoundary('Starting test: Connect Now Smoke - Verify TraVek direct experience');
  const authHelper = new AuthHelper(request);
  var tcStatus_37800 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100019', '37800', tcStatus_37800);
  const connectNow = new ConnectNow(page);
  await connectNow.denyBrowserLocationPermission();
  await connectNow.launchJumpstarterStartPage();
  await connectNow.navigateToConnectNow();
  await connectNow.smokeVerifyTraVekExperience('85307');
  tcStatus_37800 = 'Passed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100019', '37800', tcStatus_37800);
  logBoundary('Completed test: Connect Now Smoke - Verify TraVek direct experience');
});

// TestCaseId: 15223 - Jumpstarter - Anonymous user completes all flows then creates account at account wall
test('Jumpstarter - Anonymous user completes all flows then creates account at account wall(TestCaseId:15223)', async ({ page, request }) => {
  test.setTimeout(300000);
  logBoundary('Starting test: Jumpstarter - Anonymous user completes all flows then creates account at account wall');
  const authHelper = new AuthHelper(request);
  var tcStatus_15223 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100020', '15223', tcStatus_15223);
  smokePage = new SmokePage(page);
  await smokePage.launchHomePage();
  const projectID = await smokePage.getProjectID();
  console.log('New ProjectID :' + projectID);
  await smokePage.captureUserDetailsID();

  // Complete all 4 flows as anonymous user (no sign-in)
  await smokePage.completeIceBreakerFlow();
  await smokePage.completeStyleFlow();
  await smokePage.completeDesignFlow();
  await smokePage.completeBudgetFlow('Premium');

  // Account wall - verify modal and click Continue to proceed to account creation
  await expect(page.getByText('Bring your dream kitchen to')).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Create your free account' })).toBeVisible({ timeout: 15000 });

  // Complete account creation from the account wall sign-up flow
  const { status, email } = await smokePage.verifySignInFromAccountWall('07080');
  tcStatus_15223 = status;

  // Verify landing on consolidated profile page
  await expect(page).toHaveURL(/remodel\/profile/, { timeout: 30000 });

  // Cleanup
  await smokePage.deleteUser(request, email);
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100020', '15223', tcStatus_15223);
  logBoundary('Completed test: Jumpstarter - Anonymous user completes all flows then creates account at account wall');
});

}); // end 'SmokePage - parallel test cases' describe block

// Tear down: complete the test report run for the plan
test('Complete Test Report Run for Test Plan', async ({ request }) => {
  const authHelper = new AuthHelper(request);
  await authHelper.patchToCompleteTestRunRequest(fs.readFileSync('temp-id.txt', 'utf8'));
  console.log("Completed Test Result Update for SmokePage");
});