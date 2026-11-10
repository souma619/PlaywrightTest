import { test } from '@playwright/test';
import FooterPage from '../../ui_pages/FooterPage';

const logBoundary = (message: string) => {
  const prefix = '>'.repeat(11);
  const suffix = '<'.repeat(10);
  console.log(prefix + message + suffix);
};

let footerPage: FooterPage;

test('Jumpstarter - Validate Footer Links Are Working And Point To Correct Environment', async ({ page, request }) => {
  test.setTimeout(300000);
  logBoundary("Starting test: Jumpstarter - Validate Footer Links Are Working And Point To Correct Environment");
  //load UI

  footerPage = new FooterPage(page);
  await footerPage.launchJumpstarterPage();
  await footerPage.verifyJumpstarterFooterLinks(request);
  logBoundary("Completed test: Jumpstarter - Validate Footer Links Are Working And Point To Correct Environment");
});

test('Homepage - Validate Footer Links Are Working And Point To Correct Environment', async ({ page, request }) => {
  test.setTimeout(300000);
  logBoundary("Starting test: Homepage - Validate Footer Links Are Working And Point To Correct Environment");
  //load UI

  footerPage = new FooterPage(page);
  await footerPage.launchHomePage();
  await footerPage.verifyHomePageFooterLinks(request);
  logBoundary("Completed test: Homepage - Validate Footer Links Are Working And Point To Correct Environment");
});
