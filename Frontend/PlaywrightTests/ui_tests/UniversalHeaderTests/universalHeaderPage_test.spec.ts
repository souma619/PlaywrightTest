import { test, expect, Page, Route } from '@playwright/test';
import UniversalHeaderPage from '../../ui_pages/UniversalHeaderPage.ts';
import ConnectNow from '../../ui_pages/ConnectNow';
import AuthHelper from '../../helpers/api-helpers';
import fs from 'fs';

const planId = '15124';
const suiteId = '38816';

const universalHeaderPagePointsTCMap = new Map();
universalHeaderPagePointsTCMap.set(6992, 38817);
universalHeaderPagePointsTCMap.set(6993, 38818);
universalHeaderPagePointsTCMap.set(6994, 38819);
universalHeaderPagePointsTCMap.set(6995, 38820);

test.describe.configure({ mode: 'default' });
let universalHeaderPage: UniversalHeaderPage;
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

const disableTelemetryForTest = async (page: Page) => {
  const telemetryUrlPattern = /amplitude|session-replay|engagement|analytics|guides-and-surveys/i;

  await page.context().route('**/*', async (route: Route) => {
    const request = route.request();
    if (!telemetryUrlPattern.test(request.url())) {
      await route.continue();
      return;
    }

    const isScript = request.resourceType() === 'script';
    await route.fulfill({
      // Use 200 when providing a body; 204 responses must not include one.
      status: 200,
      contentType: isScript ? 'application/javascript' : 'application/json',
      body: isScript ? '' : '{}'
    });
  });

  await page.addInitScript(() => {
    const telemetryUrlPattern = /amplitude|session-replay|engagement|analytics|guides-and-surveys/i;
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);
      if (telemetryUrlPattern.test(url)) {
        return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
      }

      return originalFetch(input, init);
    };

    if (navigator.sendBeacon) {
      const originalSendBeacon = navigator.sendBeacon.bind(navigator);
      navigator.sendBeacon = (url, data) => telemetryUrlPattern.test(String(url)) || originalSendBeacon(url, data);
    }
  });
};

// Setup: create test report run ID for test plan
test('Create Test Report Run ID for Test Plan', async ({ request }) => {
  const authHelper = new AuthHelper(request);
  runId = await authHelper.getPointsIDforTestPlanTestSuite(universalHeaderPagePointsTCMap, planId, 'UniversalHeaderPage');
  fs.writeFileSync('temp-id.txt', runId.toString());
  console.log("Test Result Report ID:" + runId);
});

// TestCaseId: 38817 - Homepage Universal Header - Navigation Validation
test('Homepage Universal Header - Navigation Validation(TestCaseId:38817)', async ({ page, request }) => {
  test.setTimeout(1220000);
  try {
    logBoundary("Starting test: Homepage Universal Header - Navigation Validation");
    const authHelper = new AuthHelper(request);
    var tcStatus_38817 = 'Failed';
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '38817', tcStatus_38817);
    //load UI
    await disableTelemetryForTest(page);
    universalHeaderPage = new UniversalHeaderPage(page);
    await universalHeaderPage.launchKRJPage();
    const projectID = await universalHeaderPage.getProjectID();
    console.log("New ProjectID :" + projectID);
    // ✅ Destructure both status and email from verifySignIn
    await universalHeaderPage.captureUserDetailsID();
    await universalHeaderPage.launchNewHomePage();
    tcStatus_38817 = await universalHeaderPage.verifyUniversalHeadersAreDisplayed();
    //const { status, email } = await universalHeaderPage.verifySignIn("07080");
    // ✅ Pass email into deleteUser
    //await universalHeaderPage.deleteUser(request, email);
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100000', '38817', tcStatus_38817);
    logBoundary("Completed test: Homepage Universal Header - Navigation Validation");
  } finally {
    // Explicitly close page with timeout guard to avoid teardown hangs.
    await closePageSafely(page);
  }
});

// TestCaseId: 38818 - Blog Universal Header - Navigation Validation
test('Blog Universal Header - Navigation Validation(TestCaseId:38818)', async ({ page, request }) => {
  test.setTimeout(980000);
  try {
    logBoundary("Starting test: Blog Universal Header - Navigation Validation");
    const authHelper = new AuthHelper(request);
    var tcStatus_38818 = 'Failed';
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100001', '38818', tcStatus_38818);
    //load UI
    await disableTelemetryForTest(page);
    universalHeaderPage = new UniversalHeaderPage(page);
    await universalHeaderPage.launchKRJPage();
    const projectID = await universalHeaderPage.getProjectID();
    console.log("New ProjectID :" + projectID);
    // ✅ Destructure both status and email from verifySignIn
    await universalHeaderPage.captureUserDetailsID();
    await universalHeaderPage.launchBlogPage();
    tcStatus_38818 = await universalHeaderPage.verifyUniversalHeadersAreDisplayed();
    //const { status, email } = await universalHeaderPage.verifySignIn("07080");
    // ✅ Pass email into deleteUser
    //await universalHeaderPage.deleteUser(request, email);
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100001', '38818', tcStatus_38818);
    logBoundary("Completed test: Blog Universal Header - Navigation Validation");
  } finally {
    await closePageSafely(page);
  }
});

// TestCaseId: 38819 - Expert Support Universal Header - Navigation Validation
test('Expert Support Universal Header - Navigation Validation(TestCaseId:38819)', async ({ page, request }) => {
  test.setTimeout(980000);
  try {
    logBoundary("Starting test: Expert Support Universal Header - Navigation Validation");
    const authHelper = new AuthHelper(request);
    var tcStatus_38819 = 'Failed';
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100002', '38819', tcStatus_38819);
    //load UI
    await disableTelemetryForTest(page);
    universalHeaderPage = new UniversalHeaderPage(page);
    await universalHeaderPage.launchKRJPage();
    const projectID = await universalHeaderPage.getProjectID();
    console.log("New ProjectID :" + projectID);
    // ✅ Destructure both status and email from verifySignIn
    await universalHeaderPage.captureUserDetailsID();
    await universalHeaderPage.launchExpertSupportPage();
    tcStatus_38819 = await universalHeaderPage.verifyUniversalHeadersAreDisplayed();
    //const { status, email } = await universalHeaderPage.verifySignIn("07080");
    // ✅ Pass email into deleteUser
    //await universalHeaderPage.deleteUser(request, email);
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100002', '38819', tcStatus_38819);
    logBoundary("Completed test: Expert Support Universal Header - Navigation Validation");
  } finally {
    await closePageSafely(page);
  }
});


// TestCaseId: 38820 - Vision Universal Header - Navigation Validation
test('Vision Universal Header - Navigation Validation(TestCaseId:38820)', async ({ page, request }) => {
  test.setTimeout(1800000);
  try {
    logBoundary("Starting test: Vision Universal Header - Navigation Validation");
    const authHelper = new AuthHelper(request);
    var tcStatus_38820 = 'Failed';
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100003', '38820', tcStatus_38820);
    //load UI
    universalHeaderPage = new UniversalHeaderPage(page);
    await universalHeaderPage.launchKRJPage();
    const projectID = await universalHeaderPage.getProjectID();
    console.log("New ProjectID :" + projectID);
    // ✅ Destructure both status and email from verifySignIn
    await universalHeaderPage.captureUserDetailsID();
    await universalHeaderPage.launchVisionPage();
    tcStatus_38820 = await universalHeaderPage.verifyUniversalHeadersAreDisplayed();
    //const { status, email } = await universalHeaderPage.verifySignIn("07080");
    // ✅ Pass email into deleteUser
    //await universalHeaderPage.deleteUser(request, email);
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100003', '38820', tcStatus_38820);
    logBoundary("Completed test: Vision Universal Header - Navigation Validation");
  } finally {
    // Explicitly close page with timeout guard to avoid teardown hangs.
    await closePageSafely(page);
  }
});

// Tear down: complete the test report run for the plan
test('Complete Test Report Run for Test Plan', async ({ request }) => {
  const authHelper = new AuthHelper(request);
  await authHelper.patchToCompleteTestRunRequest(fs.readFileSync('temp-id.txt', 'utf8'));
  console.log("Completed Test Result Update for UniversalHeaderPage");
});
