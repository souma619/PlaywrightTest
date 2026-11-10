import { test, expect } from '@playwright/test';

const logBoundary = (message: string) => {
  const prefix = '>'.repeat(11);
  const suffix = '<'.repeat(10);
  console.log(prefix + message + suffix);
};

import StylePage from '../../ui_pages/StylePage.ts';
import AuthHelper from '../../helpers/api-helpers';
import fs from 'fs';

const planId='15124';
const suiteId='15294';

const stylePagePointsTCMap =new Map();
stylePagePointsTCMap.set(347,15140);
stylePagePointsTCMap.set(383,15141);
stylePagePointsTCMap.set(385,15143);
stylePagePointsTCMap.set(386,15144);
stylePagePointsTCMap.set(531,15495);
stylePagePointsTCMap.set(532,15496);
stylePagePointsTCMap.set(533,15497);
stylePagePointsTCMap.set(534,15503);
stylePagePointsTCMap.set(535,15504);
stylePagePointsTCMap.set(536,15505);
stylePagePointsTCMap.set(537,15506);
stylePagePointsTCMap.set(550,15752);
stylePagePointsTCMap.set(551,15756);
stylePagePointsTCMap.set(552,15757);
stylePagePointsTCMap.set(553,15759);
stylePagePointsTCMap.set(3990,18823);
stylePagePointsTCMap.set(3991,18824);
stylePagePointsTCMap.set(3992,18825);

test.describe.configure({mode:'default'});
let stylePage: StylePage;
let runId ;

test('Create Test Report Run ID for Test Plan', async ({ request }) => {
const authHelper = new AuthHelper(request);
runId =await authHelper.getPointsIDforTestPlanTestSuite(stylePagePointsTCMap,planId,'Style');
fs.writeFileSync('temp-id.txt',runId.toString());
console.log("Test Result Report ID:" + runId);
});

test('Style - Verify Style Fork(TestCaseId:15140)', async ({ page,request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Style - Verify Style Fork");
  const authHelper = new AuthHelper(request);
  var tcStatus_15140='Failed';  
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100000','15140',tcStatus_15140);
  //load UI
  stylePage = new StylePage(page);
  await stylePage.launchHomePage();
  await stylePage.completeIceBreakerFlow();
  tcStatus_15140=await stylePage.verifyStyleFork();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100000','15140',tcStatus_15140);
  logBoundary("Completed test: Style - Verify Style Fork");
});

test('Style - Verify Style Quiz - Question 4(TestCaseId:15141)', async ({ page,request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Style - Verify Style Quiz - Question 4");
  const authHelper = new AuthHelper(request);
  var tcStatus_15141='Failed';  
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100001','15141',tcStatus_15141);
  //load UI
  stylePage = new StylePage(page);
  await stylePage.launchHomePage();
  await stylePage.completeIceBreakerFlow();
  tcStatus_15141=await stylePage.verifyStyleQuizQuestion4();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100001','15141',tcStatus_15141);
  logBoundary("Completed test: Style - Verify Style Quiz - Question 4");
});

test('Style - Verify Style Finder(TestCaseId:15143)', async ({ page,request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Style - Verify Style Finder");
  const authHelper = new AuthHelper(request);
  var tcStatus_15143='Failed';  
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100002','15143',tcStatus_15143);
  //load UI
  stylePage = new StylePage(page);
  await stylePage.launchHomePage();
  await stylePage.completeIceBreakerFlow();
  tcStatus_15143=await stylePage.verifyStyleFinderIsNotDisplayed();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100002','15143',tcStatus_15143);
  logBoundary("Completed test: Style - Verify Style Finder");
});

test('Style - Verify Style Profile(TestCaseId:15144)', async ({ page,request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Style - Verify Style Profile");
  const authHelper = new AuthHelper(request);
  var tcStatus_15144='Failed';  
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100003','15144',tcStatus_15144);
  //load UI
  stylePage = new StylePage(page);
  await stylePage.launchHomePage();
  await stylePage.completeIceBreakerFlow();
  tcStatus_15144=await stylePage.verifyStyleProfileIsNotDisplayed();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100003','15144',tcStatus_15144);
  logBoundary("Completed test: Style - Verify Style Profile");
});

test('Style - Verify Style Quiz - Question 1(TestCaseId:15495)', async ({ page,request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Style - Verify Style Quiz - Question 1");
  const authHelper = new AuthHelper(request);
  var tcStatus_15495='Failed';  
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100004','15495',tcStatus_15495);
  //load UI
  stylePage = new StylePage(page);
  await stylePage.launchHomePage();
  await stylePage.completeIceBreakerFlow();
  tcStatus_15495=await stylePage.verifyStyleQuizQuestion4();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100004','15495',tcStatus_15495);
  logBoundary("Completed test: Style - Verify Style Quiz - Question 1");
});

test('Style - Verify Style Quiz - Question 2(TestCaseId:15496)', async ({ page,request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Style - Verify Style Quiz - Question 2");
  const authHelper = new AuthHelper(request);
  var tcStatus_15496='Failed';  
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100005','15496',tcStatus_15496);
  //load UI
  stylePage = new StylePage(page);
  await stylePage.launchHomePage();
  await stylePage.completeIceBreakerFlow();
  tcStatus_15496=await stylePage.verifyStyleQuizQuestion4();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100005','15496',tcStatus_15496);
  logBoundary("Completed test: Style - Verify Style Quiz - Question 2");
});

test('Style - Verify Style Quiz - Question 3(TestCaseId:15497)', async ({ page,request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Style - Verify Style Quiz - Question 3");
  const authHelper = new AuthHelper(request);
  var tcStatus_15497='Failed';  
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100006','15497',tcStatus_15497);
  //load UI
  stylePage = new StylePage(page);
  await stylePage.launchHomePage();
  await stylePage.completeIceBreakerFlow();
  tcStatus_15497=await stylePage.verifyStyleQuizQuestion4();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100006','15497',tcStatus_15497);
  logBoundary("Completed test: Style - Verify Style Quiz - Question 3");
});

test('Style - Edge Case - Upload a photo clicking X to cancel out at every point(TestCaseId:15503)', async ({ page,request }) => {
  test.setTimeout(90000);
  logBoundary("Starting test: Style - Edge Case - Upload a photo clicking X to cancel out at every point");
  const authHelper = new AuthHelper(request);
  var tcStatus_15503='Failed';  
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100007','15503',tcStatus_15503);
  //load UI
  stylePage = new StylePage(page);
  await stylePage.launchHomePage();
  await stylePage.completeIceBreakerFlow();
  tcStatus_15503=await stylePage.verifyUploadPhotoThroughDropImagePath();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100007','15503',tcStatus_15503);
  logBoundary("Completed test: Style - Edge Case - Upload a photo clicking X to cancel out at every point");
});

test('Style - FAIL CASE - System folder upload fail due to wrong file type(TestCaseId:15504)', async ({ page,request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Style - FAIL CASE - System folder upload fail due to wrong file type");
  const authHelper = new AuthHelper(request);
  var tcStatus_15504='Failed';  
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100008','15504',tcStatus_15504);
  //load UI
  stylePage = new StylePage(page);
  await stylePage.launchHomePage();
  await stylePage.completeIceBreakerFlow();
  tcStatus_15504=await stylePage.verifyUploadFailDueToInvalidFileFormat();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100008','15504',tcStatus_15504);
  logBoundary("Completed test: Style - FAIL CASE - System folder upload fail due to wrong file type");
});

test('Style - FAIL CASE - System folder upload fail due to large file size(TestCaseId:15505)', async ({ page,request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Style - FAIL CASE - System folder upload fail due to large file size");
  const authHelper = new AuthHelper(request);
  var tcStatus_15505='Failed';  
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100009','15505',tcStatus_15505);
  //load UI
  stylePage = new StylePage(page);
  await stylePage.launchHomePage();
  await stylePage.completeIceBreakerFlow();
  tcStatus_15505=await stylePage.verifyUploadFailDueToInvalidFileSize();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100009','15505',tcStatus_15505);
  logBoundary("Completed test: Style - FAIL CASE - System folder upload fail due to large file size");
});

test('Style - FAIL CASE - Upload photo analysis found human body and AI Content Violation(TestCaseId:15506)', async ({ page,request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Style - FAIL CASE - Upload photo analysis found human body and AI Content Violation");
  const authHelper = new AuthHelper(request);
  var tcStatus_15506='Failed';  
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100010','15506',tcStatus_15506);
  //load UI
  stylePage = new StylePage(page);
  await stylePage.launchHomePage();
  await stylePage.completeIceBreakerFlow();
  tcStatus_15506=await stylePage.verifyUploadHumanPhotoThroughDropImage();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100010','15506',tcStatus_15506);
  logBoundary("Completed test: Style - FAIL CASE - Upload photo analysis found human body and AI Content Violation");
});

test('Style - Verify Style Finder (from Style Fork)(TestCaseId:15752)', async ({ page,request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Style - Verify Style Finder (from Style Fork)");
  const authHelper = new AuthHelper(request);
  var tcStatus_15752='Failed';  
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100011','15752',tcStatus_15752);
  //load UI
  stylePage = new StylePage(page);
  await stylePage.launchHomePage();
  await stylePage.completeIceBreakerFlow();
  tcStatus_15752=await stylePage.verifyStyleTunerSlidersIsNotDisplayed();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100011','15752',tcStatus_15752);
  logBoundary("Completed test: Style - Verify Style Finder (from Style Fork)");
});

test('Style - Upload a photo through drop image (good path)(TestCaseId:15756)', async ({ page,request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Style - Upload a photo through drop image (good path)");
  const authHelper = new AuthHelper(request);
  var tcStatus_15756='Failed';  
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100012','15756',tcStatus_15756);
  //load UI
  stylePage = new StylePage(page);
  await stylePage.launchHomePage();
  await stylePage.completeIceBreakerFlow();
  tcStatus_15756=await stylePage.verifyUploadPhotoThroughDropImage();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100012','15756',tcStatus_15756);
  logBoundary("Completed test: Style - Upload a photo through drop image (good path)");
});

test('Style - FAIL CASE - Drop image upload fail due to wrong file type(TestCaseId:15757)', async ({ page,request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Style - FAIL CASE - Drop image upload fail due to wrong file type");
  const authHelper = new AuthHelper(request);
  var tcStatus_15757='Failed';  
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100013','15757',tcStatus_15757);
  //load UI
  stylePage = new StylePage(page);
  await stylePage.launchHomePage();
  await stylePage.completeIceBreakerFlow();
  tcStatus_15757=await stylePage.verifyUploadFailDueToInvalidFileFormat();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100013','15757',tcStatus_15757);
  logBoundary("Completed test: Style - FAIL CASE - Drop image upload fail due to wrong file type");
});

test('Style - FAIL CASE - drop photo upload fail due to wrong file size(TestCaseId:15759)', async ({ page,request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Style - FAIL CASE - drop photo upload fail due to wrong file size");
  const authHelper = new AuthHelper(request);
  var tcStatus_15759='Failed';  
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100014','15759',tcStatus_15759);
  //load UI
  stylePage = new StylePage(page);
  await stylePage.launchHomePage();
  await stylePage.completeIceBreakerFlow();
  tcStatus_15759=await stylePage.verifyUploadFailDueToInvalidFileSize();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100014','15759',tcStatus_15759);
  logBoundary("Completed test: Style - FAIL CASE - drop photo upload fail due to wrong file size");
});

test('Style - Verify Style Tuner sliders(TestCaseId:18823)', async ({ page,request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Style - Verify Style Tuner sliders");
  const authHelper = new AuthHelper(request);
  var tcStatus_18823='Failed';  
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100015','18823',tcStatus_18823);
  //load UI
  stylePage = new StylePage(page);
  await stylePage.launchHomePage();
  await stylePage.completeIceBreakerFlow();
  tcStatus_18823=await stylePage.verifyStyleTunerSlidersIsNotDisplayed();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100015','18823',tcStatus_18823);
  logBoundary("Completed test: Style - Verify Style Tuner sliders");
});

test('Style - Verify Style Tuner slider Reset Sliders(TestCaseId:18824)', async ({ page,request }) => {
  test.setTimeout(240000);
  logBoundary("Starting test: Style - Verify Style Tuner slider Reset Sliders");
  const authHelper = new AuthHelper(request);
  var tcStatus_18824='Failed';  
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100016','18824',tcStatus_18824);
  //load UI
  stylePage = new StylePage(page);
  await stylePage.launchHomePage();
  await stylePage.completeIceBreakerFlow();
  tcStatus_18824=await stylePage.verifyStyleTunerResetSlidersIsNotDisplayed();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100016','18824',tcStatus_18824);
  logBoundary("Completed test: Style - Verify Style Tuner slider Reset Sliders");
});

test('Style - Verify Style Tuner image show more details(TestCaseId:18825)', async ({ page,request }) => {
  test.setTimeout(120000);
  logBoundary("Starting test: Style - Verify Style Tuner image show more details");
  const authHelper = new AuthHelper(request);
  var tcStatus_18825='Failed';
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100017','18825',tcStatus_18825);
  //load UI
  stylePage = new StylePage(page);
  await stylePage.launchHomePage();
  await stylePage.completeIceBreakerFlow();
  tcStatus_18825=await stylePage.verifyStyleTunerImageShowsMoreDetailsIsNotDisplayed();
  await authHelper.patchRequest(fs.readFileSync('temp-id.txt','utf8') ,'100017','18825',tcStatus_18825);
  logBoundary("Completed test: Style - Verify Style Tuner image show more details");
});

test('Complete Test Report Run for Test Plan', async ({ request }) => {
const authHelper = new AuthHelper(request);
await authHelper.patchToCompleteTestRunRequest(fs.readFileSync('temp-id.txt','utf8'));
console.log("Completed Test Result Update for StylePage");
});


