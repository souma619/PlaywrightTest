import { test, expect, Page } from '@playwright/test';
import StyleQuizPage from '../../ui_pages/StyleQuizPage.ts';
import AuthHelper from '../../helpers/api-helpers';
import fs from 'fs';

const planId = '15124';

// TODO: Replace placeholder point IDs below with the actual ADO point IDs for this test suite.
const styleQuizPagePointsTCMap = new Map();
styleQuizPagePointsTCMap.set(100010, 38933);
styleQuizPagePointsTCMap.set(100011, 38938);
styleQuizPagePointsTCMap.set(100012, 38939);
styleQuizPagePointsTCMap.set(100013, 38940);
styleQuizPagePointsTCMap.set(100014, 38941);

test.describe.configure({ mode: 'default' });
let styleQuizPage: StyleQuizPage;
let runId;

const logBoundary = (message: string) => {
  const prefix = '>'.repeat(11);
  const suffix = '<'.repeat(10);
  console.log(prefix + message + suffix);
};

const closePageSafely = async (page: Page, timeoutMs = 10000) => {
  try {
    await Promise.race([
      page.close({ runBeforeUnload: false }),
      new Promise<void>(resolve => setTimeout(resolve, timeoutMs))
    ]);
  } catch (error) {
    console.warn(`Safe page close failed: ${String(error)}`);
  }
};

// Setup: create test report run ID for test plan
test('Create Test Report Run ID for Test Plan', async ({ request }) => {
  const authHelper = new AuthHelper(request);
  runId = await authHelper.getPointsIDforTestPlanTestSuite(styleQuizPagePointsTCMap, planId, 'StyleQuizPage');
  fs.writeFileSync('temp-id.txt', runId.toString());
  console.log("Test Result Report ID:" + runId);
});

// TestCaseId: 38933 - Style Quiz - Verify Style Quiz Navigation and Questions
test('Style Quiz - Verify Style Quiz Navigation and Questions(TestCaseId:38933)', async ({ page, request }) => {
  test.setTimeout(1220000);
  try {
    logBoundary("Starting test: Style Quiz - Verify Style Quiz Navigation and Questions");
    const authHelper = new AuthHelper(request);
    var tcStatus_38933 = 'Failed';
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100010', '38933', tcStatus_38933);
    styleQuizPage = new StyleQuizPage(page);
    tcStatus_38933 = await styleQuizPage.verifyStyleQuizNavigationAndQuestions();
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100010', '38933', tcStatus_38933);
    logBoundary("Completed test: Style Quiz - Verify Style Quiz Navigation and Questions");
  } finally {
    await closePageSafely(page);
  }
});

// TestCaseId: 38938 - Style Quiz - Verify Answer Selection and Corresponding Image Highlight
test('Style Quiz - Verify Answer Selection and Corresponding Image Highlight(TestCaseId:38938)', async ({ page, request }) => {
  test.setTimeout(980000);
  try {
    logBoundary("Starting test: Style Quiz - Verify Answer Selection and Corresponding Image Highlight");
    const authHelper = new AuthHelper(request);
    var tcStatus_38938 = 'Failed';
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100011', '38938', tcStatus_38938);
    styleQuizPage = new StyleQuizPage(page);
    tcStatus_38938 = await styleQuizPage.verifyAnswerSelectionAndImageHighlight();
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100011', '38938', tcStatus_38938);
    logBoundary("Completed test: Style Quiz - Verify Answer Selection and Corresponding Image Highlight");
  } finally {
    await closePageSafely(page);
  }
});

// TestCaseId: 38939 - Style Quiz - Verify Next and Previous Navigation
test('Style Quiz - Verify Next and Previous Navigation(TestCaseId:38939)', async ({ page, request }) => {
  test.setTimeout(980000);
  try {
    logBoundary("Starting test: Style Quiz - Verify Next and Previous Navigation");
    const authHelper = new AuthHelper(request);
    var tcStatus_38939 = 'Failed';
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100012', '38939', tcStatus_38939);
    styleQuizPage = new StyleQuizPage(page);
    tcStatus_38939 = await styleQuizPage.verifyNextAndPreviousNavigation();
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100012', '38939', tcStatus_38939);
    logBoundary("Completed test: Style Quiz - Verify Next and Previous Navigation");
  } finally {
    await closePageSafely(page);
  }
});

// TestCaseId: 38940 - Style Quiz - Verify Style Match Based on Selected Answers
test('Style Quiz - Verify Style Match Based on Selected Answers(TestCaseId:38940)', async ({ page, request }) => {
  test.setTimeout(980000);
  try {
    logBoundary("Starting test: Style Quiz - Verify Style Match Based on Selected Answers");
    const authHelper = new AuthHelper(request);
    var tcStatus_38940 = 'Failed';
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100013', '38940', tcStatus_38940);
    styleQuizPage = new StyleQuizPage(page);
    tcStatus_38940 = await styleQuizPage.verifyStyleMatchBasedOnAnswers();
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100013', '38940', tcStatus_38940);
    logBoundary("Completed test: Style Quiz - Verify Style Match Based on Selected Answers");
  } finally {
    await closePageSafely(page);
  }
});

// TestCaseId: 38941 - Style Quiz - Verify Style Quiz Retains Answers When Navigating Back
test('Style Quiz - Verify Style Quiz Retains Answers When Navigating Back(TestCaseId:38941)', async ({ page, request }) => {
  test.setTimeout(980000);
  try {
    logBoundary("Starting test: Style Quiz - Verify Style Quiz Retains Answers When Navigating Back");
    const authHelper = new AuthHelper(request);
    var tcStatus_38941 = 'Failed';
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100014', '38941', tcStatus_38941);
    styleQuizPage = new StyleQuizPage(page);
    tcStatus_38941 = await styleQuizPage.verifyRetainsAnswersWhenNavigatingBack();
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100014', '38941', tcStatus_38941);
    logBoundary("Completed test: Style Quiz - Verify Style Quiz Retains Answers When Navigating Back");
  } finally {
    await closePageSafely(page);
  }
});

// Tear down: complete the test report run for the plan
test('Complete Test Report Run for Test Plan', async ({ request }) => {
  const authHelper = new AuthHelper(request);
  await authHelper.patchToCompleteTestRunRequest(fs.readFileSync('temp-id.txt', 'utf8'));
  console.log("Completed Test Result Update for StyleQuizPage");
});
