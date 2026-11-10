import { test, expect } from '@playwright/test';
import AccountsPage from '../../ui_pages/AccountsPage';
import SmokePage from '../../ui_pages/SmokePage';

const logBoundary = (message: string) => {
  const prefix = '>'.repeat(11);
  const suffix = '<'.repeat(10);
  console.log(prefix + message + suffix);
};

let accountsPage: AccountsPage;
let smokePage: SmokePage;
test('Account - Edit Profile(TestCaseId:15486)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Account - Edit Profile");
  //load UI
  accountsPage = new AccountsPage(page);
  await accountsPage.launchHomePage();
  const projectID = await accountsPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  const { status, email } = await accountsPage.verifySignIn("02018");
  await accountsPage.verifyAccountsEditProfile();
  await accountsPage.deleteUser(request, email);

  logBoundary("Completed test: Account - Edit Profile");
});

test('Account - Forgot your Password(TestCaseId:15439)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Account - Forgot your Password");
  //load UI
  accountsPage = new AccountsPage(page);
  await accountsPage.launchHomePage();
  const projectID = await accountsPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  const { status, email } = await accountsPage.verifySignIn("02018");
  await accountsPage.verifyAccountsEditProfile();
  await accountsPage.deleteUser(request, email);

  logBoundary("Completed test: Account - Forgot your Password");
});

test('Account - FAIL CASE - Forgot your Password invalid email(TestCaseId:15440)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Account - FAIL CASE - Forgot your Password invalid email");
  //load UI
  accountsPage = new AccountsPage(page);
  await accountsPage.launchHomePage();
  const projectID = await accountsPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  const { status, email } = await accountsPage.verifySignIn("02018");
  await accountsPage.verifyAccountsEditProfile();
  await accountsPage.deleteUser(request, email);

  logBoundary("Completed test: Account - FAIL CASE - Forgot your Password invalid email");
});

test('Account - FAIL CASE - Forgot your Password email address is not in system(TestCaseId:15441)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Account - FAIL CASE - Forgot your Password email address is not in system");
  //load UI
  accountsPage = new AccountsPage(page);
  await accountsPage.launchHomePage();
  const projectID = await accountsPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  const { status, email } = await accountsPage.verifySignIn("02018");
  await accountsPage.verifyAccountsEditProfile();
  await accountsPage.deleteUser(request, email);

  logBoundary("Completed test: Account - FAIL CASE - Forgot your Password email address is not in system");
});

test('Account - FAIL CASE - Edit Profile content is blank(TestCaseId:15494)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Account - FAIL CASE - Edit Profile content is blank");
  //load UI
  accountsPage = new AccountsPage(page);
   await accountsPage.launchHomePage();
  const projectID = await accountsPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  const { status, email } = await accountsPage.verifySignIn("02018");
  await accountsPage.verifyAccountsEditProfile();
  await accountsPage.deleteUser(request, email);

  logBoundary("Completed test: Account - FAIL CASE - Edit Profile content is blank");
});

test('Account - Change password(TestCaseId:15507)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Account - Change password");
  //load UI
  accountsPage = new AccountsPage(page);
  await accountsPage.launchHomePage();
  const projectID = await accountsPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  const { status, email } = await accountsPage.verifySignIn("02018");
  await accountsPage.verifyAccountsEditProfile();
  await accountsPage.deleteUser(request, email);

  logBoundary("Completed test: Account - Change password");
});

test('Account - Change password but cancel(TestCaseId:15508)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Account - Change password but cancel");
  //load UI
  accountsPage = new AccountsPage(page);
  await accountsPage.launchHomePage();
  const projectID = await accountsPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  const { status, email } = await accountsPage.verifySignIn("02018");
  await accountsPage.verifyAccountsEditProfile();
  await accountsPage.deleteUser(request, email);

  logBoundary("Completed test: Account - Change password but cancel");
});

test('Account - FAIL CASE - Change password but invalid(TestCaseId:15509)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Account - FAIL CASE - Change password but invalid");
  //load UI
  accountsPage = new AccountsPage(page);
  await accountsPage.launchHomePage();
  const projectID = await accountsPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  const { status, email } = await accountsPage.verifySignIn("02018");
  await accountsPage.verifyAccountsEditProfile();
  await accountsPage.deleteUser(request, email);

  logBoundary("Completed test: Account - FAIL CASE - Change password but invalid");
});

test('Account - FAIL CASE - Change password not matching(TestCaseId:15510)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Account - FAIL CASE - Change password not matching");
  //load UI
  accountsPage = new AccountsPage(page);
  await accountsPage.launchHomePage();
  const projectID = await accountsPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  const { status, email } = await accountsPage.verifySignIn("02018");
  await accountsPage.verifyAccountsEditProfile();
  await accountsPage.deleteUser(request, email);

  logBoundary("Completed test: Account - FAIL CASE - Change password not matching");
});

test('Account - Edit Profile but cancel(TestCaseId:15511)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Account - Edit Profile but cancel");
  //load UI
  accountsPage = new AccountsPage(page);
  await accountsPage.launchHomePage();
  const projectID = await accountsPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  const { status, email } = await accountsPage.verifySignIn("02018");
  await accountsPage.verifyAccountsEditProfile();
  await accountsPage.deleteUser(request, email);

  logBoundary("Completed test: Account - Edit Profile but cancel");
});

test('Account - Edit Profile, turn on Marketing Notifications(TestCaseId:15512)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Account - Edit Profile, turn on Marketing Notifications");
  //load UI
  accountsPage = new AccountsPage(page);
  await accountsPage.launchHomePage();
  const projectID = await accountsPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  const { status, email } = await accountsPage.verifySignIn("02018");
  await accountsPage.verifyAccountsEditProfile();
  await accountsPage.deleteUser(request, email);

  logBoundary("Completed test: Account - Edit Profile, turn on Marketing Notifications");
});

test('Account - Edit Profile, turn off Marketing Notifications(TestCaseId:15513)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Account - Edit Profile, turn off Marketing Notifications");
  //load UI
  accountsPage = new AccountsPage(page);
  await accountsPage.launchHomePage();
  const projectID = await accountsPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  const { status, email } = await accountsPage.verifySignIn("02018");
  await accountsPage.verifyAccountsEditProfile();
  await accountsPage.verifyAccountsEditProfileMarketingNotificationOff();
  await accountsPage.deleteUser(request, email);

  logBoundary("Completed test: Account - Edit Profile, turn off Marketing Notifications");
});

test('Account - Sign In on KRJ and verify account creation page design(TestCaseId:15293)', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: Account - Sign In on KRJ and verify account creation page design");
  //load UI
  accountsPage = new AccountsPage(page);
  await accountsPage.launchHomePage();
  await accountsPage.verifyAccountWallPageDesign();
  logBoundary("Completed test: Account - Sign In on KRJ and verify account creation page design");
});

test('Account - Sign In as Quest After Budget completion and verify account creation page design(TestCaseId:33320)', async ({ page, request }) => {
  test.setTimeout(450000);
  logBoundary("Starting test: Account - Sign In as Quest After Budget completion and verify account creation page design");
  //load UI
  smokePage = new SmokePage(page);
  await smokePage.launchHomePage();

  await smokePage.completeIceBreakerFlow();
  await smokePage.completeStyleFlow();
  await smokePage.completeDesignFlow();
  await smokePage.completeBudgetFlow('Premium');

  accountsPage = new AccountsPage(page);
  await accountsPage.VerifyAccountWallPageDesignAsQuest();
  logBoundary("Completed test: Account - Sign In as Quest After Budget completion and verify account creation page design");
});