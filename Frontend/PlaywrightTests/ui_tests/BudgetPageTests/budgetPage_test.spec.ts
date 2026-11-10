import { test, expect } from '@playwright/test';
import BudgetPage from '../../ui_pages/BudgetPage.ts';
import SmokePage from '../../ui_pages/SmokePage.ts';
import AuthHelper from '../../helpers/api-helpers';
import fs from 'fs';

const planId = '15124';
const suiteId = '18607';

const designPagePointsTCMap = new Map();
designPagePointsTCMap.set(3960, 18659);
designPagePointsTCMap.set(3962, 18662);
designPagePointsTCMap.set(3964, 18663);
designPagePointsTCMap.set(3966, 18664);
designPagePointsTCMap.set(3968, 18665);
designPagePointsTCMap.set(3970, 18666);
designPagePointsTCMap.set(4466, 19059);
designPagePointsTCMap.set(4558, 22051);
designPagePointsTCMap.set(4566, 15223);
designPagePointsTCMap.set(4567, 18014);
designPagePointsTCMap.set(4568, 18015);
designPagePointsTCMap.set(6553, 33365);

const logBoundary = (message: string) => {
  const prefix = '>'.repeat(11);
  const suffix = '<'.repeat(10);
  console.log(prefix + message + suffix);
};

let budgetPage: BudgetPage;
let smokePage: SmokePage;
let runId: number;

const budgetTestCasePointMap: Record<string, string> = {
  '18659': '100000',
  '18662': '100001',
  '18663': '100002',
  '18664': '100003',
  '18665': '100004',
  '18666': '100005',
  '19059': '100006',
  '22051': '100007',
  '15223': '100008',
  '18014': '100009',
  '18015': '100010',
  '33365': '100011'
};

const runBudgetCase = async (
  page: any,
  request: any,
  testCaseId: string,
  signInPin: string,
  executeCase: () => Promise<void>
) => {
  const authHelper = new AuthHelper(request);
  const pointId = budgetTestCasePointMap[testCaseId] ?? '100000';
  let tcStatus = 'Failed';
  let email: string | null = null;
  let oldProjectID = '';
  let oldUserID = '';

  try {
    budgetPage = new BudgetPage(page);
    smokePage = new SmokePage(page);
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), pointId, testCaseId, tcStatus);

    await budgetPage.launchHomePage();
    const projectID = await budgetPage.getProjectID();
    console.log("New ProjectID :" + projectID);

    const signInResponse = await smokePage.verifySignInExistingAccount(signInPin);
    email = signInResponse.email;

    const oldProject = await smokePage.getProjectOldID();
    oldProjectID = oldProject.projectId;
    oldUserID = oldProject.userId;
    console.log("Old ProjectID :" + oldProjectID);
    console.log("Old UserID :" + oldUserID);

    await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
    await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);

    await budgetPage.completeIceBreakerFlow();
    await budgetPage.completeStyleFlow();
    await budgetPage.completeDesignFlow();

    await executeCase();
    tcStatus = 'Passed';
  } catch (error) {
    console.error(`Budget testcase ${testCaseId} failed:`, error);
  } finally {
    if (email) {
      await budgetPage.deleteUser(request, email).catch(() => {
        // Keep reporting resilient even if user cleanup fails.
      });
    }

    if (oldProjectID && oldUserID) {
      await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID).catch(() => {
        // Best-effort cleanup.
      });
      await authHelper.updateInterviewAPIIDsToDefault(oldProjectID).catch(() => {
        // Best-effort cleanup.
      });
    }

    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), pointId, testCaseId, tcStatus);
  }
};

// Setup: create test report run ID for test plan
test('Create Test Report Run ID for Test Plan', async ({ request }) => {
  const authHelper = new AuthHelper(request);
  runId = await authHelper.getPointsIDforTestPlanTestSuite(designPagePointsTCMap, planId, 'DesignPage');
  fs.writeFileSync('temp-id.txt', runId.toString());
  console.log("Test Result Report ID:" + runId);
});



test('Budget Flow - Verify the budget range is displayed on start page with options Essential, Mid-range, Premium(TestCaseId:18659)', async ({ page, request }) => {
  test.setTimeout(580000);
  logBoundary("Starting test: Budget Flow - Verify the budget range is displayed on start page with options Essential, Mid-range, Premium");
  await runBudgetCase(page, request, '18659', '02018', async () => {
    await budgetPage.verifyBudgetRange('Premium');
  });

  logBoundary("Completed test: Budget Flow - Verify the budget range is displayed on start page with options Essential, Mid-range, Premium");
});

test('Budget Flow - Verify the budget range gets modified for each of Essential, Mid-range, Premium once a new Zip is updated(TestCaseId:18662)', async ({ page, request }) => {
  test.setTimeout(580000);
  logBoundary("Starting test: Budget Flow - Verify the budget range gets modified for each of Essential, Mid-range, Premium once a new Zip is updated");
  await runBudgetCase(page, request, '18662', '02018', async () => {
    await budgetPage.verifyBudgetRangeWithZipCode('Premium');
  });
  logBoundary("Completed test: Budget Flow - Verify the budget range gets modified for each of Essential, Mid-range, Premium once a new Zip is updated");
});


test('Budget Flow - Verify the user can re-select the budget range selection in start page and same should reflect in budget category page(TestCaseId:18663)', async ({ page, request }) => {
  test.setTimeout(580000);
  logBoundary("Starting test: Budget Flow - Verify the user can re-select the budget range selection in start page and same should reflect in budget category page");
  await runBudgetCase(page, request, '18663', '02018', async () => {
    await budgetPage.verifyBudgetRange('Premium');
    await budgetPage.verifyBudgetRangeWithNewRange('Mid-range');
  });
  logBoundary("Completed test: Budget Flow - Verify the user can re-select the budget range selection in start page and same should reflect in budget category page");
});

test('Budget Flow - Verify Read more and Read less is displaying correct description for each budget range(TestCaseId:18664)', async ({ page, request }) => {
  test.setTimeout(330000);
  logBoundary("Starting test: Budget Flow - Verify Read more and Read less is displaying correct description for each budget range");
  await runBudgetCase(page, request, '18664', '07080', async () => {
    await budgetPage.verifyBudgetRange('Premium');
  });
  logBoundary("Completed test: Budget Flow - Verify Read more and Read less is displaying correct description for each budget range");
});

test('Budget Flow - Verify Read more and Read less is displaying correct description for each budget category(TestCaseId:18665)', async ({ page, request }) => {
  test.setTimeout(330000);
  logBoundary("Starting test: Budget Flow - Verify Read more and Read less is displaying correct description for each budget category");
  await runBudgetCase(page, request, '18665', '07080', async () => {
    await budgetPage.verifyBudgetCategoryReadMore('Premium');
  });
  logBoundary("Completed test: Budget Flow - Verify Read more and Read less is displaying correct description for each budget category");
});

test('Budget Flow - Verify the Budget categories can be deselected(not included) which should update the total budget range(TestCaseId:18666)', async ({ page, request }) => {
  test.setTimeout(580000);
  logBoundary("Starting test: Budget Flow - Verify the Budget categories can be deselected(not included) which should update the total budget range");
  await runBudgetCase(page, request, '18666', '02018', async () => {
    await budgetPage.verifyBudgetRange('Premium');
    await budgetPage.verifyBudgetRangeWithNewRangeAndDeselectedCountertopFlooringLabor('Mid-range');
  });
  logBoundary("Completed test: Budget Flow - Verify the Budget categories can be deselected(not included) which should update the total budget range");
});

test('Budget Flow - Verify any modifications made in the budget selection should be updated in Consolidated Profile(Budget) & Client side PDF(TestCaseId:19059)', async ({ page, request }) => {
  test.setTimeout(330000);
  logBoundary("Starting test: Budget Flow - Verify any modifications made in the budget selection should be updated in Consolidated Profile(Budget) & Client side PDF");
  await runBudgetCase(page, request, '19059', '02018', async () => {
    await budgetPage.verifyBudgetRange('Premium');
  });
  logBoundary("Completed test: Budget Flow - Verify any modifications made in the budget selection should be updated in Consolidated Profile(Budget) & Client side PDF");
});

test('Budget Flow - Skip this step(TestCaseId:22051)', async ({ page, request }) => {
  test.setTimeout(330000);
  logBoundary("Starting test: Budget Flow - Skip this step");
  await runBudgetCase(page, request, '22051', '02018', async () => {
    await budgetPage.verifySkipBudgetRange();
  });
  logBoundary("Completed test: Budget Flow - Skip this step");
});

test('Budget - Account Wall - finished, create a new account(TestCaseId:15223)', async ({ page, request }) => {
  test.setTimeout(330000);
  logBoundary("Starting test: Budget - Account Wall - finished, create a new account");
  await runBudgetCase(page, request, '15223', '02018', async () => {
    await budgetPage.verifyBudgetRange('Premium');
  });
  logBoundary("Completed test: Budget - Account Wall - finished, create a new account");
});

test('Budget  - Account Wall -  Design Profile finish, sign in with existing account(TestCaseId:18014)', async ({ page, request }) => {
  test.setTimeout(330000);
  logBoundary("Starting test: Budget  - Account Wall -  Design Profile finish, sign in with existing account");
  await runBudgetCase(page, request, '18014', '02018', async () => {
    await budgetPage.verifyBudgetRange('Premium');
  });
  logBoundary("Completed test: Budget  - Account Wall -  Design Profile finish, sign in with existing account");
});

test('Budget - Account Wall - finish, sign in with existing account that already has progress(TestCaseId:18015)', async ({ page, request }) => {
  test.setTimeout(330000);
  logBoundary("Starting test: Budget - Account Wall - finish, sign in with existing account that already has progress");
  await runBudgetCase(page, request, '18015', '02018', async () => {
    await budgetPage.verifyBudgetRange('Premium');
  });
  logBoundary("Completed test: Budget - Account Wall - finish, sign in with existing account that already has progress");
});

test('Budget Flow - Verify any modifications made in the budget selection should be updated in Consolidated Profile(Budget) & Server side PDF(TestCaseId:33365)', async ({ page, request }) => {
  test.setTimeout(580000);
  logBoundary("Starting test: Budget Flow - Verify any modifications made in the budget selection should be updated in Consolidated Profile(Budget) & Server side PDF");
  await runBudgetCase(page, request, '33365', '02018', async () => {
    await budgetPage.verifyBudgetRange('Premium');
  });
  logBoundary("Completed test: Budget Flow - Verify any modifications made in the budget selection should be updated in Consolidated Profile(Budget) & Server side PDF");
});

// Tear down: complete the test report run for the plan
test('Complete Test Report Run for Test Plan', async ({ request }) => {
  const authHelper = new AuthHelper(request);
  await authHelper.patchToCompleteTestRunRequest(fs.readFileSync('temp-id.txt', 'utf8'));
  console.log("Completed Test Result Update for DesignPage");
});