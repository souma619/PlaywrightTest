import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import NewHomepage from '../../../ui_pages/NewHomePage_research.ts';
import { extractFullHTML } from '../../../analysers/htmlExtractor.ts';
import { analyzePage } from '../../../analysers/pageAnalyser.ts';
import { generateTestCases } from '../../../analysers/testCaseGenerator.ts';
import { validateAnalysis } from '../../../analysers/validations.ts';
import { generateExcelReport } from '../../../helpers/excelReporter.ts';
import { logger } from '../../../helpers/logger.ts';

const logBoundary = (message: string) => {
  const prefix = '>'.repeat(11);
  const suffix = '<'.repeat(10);
  console.log(prefix + message + suffix);
};

function getImplementedTestNames(specSource: string): Set<string> {
  const testNames = new Set<string>();
  const regex = /test\(\s*['"`]([^'"`]+)['"`]\s*,/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(specSource)) !== null) {
    const candidate = (match[1] ?? '').trim();
    if (candidate.length > 0) {
      testNames.add(candidate);
    }
  }

  return testNames;
}

function getRunTimestamp(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

function ensureCleanDirectory(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
  for (const entry of fs.readdirSync(dirPath)) {
    const fullPath = path.join(dirPath, entry);
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } catch {
      // Ignore locked artifacts (for example an open Excel file) and continue.
    }
  }
}

test.describe('New Homepage Prerequisites', () => {
  test('TC_Precondition_Jumpstarter_Cookie_Home_And_Analysis', async ({ page }) => {
    logBoundary("Starting test: TC_Precondition_Jumpstarter_Cookie_Home_And_Analysis");
    const homepage = new NewHomepage(page);

    const screenshotDir = path.join(process.cwd(), 'Homepage Screenshot');
    ensureCleanDirectory(screenshotDir);

    const artifactDir = path.join(process.cwd(), 'temp_excel');
    ensureCleanDirectory(artifactDir);

    await homepage.launchViaJumpstarterAndAcceptCookie();
    await expect(page).toHaveURL(homepage.getJumpstarterStartUrl());

    await homepage.navigateToHomePage();
    await expect(page).toHaveURL(homepage.getHomeUrl());

    await page.waitForTimeout(10000);

    const runTimestamp = getRunTimestamp();

    const screenshotPath = path.join(screenshotDir, `new-homepage-fullpage_${runTimestamp}.png`);
    await homepage.takeFullPageScreenshot(screenshotPath);
    logger.info(`Homepage full-page screenshot saved at ${screenshotPath}`);

    const htmlContent = await extractFullHTML(page);
    const htmlPath = path.join(artifactDir, `newHomePage_research_${runTimestamp}.html`);
    fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

    const analysis = await analyzePage(page);
    const testCases = generateTestCases(analysis);
    const issues = validateAnalysis(analysis);

    const analysisPath = path.join(artifactDir, `newHomePage_research_analysis_${runTimestamp}.json`);
    fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2), 'utf-8');

    const generatedCasesPath = path.join(artifactDir, `newHomePage_research_generated_testcases_${runTimestamp}.json`);
    fs.writeFileSync(generatedCasesPath, JSON.stringify(testCases, null, 2), 'utf-8');

    const excelPath = path.join(artifactDir, `newHomePage_research_generated_testcases_${runTimestamp}.xlsx`);
    await generateExcelReport(testCases, issues, excelPath);

    const specPath = path.join(process.cwd(), 'ui_tests', 'Research', 'NewHomePage', 'newHomePage_research.spec.ts');
    const specSource = fs.readFileSync(specPath, 'utf-8');
    const implementedTests = getImplementedTestNames(specSource);
    const generatedVerifyTests = testCases
      .map((tc) => tc.name)
      .filter((name) => name.startsWith('TC_Verify_'));

    const missingInSpec = generatedVerifyTests.filter((name) => !implementedTests.has(name));
    const matchedInSpec = generatedVerifyTests.length - missingInSpec.length;

    const reverificationPath = path.join(artifactDir, `newHomePage_research_reverification_${runTimestamp}.json`);
    fs.writeFileSync(
      reverificationPath,
      JSON.stringify(
        {
          generatedCount: generatedVerifyTests.length,
          matchedInSpec,
          missingCount: missingInSpec.length,
          missingInSpec,
        },
        null,
        2,
      ),
      'utf-8',
    );

    logger.info(
      `Reverification complete. Generated: ${generatedVerifyTests.length}, matched in spec: ${matchedInSpec}, missing: ${missingInSpec.length}`,
    );
    expect(generatedVerifyTests.length).toBeGreaterThan(0);

    const hasLegacyVerifyNames = Array.from(implementedTests).some((name) => name.startsWith('TC_Verify_'));
    if (hasLegacyVerifyNames) {
      expect(matchedInSpec).toBeGreaterThan(0);
    } else {
      logger.warn('Skipping strict TC_Verify_* match assertion because spec uses consolidated test names.');
    }
    logBoundary("Completed test: TC_Precondition_Jumpstarter_Cookie_Home_And_Analysis");
  });
});