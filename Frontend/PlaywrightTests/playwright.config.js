import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
//dotenv.config();
//dotenv.config({ path: './.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, '.env')
});

//console.log('BASE URL:', process.env.ui_base_url);
//console.log('ENV:', process.env.environment);

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: '.',
  testMatch: [
    'ui_tests/**/*.spec.ts'
  ],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report/html-report' }],
    ['junit', { outputFile: 'test-results/junit-results.xml' }]
  ],
  use: {
    screenshot: 'on',
    baseURL: process.env.ui_base_url,
    trace: 'on-first-retry',
    navigationTimeout: 60000,
    actionTimeout: 60000,

    // ✅ High quality video recording
    video: {
      mode: 'on',
      size: { width: 1920, height: 1080 }
    },
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    env: {
      USE_BABEL_PLUGIN_ISTANBUL: '1',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // ✅ Viewport matches video size for sharp recording
        viewport: { width: 1920, height: 1080 },

        // ✅ Headless only in CI
        headless: !!process.env.CI,

        launchOptions: {
          args: [
            '--disable-features=BlockThirdPartyCookies',
            '--disable-features=ThirdPartyStoragePartitioning',
            '--disable-features=PartitionedCookies',
            '--disable-features=SameSiteByDefaultCookies',
            '--disable-web-security',
            '--disable-site-isolation-trials'
          ]
        }
      },
    },
  ],
});