import { test as base, expect } from '@playwright/test';

const test = base;

/**
 * Adds a delay before each test based on the worker index to stagger parallel test execution.
 * Useful for avoiding resource contention or rate limiting issues when running tests in parallel.
 *
 * @param {{}} _ - Unused test context.
 * @param {import('@playwright/test').TestInfo} testInfo - Playwright test information, including worker index.
 */

test.beforeEach(async ({}, testInfo) => {
    const delay = testInfo.workerIndex * 5000;

    console.log(
        `Worker ${testInfo.workerIndex} waiting ${delay / 1000}s`
    );

    await new Promise(resolve =>
        setTimeout(resolve, delay)
    );
});

export { test, expect };