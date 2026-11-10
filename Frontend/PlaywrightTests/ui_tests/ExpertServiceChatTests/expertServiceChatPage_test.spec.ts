
const logBoundary = (message: string) => {
  const prefix = '>'.repeat(11);
  const suffix = '<'.repeat(10);
  console.log(prefix + message + suffix);
};
/*
import { test, expect } from '@playwright/test';
import ExpertServiceChatPage from '../../ui_pages/ExpertServiceChatPage';
import AuthHelper from '../../helpers/api-helpers';
import fs from 'fs';

const planId = '15124';
const suiteId = '16288';

const chatPagePointsTCMap = new Map();
chatPagePointsTCMap.set(632, 16181);
chatPagePointsTCMap.set(633, 16182);
chatPagePointsTCMap.set(634, 16183);
chatPagePointsTCMap.set(635, 16195);
chatPagePointsTCMap.set(636, 16196);
chatPagePointsTCMap.set(637, 16197);
chatPagePointsTCMap.set(638, 16198);
chatPagePointsTCMap.set(639, 16199);
chatPagePointsTCMap.set(640, 16200);
chatPagePointsTCMap.set(641, 16201);
chatPagePointsTCMap.set(642, 16202);
chatPagePointsTCMap.set(643, 16203);
chatPagePointsTCMap.set(644, 16204);
chatPagePointsTCMap.set(3139, 17153);
chatPagePointsTCMap.set(4572, 22565);
chatPagePointsTCMap.set(4575, 22567);
chatPagePointsTCMap.set(4578, 22568);


test.describe.configure({ mode: 'default' });
let expertServiceChatPage: ExpertServiceChatPage;
let runId;


test('Create Test Report Run ID for Test Plan', async ({ request }) => {
  const authHelper = new AuthHelper(request);
  runId = await authHelper.getPointsIDforTestPlanTestSuite(chatPagePointsTCMap, planId, 'ExpertServiceChatPage');
  fs.writeFileSync('temp-id.txt', runId.toString());
  console.log("Test Result Report ID:" + runId);
});


test('Expert Service Chat - Verify that the "Chat now" button becomes visible once the user is logged in.(TestCaseId:16181)', async ({ page, request }) => {
  test.setTimeout(120000);
  const authHelper = new AuthHelper(request);
  var tcStatus_16181 = 'Failed';
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100000, 16181, tcStatus_16181);

  //load UI
  expertServiceChatPage = new ExpertServiceChatPage(page);
  await expertServiceChatPage.deleteUser(request);
  await expertServiceChatPage.launchHomePage();
  const projectID = await expertServiceChatPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await expertServiceChatPage.createUser(request, projectID, "02018");
  tcStatus_16181 =await expertServiceChatPage.verifySignIn();
  tcStatus_16181=await expertServiceChatPage.verifyChatButton();
  await expertServiceChatPage.deleteUser(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100000, 16181, tcStatus_16181);
});

test('Expert Service Chat - Verify the chat window message during the business hours agent is available(TestCaseId:16182)', async ({ page, request }) => {
  test.setTimeout(120000);
  const authHelper = new AuthHelper(request);
  var tcStatus_16182 = 'Failed';
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100001, 16182, tcStatus_16182);

  //load UI
  expertServiceChatPage = new ExpertServiceChatPage(page);
  await expertServiceChatPage.deleteUser(request);
  await expertServiceChatPage.launchHomePage();
  const projectID = await expertServiceChatPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await expertServiceChatPage.createUser(request, projectID, "02018");
  tcStatus_16182 =await expertServiceChatPage.verifySignIn();
  tcStatus_16182 =await expertServiceChatPage.verifyChatConversationIsNotLost();
  await expertServiceChatPage.deleteUser(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100001, 16182, tcStatus_16182);
});

test('Expert Service Chat - Verify the chat window message during non-business hours.(TestCaseId:16183)', async ({ page, request }) => {
  test.setTimeout(120000);
  const authHelper = new AuthHelper(request);
  var tcStatus_16183 = 'Failed';
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100002, 16183, tcStatus_16183);

  //load UI
  expertServiceChatPage = new ExpertServiceChatPage(page);
  await expertServiceChatPage.deleteUser(request);
  await expertServiceChatPage.launchHomePage();
  const projectID = await expertServiceChatPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await expertServiceChatPage.createUser(request, projectID, "02018");
  tcStatus_16183 =await expertServiceChatPage.verifySignIn();
  tcStatus_16183 =await expertServiceChatPage.verifyChatConversationIsNotLost();
  await expertServiceChatPage.deleteUser(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100002, 16183, tcStatus_16183);
});

test('Expert Service Chat - Verify the chat window Icon is usable at every location in the application(TestCaseId:16195)', async ({ page, request }) => {
  test.setTimeout(450000);
  const authHelper = new AuthHelper(request);
  var tcStatus_16195 = 'Failed';
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100003, 16195, tcStatus_16195);

  //load UI
  expertServiceChatPage = new ExpertServiceChatPage(page);
  await expertServiceChatPage.deleteUser(request);
  await expertServiceChatPage.launchHomePage();
  const projectID = await expertServiceChatPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await expertServiceChatPage.createUser(request, projectID, "02018");
  tcStatus_16195 =await expertServiceChatPage.verifySignIn();
  tcStatus_16195 =await expertServiceChatPage.verifyChatWindowOnEveryPage();
  await expertServiceChatPage.deleteUser(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100003, 16195, tcStatus_16195);
});

test('Expert Service Chat - Verify the chat window arrow navigates back to chat menu(TestCaseId:16196)', async ({ page, request }) => {
  test.setTimeout(120000);
  const authHelper = new AuthHelper(request);
  var tcStatus_16196 = 'Failed';
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100004, 16196, tcStatus_16196);

  //load UI
  expertServiceChatPage = new ExpertServiceChatPage(page);
  await expertServiceChatPage.deleteUser(request);
  await expertServiceChatPage.launchHomePage();
  const projectID = await expertServiceChatPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await expertServiceChatPage.createUser(request, projectID, "02018");
  tcStatus_16196 =await expertServiceChatPage.verifySignIn();
  tcStatus_16196 =await expertServiceChatPage.verifyChatConversationIsNotLost();
  await expertServiceChatPage.deleteUser(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100004, 16196, tcStatus_16196);
});

test('Expert Service Chat - Verify the chat window can minimize and return to maximum size(TestCaseId:16197)', async ({ page, request }) => {
  test.setTimeout(120000);
  const authHelper = new AuthHelper(request);
  var tcStatus_16197 = 'Failed';
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100005, 16197, tcStatus_16197);

  //load UI
  expertServiceChatPage = new ExpertServiceChatPage(page);
  await expertServiceChatPage.deleteUser(request);
  await expertServiceChatPage.launchHomePage();
  const projectID = await expertServiceChatPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await expertServiceChatPage.createUser(request, projectID, "02018");
  tcStatus_16197 =await expertServiceChatPage.verifySignIn();
  tcStatus_16197 =await expertServiceChatPage.verifyChatConversationIsNotLost();
  await expertServiceChatPage.deleteUser(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100005, 16197, tcStatus_16197);
});

test('Expert Service Chat - Verify the chat window rebode logo navigates back to the chat menu(TestCaseId:16198)', async ({ page, request }) => {
  test.setTimeout(120000);
  const authHelper = new AuthHelper(request);
  var tcStatus_16198 = 'Failed';
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100006, 16198, tcStatus_16198);

  //load UI
  expertServiceChatPage = new ExpertServiceChatPage(page);
  await expertServiceChatPage.deleteUser(request);
  await expertServiceChatPage.launchHomePage();
  const projectID = await expertServiceChatPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await expertServiceChatPage.createUser(request, projectID, "02018");
  tcStatus_16198 =await expertServiceChatPage.verifySignIn();
  tcStatus_16198 =await expertServiceChatPage.verifyChatConversationIsNotLost();
  await expertServiceChatPage.deleteUser(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100006, 16198, tcStatus_16198);
});

test('Expert Service Chat - Verify the chat window disable notifications works(TestCaseId:16199)', async ({ page, request }) => {
  test.setTimeout(120000);
  const authHelper = new AuthHelper(request);
  var tcStatus_16199 = 'Failed';
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100007, 16199, tcStatus_16199);

  //load UI
  expertServiceChatPage = new ExpertServiceChatPage(page);
  await expertServiceChatPage.deleteUser(request);
  await expertServiceChatPage.launchHomePage();
  const projectID = await expertServiceChatPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await expertServiceChatPage.createUser(request, projectID, "02018");
  tcStatus_16199 =await expertServiceChatPage.verifySignIn();
  tcStatus_16199 =await expertServiceChatPage.verifyEnableDisableAudioNotification();
  await expertServiceChatPage.deleteUser(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100007, 16199, tcStatus_16199);
});

test('Expert Service Chat - Verify the current conversation can be ended(TestCaseId:16200)', async ({ page, request }) => {
  test.setTimeout(120000);
  const authHelper = new AuthHelper(request);
  var tcStatus_16200 = 'Failed';
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100008, 16200, tcStatus_16200);

  //load UI
  expertServiceChatPage = new ExpertServiceChatPage(page);
  await expertServiceChatPage.deleteUser(request);
  await expertServiceChatPage.launchHomePage();
  const projectID = await expertServiceChatPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await expertServiceChatPage.createUser(request, projectID, "02018");
  tcStatus_16200 =await expertServiceChatPage.verifySignIn();
  tcStatus_16200 =await expertServiceChatPage.verifyEndChatConversation();
  await expertServiceChatPage.deleteUser(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100008, 16200, tcStatus_16200);
});

test('Expert Service Chat - Verify the chat text box works and not disconnected by actions(TestCaseId:16201)', async ({ page, request }) => {
  test.setTimeout(120000);
  const authHelper = new AuthHelper(request);
  var tcStatus_16201 = 'Failed';
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100009, 16201, tcStatus_16201);

  //load UI
  expertServiceChatPage = new ExpertServiceChatPage(page);
  await expertServiceChatPage.deleteUser(request);
  await expertServiceChatPage.launchHomePage();
  const projectID = await expertServiceChatPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await expertServiceChatPage.createUser(request, projectID, "02018");
  tcStatus_16201 =await expertServiceChatPage.verifySignIn();
  tcStatus_16201 =await expertServiceChatPage.verifyChatConversationIsNotLost();
  await expertServiceChatPage.deleteUser(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100009, 16201, tcStatus_16201);
});

test('Expert Service Chat - Verify the chat text box can be closed(TestCaseId:16202)', async ({ page, request }) => {
  test.setTimeout(120000);
  const authHelper = new AuthHelper(request);
  var tcStatus_16202 = 'Failed';
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100010, 16202, tcStatus_16202);

  //load UI
  expertServiceChatPage = new ExpertServiceChatPage(page);
  await expertServiceChatPage.deleteUser(request);
  await expertServiceChatPage.launchHomePage();
  const projectID = await expertServiceChatPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await expertServiceChatPage.createUser(request, projectID, "02018");
  tcStatus_16202 =await expertServiceChatPage.verifySignIn();
  tcStatus_16202 =await expertServiceChatPage.verifyChatClose();
  await expertServiceChatPage.deleteUser(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100010, 16202, tcStatus_16202);
});

test('Expert Service Chat - Verify the chat window can close in conversation(TestCaseId:16203)', async ({ page, request }) => {
  test.setTimeout(120000);
  const authHelper = new AuthHelper(request);
  var tcStatus_16203 = 'Failed';
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100011, 16203, tcStatus_16203);

  //load UI
  expertServiceChatPage = new ExpertServiceChatPage(page);
  await expertServiceChatPage.deleteUser(request);
  await expertServiceChatPage.launchHomePage();
  const projectID = await expertServiceChatPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await expertServiceChatPage.createUser(request, projectID, "02018");
  tcStatus_16203 =await expertServiceChatPage.verifySignIn();
  tcStatus_16203 =await expertServiceChatPage.verifyChatConversationIsNotLost();
  await expertServiceChatPage.deleteUser(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100011, 16203, tcStatus_16203);
});

test('Expert Service Chat - FAIL CASE - Error message with an invalid email address in chat window message during non-business hours.(TestCaseId:16204)', async ({ page, request }) => {
  test.setTimeout(120000);
  const authHelper = new AuthHelper(request);
  var tcStatus_16204 = 'Failed';
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100012, 16204, tcStatus_16204);

  //load UI
  expertServiceChatPage = new ExpertServiceChatPage(page);
  await expertServiceChatPage.deleteUser(request);
  await expertServiceChatPage.launchHomePage();
  const projectID = await expertServiceChatPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await expertServiceChatPage.createUser(request, projectID, "02018");
  tcStatus_16204 =await expertServiceChatPage.verifySignIn();
  tcStatus_16204 =await expertServiceChatPage.verifyInvalidEmailInChat();
  await expertServiceChatPage.deleteUser(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100012, 16204, tcStatus_16204);
});

test('Expert Service Chat - Verify the chat header introduction(TestCaseId:17153)', async ({ page, request }) => {
  test.setTimeout(120000);
  const authHelper = new AuthHelper(request);
  var tcStatus_17153 = 'Failed';
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100013, 17153, tcStatus_17153);

  //load UI
  expertServiceChatPage = new ExpertServiceChatPage(page);
  await expertServiceChatPage.deleteUser(request);
  await expertServiceChatPage.launchHomePage();
  const projectID = await expertServiceChatPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await expertServiceChatPage.createUser(request, projectID, "02018");
  tcStatus_17153 =await expertServiceChatPage.verifySignIn();
  tcStatus_17153 =await expertServiceChatPage.verifyChatHeaderIntroduction();
  await expertServiceChatPage.deleteUser(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100013, 17153, tcStatus_17153);
});

test('Expert Service Chat - Verify that the Chat button becomes visible once the user opens the app(TestCaseId:22565)', async ({ page, request }) => {
  test.setTimeout(120000);
  const authHelper = new AuthHelper(request);
  var tcStatus_22565 = 'Failed';
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100014, 22565, tcStatus_22565);

  //load UI
  expertServiceChatPage = new ExpertServiceChatPage(page);
  await expertServiceChatPage.deleteUser(request);
  await expertServiceChatPage.launchHomePage();
  tcStatus_22565=await expertServiceChatPage.verifyChatButton();
  const projectID = await expertServiceChatPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await expertServiceChatPage.createUser(request, projectID, "02018");
  tcStatus_22565 =await expertServiceChatPage.verifySignIn();
  tcStatus_22565=await expertServiceChatPage.verifyChatButton();
  await expertServiceChatPage.deleteUser(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100014, 22565, tcStatus_22565);
});

test('Expert Service Chat - Verify that the hover text on the Chat button becomes can be dismissed(TestCaseId:22567)', async ({ page, request }) => {
  test.setTimeout(120000);
  const authHelper = new AuthHelper(request);
  var tcStatus_22567 = 'Failed';
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100015, 22567, tcStatus_22567);

  //load UI
  expertServiceChatPage = new ExpertServiceChatPage(page);
  await expertServiceChatPage.deleteUser(request);
  await expertServiceChatPage.launchHomePage();
  const projectID = await expertServiceChatPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await expertServiceChatPage.createUser(request, projectID, "02018");
  tcStatus_22567 =await expertServiceChatPage.verifySignIn();
  tcStatus_22567 =await expertServiceChatPage.verifyCloseXButton();
  await expertServiceChatPage.deleteUser(request);
   await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100015, 22567, tcStatus_22567);
});

test('Expert Service Chat - Verify that the Chat button open chat once the user opens the app(TestCaseId:22568)', async ({ page, request }) => {
  test.setTimeout(120000);
  const authHelper = new AuthHelper(request);
  var tcStatus_22568 = 'Failed';
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100016, 22568, tcStatus_22568);

  //load UI
  expertServiceChatPage = new ExpertServiceChatPage(page);
  await expertServiceChatPage.deleteUser(request);
  await expertServiceChatPage.launchHomePage();
  const projectID = await expertServiceChatPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  await expertServiceChatPage.createUser(request, projectID, "02018");
  tcStatus_22568 =await expertServiceChatPage.verifySignIn();
  tcStatus_22568 =await expertServiceChatPage.verifyChatOpen();
  await expertServiceChatPage.deleteUser(request);
  await authHelper.patchRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')), 100016, 22568, tcStatus_22568);
});


test('Complete Test Report Run for Test Plan', async ({ request }) => {
  const authHelper = new AuthHelper(request);
  await authHelper.patchToCompleteTestRunRequest(parseInt(fs.readFileSync('temp-id.txt', 'utf8')));
  console.log("Completed Test Result Update for ExpertServiceChatPage");
});
*/