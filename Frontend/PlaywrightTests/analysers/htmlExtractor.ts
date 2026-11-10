import { Page } from '@playwright/test';

export async function extractFullHTML(page: Page): Promise<string> {
  // Gets full DOM including DOCTYPE
  const html = await page.content();

  return `<!DOCTYPE html>\n${html}`;
}
