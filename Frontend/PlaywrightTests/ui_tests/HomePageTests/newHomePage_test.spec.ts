import { test, expect } from '@playwright/test';
import NewHomePage from '../../ui_pages/NewHomePage';

const logBoundary = (message: string) => {
  const prefix = '>'.repeat(11);
  const suffix = '<'.repeat(10);
  console.log(prefix + message + suffix);
};

let newHomePage: NewHomePage;

test('NewHomePage - Validate Hero Navigation Tabs', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: NewHomePage - Validate Hero Navigation Tabs");
  //load UI
  
  newHomePage = new NewHomePage(page);
  await newHomePage.launchNewHomePage();
  await newHomePage.verifyHeroNavigationTabs();
  logBoundary("Completed test: NewHomePage - Validate Hero Navigation Tabs");
});

test('NewHomePage - Validate How it Works Section', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: NewHomePage - Validate How it Works Section");
  //load UI
  
  newHomePage = new NewHomePage(page);
  await newHomePage.launchNewHomePage();
  await newHomePage.verifyHowItWorksSection();
  logBoundary("Completed test: NewHomePage - Validate How it Works Section");
});

test('NewHomePage - Validate From Vision To Renovation Section', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: NewHomePage - Validate From Vision To Renovation Section");
  //load UI
  
  newHomePage = new NewHomePage(page);
  await newHomePage.launchNewHomePage();
  await newHomePage.verifyFromVisionToRenovation();
  logBoundary("Completed test: NewHomePage - Validate From Vision To Renovation Section");
});

test('NewHomePage - Validate Tools To Shape Your Dream Section', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: NewHomePage - Validate Tools To Shape Your Dream Section");
  //load UI
  
  newHomePage = new NewHomePage(page);
  await newHomePage.launchNewHomePage();
  await newHomePage.verifyToolsToShapeYourDream();
  logBoundary("Completed test: NewHomePage - Validate Tools To Shape Your Dream Section");
});

test('NewHomePage - Validate See Your Dream Kitchen Come To Life Section', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: NewHomePage - Validate See Your Dream Kitchen Come To Life Section");
  //load UI
  
  newHomePage = new NewHomePage(page);
  await newHomePage.launchNewHomePage();
  await newHomePage.verifySeeYourDreamKitchenComeToLife();
  logBoundary("Completed test: NewHomePage - Validate See Your Dream Kitchen Come To Life Section");
});

test('NewHomePage - Validate Still Exploring Section', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: NewHomePage - Validate Still Exploring Section");
  //load UI
  
  newHomePage = new NewHomePage(page);
  await newHomePage.launchNewHomePage();
  await newHomePage.verifyStillExploring();
  logBoundary("Completed test: NewHomePage - Validate Still Exploring Section");
});

test('NewHomePage - Validate YourQuestionsAnswered FAQs Section', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: NewHomePage - Validate YourQuestionsAnswered FAQs Section");
  //load UI
  
  newHomePage = new NewHomePage(page);
  await newHomePage.launchNewHomePage();
  await newHomePage.verifyYourQuestionsAnswered();
  logBoundary("Completed test: NewHomePage - Validate YourQuestionsAnswered FAQs Section");
});

test('NewHomePage - Validate About Rebode Section', async ({ page, request }) => {
  test.setTimeout(180000);
  logBoundary("Starting test: NewHomePage - Validate About Rebode Section");
  //load UI
  
  newHomePage = new NewHomePage(page);
  await newHomePage.launchNewHomePage();
  await newHomePage.verifyAboutRebode();
  logBoundary("Completed test: NewHomePage - Validate About Rebode Section");
});

