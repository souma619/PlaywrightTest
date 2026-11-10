import { test, expect } from '@playwright/test';
import ConsolidatedProfilePage from '../../ui_pages/ConsolidatedProfilePage'
import SmokePage from '../../ui_pages/SmokePage.ts';
import AuthHelper from '../../helpers/api-helpers';

let consolidateProfilePage: ConsolidatedProfilePage;
let smokePage: SmokePage;

const logBoundary = (message: string) => {
  const prefix = '>'.repeat(11);
  const suffix = '<'.repeat(10);
  console.log(prefix + message + suffix);
};
test('Consolidated Profile - EDGE CASE - edit profile (zip code)(TestCaseId:15492)', async ({ page, request }) => {
  test.setTimeout(300000);
  logBoundary("Starting test: Consolidated Profile - EDGE CASE - edit profile (zip code)");
  //load UI
  const authHelper = new AuthHelper(request);
  consolidateProfilePage = new ConsolidatedProfilePage(page);
  smokePage = new SmokePage(page);
  await smokePage.launchHomePage();
  const projectID = await smokePage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await smokePage.captureUserDetailsID();
  const { status, email } = await smokePage.verifySignInExistingAccount("02018");
  const { projectId: oldProjectID, userId: oldUserID } = await smokePage.getProjectOldID();
  console.log("Old ProjectID :" + oldProjectID);
  console.log("Old UserID :" + oldUserID);
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  await consolidateProfilePage.verifyEgdeCaseEditProfile('Premium');
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);

  logBoundary("Completed test: Consolidated Profile - EDGE CASE - edit profile (zip code)");
});

test('Consolidated Profile - Verify brands for Custom cabinets(TestCaseId:15310)', async ({ page, request }) => {
  test.setTimeout(240000);
  const authHelper = new AuthHelper(request);
  consolidateProfilePage = new ConsolidatedProfilePage(page);
  smokePage = new SmokePage(page);
  await smokePage.launchHomePage();
  const projectID = await smokePage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await smokePage.captureUserDetailsID();
  const { status, email } = await smokePage.verifySignInExistingAccount("02018");
  const { projectId: oldProjectID, userId: oldUserID } = await smokePage.getProjectOldID();
  console.log("Old ProjectID :" + oldProjectID);
  console.log("Old UserID :" + oldUserID);
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  await consolidateProfilePage.verifyBrandsForCustomCabinet('Premium');
  await authHelper.updateProjectProfileAPIIDToDefault(oldProjectID, oldUserID);
  await authHelper.updateInterviewAPIIDsToDefault(oldProjectID);
  logBoundary("Completed test: Consolidated Profile - Verify brands for Custom cabinets");
});

