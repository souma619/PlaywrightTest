import { test, expect } from '@playwright/test';
import DesignPage from '../../ui_pages/DesignPage.ts';
import AuthHelper from '../../helpers/api-helpers';
import fs from 'fs';

const logBoundary = (message: string) => {
  const prefix = '>'.repeat(11);
  const suffix = '<'.repeat(10);
  console.log(prefix + message + suffix);
};

const planId='15124';
const suiteId='15295';
const designPagePointsTCMap =new Map();
designPagePointsTCMap.set(348, 15205);
designPagePointsTCMap.set(370, 15207);
designPagePointsTCMap.set(371, 15208);
designPagePointsTCMap.set(372, 15209);
designPagePointsTCMap.set(373, 15210);
designPagePointsTCMap.set(374, 15212);
designPagePointsTCMap.set(375, 15214);
designPagePointsTCMap.set(378, 15219);
designPagePointsTCMap.set(379, 15220);
designPagePointsTCMap.set(382, 15224);
designPagePointsTCMap.set(502, 15489);
designPagePointsTCMap.set(503, 15490);
designPagePointsTCMap.set(504, 15491);
designPagePointsTCMap.set(505, 15493);
designPagePointsTCMap.set(3356, 17481);
designPagePointsTCMap.set(6393, 30382);
designPagePointsTCMap.set(6394, 30384);

test.describe.configure({mode:'default'});
let designPage: DesignPage;
let runId ;

test('Create Test Report Run ID for Test Plan', async ({ request }) => {
  const authHelper = new AuthHelper(request);
  runId = await authHelper.getPointsIDforTestPlanTestSuite(designPagePointsTCMap, planId, 'Design');
  fs.writeFileSync('temp-id.txt', runId.toString());
  console.log("Test Result Report ID:" + runId);
});

test('Design - Verify the Intro Text Boxes before the Question 1(TestCaseId:15205)', async ({ page, request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Design - Verify the Intro Text Boxes before the Question 1");
  const authHelper = new AuthHelper(request);
  var tcStatus_15205 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15205', tcStatus_15205);
  //load UI
  designPage = new DesignPage(page);
  await designPage.launchHomePage();
  tcStatus_15205 =await designPage.verifyDesignIntroTextBoxes();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15205', tcStatus_15205);
  logBoundary("Completed test: Design - Verify the Intro Text Boxes before the Question 1");
});


test('Design - Verify kitchen design question 1(TestCaseId:15207)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Design - Verify kitchen design question 1");
  const authHelper = new AuthHelper(request);
  var tcStatus_15207 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15207', tcStatus_15207);
  //load UI
  designPage = new DesignPage(page);
  await designPage.launchHomePage();
  tcStatus_15207=await designPage.verifyDesignQuestion1();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15207', tcStatus_15207);
  logBoundary("Completed test: Design - Verify kitchen design question 1");
});

test('Design - Verify kitchen design question 2(TestCaseId:15208)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Design - Verify kitchen design question 2");
  const authHelper = new AuthHelper(request);
  var tcStatus_15208 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15208', tcStatus_15208);
  //load UI
  designPage = new DesignPage(page);
  await designPage.launchHomePage();
  tcStatus_15208=await designPage.verifyDesignQuestion2();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15208', tcStatus_15208);
  logBoundary("Completed test: Design - Verify kitchen design question 2");
});

test('Design - Verify kitchen design question 3(TestCaseId:15209)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Design - Verify kitchen design question 3");
  const authHelper = new AuthHelper(request);
  var tcStatus_15209 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15209', tcStatus_15209);
  //load UI
  designPage = new DesignPage(page);
  await designPage.launchHomePage();
  tcStatus_15209=await designPage.verifyDesignQuestion3();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15209', tcStatus_15209);
  logBoundary("Completed test: Design - Verify kitchen design question 3");
});

test('Design - Verify kitchen design question 4(TestCaseId:17481)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Design - Verify kitchen design question 4");
  const authHelper = new AuthHelper(request);
  var tcStatus_17481 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '17481', tcStatus_17481);
  //load UI
  designPage = new DesignPage(page);
  await designPage.launchHomePage();
  tcStatus_17481=await designPage.verifyDesignQuestion4();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '17481', tcStatus_17481);
  logBoundary("Completed test: Design - Verify kitchen design question 4");
});

test('Design - Verify kitchen activities and features(TestCaseId:15210)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Design - Verify kitchen activities and features");
  const authHelper = new AuthHelper(request);
  var tcStatus_15210 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15210', tcStatus_15210);
  //load UI
  designPage = new DesignPage(page);
  await designPage.launchHomePage();
  tcStatus_15210=await designPage.verifyDesignActivities();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15210', tcStatus_15210);
  logBoundary("Completed test: Design - Verify kitchen activities and features");
});

test('Design - Verify storage solutions(TestCaseId:15212)', async ({ page, request }) => {
  test.setTimeout(90000);
  logBoundary("Starting test: Design - Verify storage solutions");
  const authHelper = new AuthHelper(request);
  var tcStatus_15212 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15212', tcStatus_15212);
  //load UI
  designPage = new DesignPage(page);
  await designPage.launchHomePage();
  tcStatus_15212=await designPage.verifyDesignStorageSolutions();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15212', tcStatus_15212);
  logBoundary("Completed test: Design - Verify storage solutions");
});

test('Design - Verify the cabinets page(TestCaseId:15214)', async ({ page, request }) => {
  test.setTimeout(90000);
  logBoundary("Starting test: Design - Verify the cabinets page");
  const authHelper = new AuthHelper(request);
  var tcStatus_15214 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15214', tcStatus_15214);
  //load UI
  designPage = new DesignPage(page);
  await designPage.launchHomePage();
  tcStatus_15214=await designPage.verifyDesignCabinetIsNotDisplayed();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15214', tcStatus_15214);
  logBoundary("Completed test: Design - Verify the cabinets page");
});

test('Design - Verify design profile banner content(TestCaseId:15219)', async ({ page, request }) => {
  test.setTimeout(90000);
  logBoundary("Starting test: Design - Verify design profile banner content");
  const authHelper = new AuthHelper(request);
  var tcStatus_15219 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15219', tcStatus_15219);
  //load UI
  designPage = new DesignPage(page);
  await designPage.launchHomePage();
  tcStatus_15219=await designPage.verifyDesignProfileBanner();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15219', tcStatus_15219);
  logBoundary("Completed test: Design - Verify design profile banner content");
});

test('Design - Verify design profile "My activities and features:"(TestCaseId:15220)', async ({ page, request }) => {
  test.setTimeout(90000);
  logBoundary("Starting test: Design - Verify design profile \"My activities and features:\"");
  const authHelper = new AuthHelper(request);
  var tcStatus_15220 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15220', tcStatus_15220);
  //load UI
  designPage = new DesignPage(page);
  await designPage.launchHomePage();
  tcStatus_15220=await designPage.verifyDesignMyActivities();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15220', tcStatus_15220);
  logBoundary("Completed test: Design - Verify design profile \"My activities and features:\"");
});

test('Design - Verify design profile "Start Design Profile over" button(TestCaseId:15224)', async ({ page, request }) => {
  test.setTimeout(90000);
  logBoundary("Starting test: Design - Verify design profile \"Start Design Profile over\" button");
  const authHelper = new AuthHelper(request);
  var tcStatus_15224 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15224', tcStatus_15224);
  //load UI
  designPage = new DesignPage(page);
  await designPage.launchHomePage();
  tcStatus_15224=await designPage.verifyDesignCabinetIsNotDisplayed();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15224', tcStatus_15224);
  logBoundary("Completed test: Design - Verify design profile \"Start Design Profile over\" button");
});

test('Design - Verify design profile "My current kitchen:"(TestCaseId:15489)', async ({ page, request }) => {
  test.setTimeout(90000);
  logBoundary("Starting test: Design - Verify design profile \"My current kitchen:\"");
  const authHelper = new AuthHelper(request);
  var tcStatus_15489 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15489', tcStatus_15489);
  //load UI
  designPage = new DesignPage(page);
  await designPage.launchHomePage();
  tcStatus_15489=await designPage.verifyDesignCabinetIsNotDisplayed();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15489', tcStatus_15489);
  logBoundary("Completed test: Design - Verify design profile \"My current kitchen:\"");
});

test('Design - Verify design profile "You said you want to remodel your kitchen because:"(TestCaseId:15490)', async ({ page, request }) => {
  test.setTimeout(90000);
  logBoundary("Starting test: Design - Verify design profile \"You said you want to remodel your kitchen because:\"");
  const authHelper = new AuthHelper(request);
  var tcStatus_15490 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15490', tcStatus_15490);
  //load UI
  designPage = new DesignPage(page);
  await designPage.launchHomePage();
  tcStatus_15490=await designPage.verifyDesignCabinetIsNotDisplayed();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15490', tcStatus_15490);
  logBoundary("Completed test: Design - Verify design profile \"You said you want to remodel your kitchen because:\"");
});

test('Design - Verify design profile "My storage and organization priorities:"(TestCaseId:15491)', async ({ page, request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Design - Verify design profile \"My storage and organization priorities:\"");
  const authHelper = new AuthHelper(request);
  var tcStatus_15491 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15491', tcStatus_15491);
  //load UI
  designPage = new DesignPage(page);
  await designPage.launchHomePage();
  tcStatus_15491=await designPage.verifyDesignCabinetIsNotDisplayed();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15491', tcStatus_15491);
  logBoundary("Completed test: Design - Verify design profile \"My storage and organization priorities:\"");
});

test('Design - EDGE CASE - edit profile(TestCaseId:15493)', async ({ page, request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Design - EDGE CASE - edit profile");
  const authHelper = new AuthHelper(request);
  var tcStatus_15493 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15493', tcStatus_15493);
  //load UI
  designPage = new DesignPage(page);
  await designPage.launchHomePage();
  tcStatus_15493=await designPage.verifyDesignCabinetIsNotDisplayed();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15493', tcStatus_15493);
  logBoundary("Completed test: Design - EDGE CASE - edit profile");
});


test('Complete Test Report Run for Test Plan', async ({ request }) => {
  const authHelper = new AuthHelper(request);
  await authHelper.patchToCompleteTestRunRequest(fs.readFileSync('temp-id.txt', 'utf8'));
  console.log("Completed Test Result Update for DesignPage");
});