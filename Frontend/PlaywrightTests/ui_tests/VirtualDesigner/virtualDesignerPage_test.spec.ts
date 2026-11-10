import { test, expect } from '@playwright/test';
import VirtualDesignerPage from '../../ui_pages/VirtualDesignerPage';
import { mockCalendlyIfNeeded } from '../../helpers/calendlyMock';

const logBoundary = (message: string) => {
  const prefix = '>'.repeat(11);
  const suffix = '<'.repeat(10);
  console.log(prefix + message + suffix);
};

let virtualDesignerPage: VirtualDesignerPage;

test.beforeEach(async ({ page }) => {
  await mockCalendlyIfNeeded(page);
});

test('Virtual DesignerPage Flow - Verify the Virtual Designers Flow for Section Schedule my call', async ({ page,request }) => {
  test.setTimeout(360000);
  logBoundary("Starting test: Virtual DesignerPage Flow - Verify the Virtual Designers Flow for Section Schedule my call");
  //load UI
  virtualDesignerPage = new VirtualDesignerPage(page);
  await virtualDesignerPage.launchHomePage();
  const projectID=await virtualDesignerPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  const { status, email } = await virtualDesignerPage.verifySignIn("28246");
  await virtualDesignerPage.completeIceBreakerFlow();
  await virtualDesignerPage.completeStyleFlow();
  await virtualDesignerPage.completeDesignFlow();
  await virtualDesignerPage.completeBudgetFlow('Premium');
  await virtualDesignerPage.verifyVirtualDesigner('+919999999999', 'Schedule my call');
  await virtualDesignerPage.deleteUser(request,email);
  
  logBoundary("Completed test: Virtual DesignerPage Flow - Verify the Virtual Designers Flow for Section Schedule my call");
});

test('Virtual DesignerPage Flow - Verify the Virtual Designer Flow Section Talk to a kitchen designer for free', async ({ page,request }) => {
  test.setTimeout(360000);
  logBoundary("Starting test: Virtual DesignerPage Flow - Verify the Virtual Designer Flow Section Talk to a kitchen designer for free");
  //load UI
  virtualDesignerPage = new VirtualDesignerPage(page);
  await virtualDesignerPage.launchHomePage();
  const projectID=await virtualDesignerPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  const { status, email } = await virtualDesignerPage.verifySignIn("28246");
  await virtualDesignerPage.completeIceBreakerFlow();
  await virtualDesignerPage.completeStyleFlow();
  await virtualDesignerPage.completeDesignFlow();
  await virtualDesignerPage.completeBudgetFlow('Premium');
  await virtualDesignerPage.verifyVirtualDesigner('+919999999999', 'Talk to a kitchen designer for free');
  await virtualDesignerPage.deleteUser(request,email);
  
  logBoundary("Completed test: Virtual DesignerPage Flow - Verify the Virtual Designer Flow Section Talk to a kitchen designer for free");
});

test('Virtual DesignerPage Flow - Verify the Virtual Designer Flow Section Toys Learn more', async ({ page,request }) => {
  test.setTimeout(360000);
  logBoundary("Starting test: Virtual DesignerPage Flow - Verify the Virtual Designer Flow Section Toys Learn more");
  //load UI
  virtualDesignerPage = new VirtualDesignerPage(page);
  await virtualDesignerPage.launchHomePage();
  const projectID=await virtualDesignerPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  const { status, email } = await virtualDesignerPage.verifySignIn("28246");
  await virtualDesignerPage.completeIceBreakerFlow();
  await virtualDesignerPage.completeStyleFlow();
  await virtualDesignerPage.completeDesignFlow();
  await virtualDesignerPage.completeBudgetFlow('Premium');
  await virtualDesignerPage.verifyVirtualDesigner('+919999999999', 'Learn more');
  await virtualDesignerPage.deleteUser(request,email);
  
  logBoundary("Completed test: Virtual DesignerPage Flow - Verify the Virtual Designer Flow Section Toys Learn more");
});


test('Virtual DesignerPage Flow - Verify the Virtual Designer Flow Section popup hamburger menu', async ({ page,request }) => {
  test.setTimeout(360000);
  logBoundary("Starting test: Virtual DesignerPage Flow - Verify the Virtual Designer Flow Section popup hamburger menu");
  //load UI
  virtualDesignerPage = new VirtualDesignerPage(page);
  await virtualDesignerPage.launchHomePage();
  const projectID=await virtualDesignerPage.getProjectID();
  console.log("New ProjectID :" + projectID);
  const { status, email } = await virtualDesignerPage.verifySignIn("28246");
  await virtualDesignerPage.completeIceBreakerFlow();
  await virtualDesignerPage.completeStyleFlow();
  await virtualDesignerPage.completeDesignFlow();
  await virtualDesignerPage.completeBudgetFlow('Premium');
  await virtualDesignerPage.verifyVirtualDesigner('+919999999999', 'Learn more');
  await virtualDesignerPage.verifyHamburgerpopup();
  await virtualDesignerPage.deleteUser(request,email);
  
  logBoundary("Completed test: Virtual DesignerPage Flow - Verify the Virtual Designer Flow Section popup hamburger menu");
});
