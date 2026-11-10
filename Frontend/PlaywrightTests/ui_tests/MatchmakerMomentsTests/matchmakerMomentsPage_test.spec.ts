import { test, expect } from '@playwright/test';
import MatchmakerMomentsPage from '../../ui_pages/MatchmakerMomentsPage';

const logBoundary = (message: string) => {
  const prefix = '>'.repeat(11);
  const suffix = '<'.repeat(10);
  console.log(prefix + message + suffix);
};

let matchmakerMomentsPage: MatchmakerMomentsPage;
test('MatchMaker Moments - Style ad choice then design and budget, out of wave(TestCaseId:28253)', async ({ page,request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: MatchMaker Moments - Style ad choice then design and budget, out of wave");
  //load UI
  matchmakerMomentsPage = new MatchmakerMomentsPage(page);
  await matchmakerMomentsPage.launchHomePage();
  const projectID=await matchmakerMomentsPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  const { status, email } = await matchmakerMomentsPage.verifySignIn("02018");
  await matchmakerMomentsPage.verifyStyleAdChoiceThenDesignBudgetOutOfWave();
  await matchmakerMomentsPage.deleteUser(request, email);
  
  logBoundary("Completed test: MatchMaker Moments - Style ad choice then design and budget, out of wave");
});

test('MatchMaker Moments - Design ad choice then budget, autoshare(TestCaseId:28256)', async ({ page,request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: MatchMaker Moments - Design ad choice then budget, autoshare");
  //load UI
  matchmakerMomentsPage = new MatchmakerMomentsPage(page);
  await matchmakerMomentsPage.launchHomePage();
  const projectID=await matchmakerMomentsPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  const { status, email } = await matchmakerMomentsPage.verifySignIn("02018");
  await matchmakerMomentsPage.verifyDesignAdChoiceThenDesignBudgetOutOfWave();
  await matchmakerMomentsPage.deleteUser(request, email);
  
  logBoundary("Completed test: MatchMaker Moments - Design ad choice then budget, autoshare");
});

test('MatchMaker Moments - Decline all MatchMaker Options, autoshare(TestCaseId:28259)', async ({ page,request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: MatchMaker Moments - Decline all MatchMaker Options, autoshare");
  //load UI
  matchmakerMomentsPage = new MatchmakerMomentsPage(page);
  await matchmakerMomentsPage.launchHomePage();
  const projectID=await matchmakerMomentsPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  const { status, email } = await matchmakerMomentsPage.verifySignIn("02018");
  await matchmakerMomentsPage.verifyMatchmakerDeclineAllOptions();
  await matchmakerMomentsPage.deleteUser(request, email);
  
  logBoundary("Completed test: MatchMaker Moments - Decline all MatchMaker Options, autoshare");
});

test('MatchMaker Moments - Style ad choice then stops(TestCaseId:28260)', async ({ page,request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: MatchMaker Moments - Style ad choice then stops");
  //load UI
  matchmakerMomentsPage = new MatchmakerMomentsPage(page);
  await matchmakerMomentsPage.launchHomePage();
  const projectID=await matchmakerMomentsPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  const { status, email } = await matchmakerMomentsPage.verifySignIn("02018");
  await matchmakerMomentsPage.verifyStyleAdChoiceThenStops();
  await matchmakerMomentsPage.deleteUser(request, email);
  
  logBoundary("Completed test: MatchMaker Moments - Style ad choice then stops");
});

test('MatchMaker Moments - Design ad choice then stops(TestCaseId:28261)', async ({ page,request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: MatchMaker Moments - Design ad choice then stops");
  //load UI
  matchmakerMomentsPage = new MatchmakerMomentsPage(page);
  await matchmakerMomentsPage.launchHomePage();
  const projectID=await matchmakerMomentsPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  const { status, email } = await matchmakerMomentsPage.verifySignIn("02018");
  await matchmakerMomentsPage.verifyDesignAdChoiceThenStops();
  await matchmakerMomentsPage.deleteUser(request, email);
  
  logBoundary("Completed test: MatchMaker Moments - Design ad choice then stops");
});

