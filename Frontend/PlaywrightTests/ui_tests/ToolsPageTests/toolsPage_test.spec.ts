import { expect, Page, test } from '@playwright/test';
import ToolsPage from '../../ui_pages/ToolsPage';
import StyleQuizPage from '../../ui_pages/StyleQuizPage';
import VirtualDesignerPage from '../../ui_pages/VirtualDesignerPage';
import AuthHelper from '../../helpers/api-helpers';
import fs from 'fs';

const planId = '15124';

// TODO: Replace placeholder point IDs with the actual ADO point IDs for this test suite.
const toolsPagePointsTCMap = new Map();
toolsPagePointsTCMap.set(100015, 39487);
toolsPagePointsTCMap.set(100016, 39488);
toolsPagePointsTCMap.set(100017, 39489);
toolsPagePointsTCMap.set(100018, 39490);
toolsPagePointsTCMap.set(100019, 39491);

test.describe.configure({ mode: 'default' });
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
            new Promise<void>(resolve => setTimeout(resolve, timeoutMs)),
        ]);
    } catch (error) {
        console.warn(`Safe page close failed: ${String(error)}`);
    }
};

test('Create Test Report Run ID for Test Plan', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    runId = await authHelper.getPointsIDforTestPlanTestSuite(toolsPagePointsTCMap, planId, 'ToolsPage');
    fs.writeFileSync('temp-id.txt', runId.toString());
    console.log('Test Result Report ID:' + runId);
});

test('Planning Tools - Verify Planning Tools Page Navigation and Content(TestCaseId:39487)', async ({ page, request }) => {
    test.setTimeout(1220000);
    logBoundary('Starting test: Planning Tools - Verify Planning Tools Page Navigation and Content');
    const authHelper = new AuthHelper(request);
    let tcStatus = 'Failed';
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100015', '39487', tcStatus);
    try {
        const toolsPage = new ToolsPage(page);
        await toolsPage.openFromUniversalHeader();
        tcStatus = 'Passed';
        await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100015', '39487', tcStatus);
    } finally {
        await closePageSafely(page);
        logBoundary('Completed test: Planning Tools - Verify Planning Tools Page Navigation and Content');
    }
});

test('Planning Tools - Verify Planning Tool CTAs Navigation(TestCaseId:39488)', async ({ page, request }) => {
    test.setTimeout(1220000);
    logBoundary('Starting test: Planning Tools - Verify Planning Tool CTAs Navigation');
    const authHelper = new AuthHelper(request);
    let tcStatus = 'Failed';
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100016', '39488', tcStatus);
    try {
        const toolsPage = new ToolsPage(page);
        await toolsPage.openFromUniversalHeader();
        await toolsPage.openBuildMySpace();
        await toolsPage.openToolsPageDirectly();
        await toolsPage.openStartMyPlan();
        await toolsPage.openToolsPageDirectly();
        await toolsPage.openFindMyStyle();
        tcStatus = 'Passed';
        await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100016', '39488', tcStatus);
    } finally {
        await closePageSafely(page);
        logBoundary('Completed test: Planning Tools - Verify Planning Tool CTAs Navigation');
    }
});

test('Planning Tools - Verify Planning Tool Talk with a Designer CTA(TestCaseId:39489)', async ({ page, request }) => {
    test.setTimeout(1220000);
    logBoundary('Starting test: Planning Tools - Verify Planning Tool Talk with a Designer CTA');
    const authHelper = new AuthHelper(request);
    let tcStatus = 'Failed';
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100017', '39489', tcStatus);
    try {
        const toolsPage = new ToolsPage(page);
        await toolsPage.openFromUniversalHeader();
        await toolsPage.verifyHeaderDesignerCta();
        tcStatus = 'Passed';
        await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100017', '39489', tcStatus);
    } finally {
        await closePageSafely(page);
        logBoundary('Completed test: Planning Tools - Verify Planning Tool Talk with a Designer CTA');
    }
});

test('Planning Tools - Verify Completed Style Quiz Status on Tools Page(TestCaseId:39490)', async ({ page, request }) => {
    test.setTimeout(1220000);
    logBoundary('Starting test: Planning Tools - Verify Completed Style Quiz Status on Tools Page');
    const authHelper = new AuthHelper(request);
    let tcStatus = 'Failed';
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100018', '39490', tcStatus);
    try {
        const styleQuizPage = new StyleQuizPage(page);
        const toolsPage = new ToolsPage(page);
        await expect(styleQuizPage.verifyStyleMatchBasedOnAnswers()).resolves.toBe('Passed');
        await toolsPage.openToolsPageDirectly();
        await toolsPage.verifyCompletedStyleCard();
        tcStatus = 'Passed';
        await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100018', '39490', tcStatus);
    } finally {
        await closePageSafely(page);
        logBoundary('Completed test: Planning Tools - Verify Completed Style Quiz Status on Tools Page');
    }
});

test('Planning Tools - Verify Completed Jumpstarter Status on Tools Page(TestCaseId:39491)', async ({ page, request }) => {
    test.setTimeout(360000);
    logBoundary('Starting test: Planning Tools - Verify Completed Jumpstarter Status on Tools Page');
    const authHelper = new AuthHelper(request);
    let tcStatus = 'Failed';
    let email: string | null = null;
    await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100019', '39491', tcStatus);
    try {
        const virtualDesignerPage = new VirtualDesignerPage(page);
        const toolsPage = new ToolsPage(page);
        await virtualDesignerPage.launchHomePage();
        await virtualDesignerPage.getProjectID();
        ({ email } = await virtualDesignerPage.verifySignIn('28246'));
        await virtualDesignerPage.completeIceBreakerFlow();
        await virtualDesignerPage.completeStyleFlow();
        await virtualDesignerPage.completeDesignFlow();
        await virtualDesignerPage.completeBudgetFlow('Premium');
        await toolsPage.openToolsPageDirectly();
        await toolsPage.openCompletedJumpstarterPlan();
        tcStatus = 'Passed';
        await authHelper.patchRequest(fs.readFileSync('temp-id.txt', 'utf8'), '100019', '39491', tcStatus);
    } finally {
        if (email) {
            await new VirtualDesignerPage(page).deleteUser(request, email);
        }
        await closePageSafely(page);
        logBoundary('Completed test: Planning Tools - Verify Completed Jumpstarter Status on Tools Page');
    }
});

test('Complete Test Report Run for Test Plan', async ({ request }) => {
    const authHelper = new AuthHelper(request);
    await authHelper.patchToCompleteTestRunRequest(fs.readFileSync('temp-id.txt', 'utf8'));
    console.log('Completed Test Result Update for ToolsPage');
});