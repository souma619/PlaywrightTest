import { test, expect } from '@playwright/test';
import IceBreakerPage from '../../ui_pages/IceBreakerPage.ts';
import AuthHelper from '../../helpers/api-helpers';
import fs from 'fs';

const logBoundary = (message: string) => {
  const prefix = '>'.repeat(11);
  const suffix = '<'.repeat(10);
  console.log(prefix + message + suffix);
};

const planId = '15124';
const suiteId = '15387';

const iceBreakerPagePointsTCMap = new Map();
iceBreakerPagePointsTCMap.set(468, 15388);
iceBreakerPagePointsTCMap.set(456, 15127);
iceBreakerPagePointsTCMap.set(460, 15133);
iceBreakerPagePointsTCMap.set(458, 15129);
iceBreakerPagePointsTCMap.set(459, 15130);
iceBreakerPagePointsTCMap.set(462, 15135);
iceBreakerPagePointsTCMap.set(463, 15136);
iceBreakerPagePointsTCMap.set(464, 15137);
iceBreakerPagePointsTCMap.set(465, 15138);
iceBreakerPagePointsTCMap.set(466, 15139);
iceBreakerPagePointsTCMap.set(461, 15134);
iceBreakerPagePointsTCMap.set(457, 15128);
iceBreakerPagePointsTCMap.set(5898, 23978);

test.describe.configure({ mode: 'default' });
let iceBreakerPage: IceBreakerPage;
let runId;

test('Create Test Report Run ID for Test Plan', async ({ request }) => {
  const authHelper = new AuthHelper(request);
  runId = await authHelper.getPointsIDforTestPlanTestSuite(iceBreakerPagePointsTCMap, planId, 'IceBreaker');
  fs.writeFileSync('temp-id.txt', runId.toString());
  console.log("Test Result Report ID:" + runId);
});

test('Icebreaker - FAIL CASE - Budget Question 3(TestCaseId:15388)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Icebreaker - FAIL CASE - Budget Question 3");
  const authHelper = new AuthHelper(request);
  var tcStatus_15388 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15388', tcStatus_15388);
  //load UI
  iceBreakerPage = new IceBreakerPage(page);
  await iceBreakerPage.launchHomePage();
  tcStatus_15388 = await iceBreakerPage.verifyFailCaseBudgetQuestion3();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '15388', tcStatus_15388);
  logBoundary("Completed test: Icebreaker - FAIL CASE - Budget Question 3");
});

test('Icebreaker - Verify Ice Breaker page(TestCaseId:15127)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Icebreaker - Verify Ice Breaker page");
  const authHelper = new AuthHelper(request);
  var tcStatus_15127 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100001', '15127', tcStatus_15127);
  //load UI
  iceBreakerPage = new IceBreakerPage(page);
  await iceBreakerPage.launchHomePage();
  tcStatus_15127 = await iceBreakerPage.verifyIceBreakerPage();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100001', '15127', tcStatus_15127);
  logBoundary("Completed test: Icebreaker - Verify Ice Breaker page");
});

test('Icebreaker - Verify Intro Heading and sub-head(TestCaseId:15133)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Icebreaker - Verify Intro Heading and sub-head");
  const authHelper = new AuthHelper(request);
  var tcStatus_15133 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100002', '15133', tcStatus_15133);
  //load UI
  iceBreakerPage = new IceBreakerPage(page);
  await iceBreakerPage.launchHomePage();
  tcStatus_15133 = await iceBreakerPage.verifyIceBreakerPageHeading();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100002', '15133', tcStatus_15133);
  logBoundary("Completed test: Icebreaker - Verify Intro Heading and sub-head");
});

test('Icebreaker - Verify Jumpstarter petal images(TestCaseId:15129)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Icebreaker - Verify Jumpstarter petal images");
  const authHelper = new AuthHelper(request);
  var tcStatus_15129 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100003', '15129', tcStatus_15129);
  //load UI
  iceBreakerPage = new IceBreakerPage(page);
  await iceBreakerPage.launchHomePage();
  tcStatus_15129 = await iceBreakerPage.verifyIceBreakerPagePetalImages();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100003', '15129', tcStatus_15129);
  logBoundary("Completed test: Icebreaker - Verify Jumpstarter petal images");
});

test('Icebreaker - Verify Navigation Bar(TestCaseId:15130)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Icebreaker - Verify Navigation Bar");
  const authHelper = new AuthHelper(request);
  var tcStatus_15130 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100004', '15130', tcStatus_15130);
  //load UI
  iceBreakerPage = new IceBreakerPage(page);
  await iceBreakerPage.launchHomePage();
  tcStatus_15130 = await iceBreakerPage.verifyIceBreakerPageNavigationBar();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100004', '15130', tcStatus_15130);
  logBoundary("Completed test: Icebreaker - Verify Navigation Bar");
});

test('Icebreaker - Verify Question 1(TestCaseId:15135)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Icebreaker - Verify Question 1");
  const authHelper = new AuthHelper(request);
  var tcStatus_15135 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100005', '15135', tcStatus_15135);
  //load UI
  iceBreakerPage = new IceBreakerPage(page);
  await iceBreakerPage.launchHomePage();
  tcStatus_15135 = await iceBreakerPage.verifyIceBreakerPageQuestion1();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100005', '15135', tcStatus_15135);
  logBoundary("Completed test: Icebreaker - Verify Question 1");
});

test('Icebreaker - Verify Question 1 button selection behavior(TestCaseId:15136)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Icebreaker - Verify Question 1 button selection behavior");
  const authHelper = new AuthHelper(request);
  var tcStatus_15136 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100006', '15136', tcStatus_15136);
  //load UI
  iceBreakerPage = new IceBreakerPage(page);
  await iceBreakerPage.launchHomePage();
  tcStatus_15136 = await iceBreakerPage.verifyIceBreakerPageQuestion1NextButtonBehavior();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100006', '15136', tcStatus_15136);
  logBoundary("Completed test: Icebreaker - Verify Question 1 button selection behavior");
});

test('Icebreaker - Verify Question 2(TestCaseId:15137)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Icebreaker - Verify Question 2");
  const authHelper = new AuthHelper(request);
  var tcStatus_15137 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100007', '15137', tcStatus_15137);
  //load UI
  iceBreakerPage = new IceBreakerPage(page);
  await iceBreakerPage.launchHomePage();
  tcStatus_15137 = await iceBreakerPage.verifyIceBreakerPageQuestion2();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100007', '15137', tcStatus_15137);
  logBoundary("Completed test: Icebreaker - Verify Question 2");
});

test('Icebreaker - Verify Question 2 button selection behavior(TestCaseId:15138)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Icebreaker - Verify Question 2 button selection behavior");
  const authHelper = new AuthHelper(request);
  var tcStatus_15138 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100008', '15138', tcStatus_15138);
  //load UI
  iceBreakerPage = new IceBreakerPage(page);
  await iceBreakerPage.launchHomePage();
  tcStatus_15138 = await iceBreakerPage.verifyIceBreakerPageQuestion2NextButtonBehavior();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100008', '15138', tcStatus_15138);
  logBoundary("Completed test: Icebreaker - Verify Question 2 button selection behavior");
});

test('Icebreaker - Verify Question 3(TestCaseId:15139)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Icebreaker - Verify Question 3");
  const authHelper = new AuthHelper(request);
  var tcStatus_15139 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100009', '15139', tcStatus_15139);
  //load UI
  iceBreakerPage = new IceBreakerPage(page);
  await iceBreakerPage.launchHomePage();
  await iceBreakerPage.verifyIceBreakerPageQuestion2NextButtonBehavior();
  tcStatus_15139 = await iceBreakerPage.verifyIceBreakerPageQuestion3NextButtonBehavior();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100009', '15139', tcStatus_15139);
  logBoundary("Completed test: Icebreaker - Verify Question 3");
});

test('Icebreaker - Verify Question 3 button selection behavior(TestCaseId:15134)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Icebreaker - Verify Question 3 button selection behavior");
  const authHelper = new AuthHelper(request);
  var tcStatus_15134 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100010', '15134', tcStatus_15134);
  //load UI
  iceBreakerPage = new IceBreakerPage(page);
  await iceBreakerPage.launchHomePage();
  await iceBreakerPage.verifyIceBreakerPageQuestion2NextButtonBehavior();
  tcStatus_15134 = await iceBreakerPage.verifyIceBreakerPageQuestion3NextButtonBehavior();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100010', '15134', tcStatus_15134);
  logBoundary("Completed test: Icebreaker - Verify Question 3 button selection behavior");
});

test('Icebreaker - Verify Rebode Jumpstarter Logo(TestCaseId:15128)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Icebreaker - Verify Rebode Jumpstarter Logo");
  const authHelper = new AuthHelper(request);
  var tcStatus_15128 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100011', '15128', tcStatus_15128);
  //load UI
  iceBreakerPage = new IceBreakerPage(page);
  await iceBreakerPage.launchHomePage();
  tcStatus_15128 = await iceBreakerPage.verifyIceBreakerPageJumpStarterLogo();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100011', '15128', tcStatus_15128);
  logBoundary("Completed test: Icebreaker - Verify Rebode Jumpstarter Logo");
});

test('Icebreaker - Verify telegraf font(TestCaseId:23978)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Icebreaker - Verify telegraf font");
  const authHelper = new AuthHelper(request);
  var tcStatus_23978 = 'Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100012', '23978', tcStatus_23978);
  //load UI
  iceBreakerPage = new IceBreakerPage(page);
  await iceBreakerPage.launchHomePage();
  tcStatus_23978 = await iceBreakerPage.verifyIceBreakerPageTelegrafFont();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100012', '23978', tcStatus_23978);
  logBoundary("Completed test: Icebreaker - Verify telegraf font");
});

test('Complete Test Report Run for Test Plan', async ({ request }) => {
  const authHelper = new AuthHelper(request);
  await authHelper.patchToCompleteTestRunRequest(fs.readFileSync('temp-id.txt', 'utf8'));
  console.log("Completed Test Result Update for IceBreakerPage");
});