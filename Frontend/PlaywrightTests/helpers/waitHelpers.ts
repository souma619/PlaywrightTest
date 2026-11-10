import { expect, Locator, Page } from "@playwright/test";

/**
 * Waits for the spinner to disappear, if it's visible.
 */
export async function waitForSpinnerToDisappear(page: Page, timeout: number = 10000): Promise<void> {
  try {
    const visibleSpinners = page.locator("div.chakra-progress[role='progressbar']:visible");
    const visibleCount = await visibleSpinners.count();

    if (visibleCount > 0) {
      await expect(visibleSpinners).toHaveCount(0, { timeout });
      console.log("Spinner disappeared.");
    } else {
      console.log("Spinner not found — skipping wait.");
    }
  } catch (error: any) {
    console.log("Spinner wait skipped or failed gracefully:", error.message);
    // Do not rethrow — handled gracefully
  }
}

export async function hideChatBubble(page: Page): Promise<void> {
  await page.evaluate(() => {
    const bubble = document.querySelector('.ecEmbedWidgetLauncher');
    if (bubble) {
      (bubble as HTMLElement).style.display = 'none'; 
    }
  });
}

/**
 * Handles the OneTrust cookie consent popup, if it appears.
 * Clicks "Accept All Cookies" and verifies the banner disappears.
 */
export async function acceptCookiesIfPresent(page: Page, timeout: number = 10000): Promise<void> {
  try {
    const consentOverlay = page.locator("#onetrust-consent-sdk");
    const acceptButton = page.locator("#onetrust-accept-btn-handler");

    try {
      await acceptButton.waitFor({ state: "visible", timeout });
      await acceptButton.click();
      await expect(consentOverlay).toBeHidden({ timeout });
      console.log("Cookie consent accepted and banner dismissed.");
      return;
    } catch {
      const closeButton = page.locator(
        "#onetrust-close-btn-container button, #onetrust-pc-sdk .ot-close-icon"
      ).first();
      if (!(await closeButton.isVisible().catch(() => false))) {
        console.log("Cookie banner not found — skipping.");
        return;
      }
      await closeButton.click();
      await expect(consentOverlay).toBeHidden({ timeout });
      console.log("Cookie consent closed and banner dismissed.");
    }
  } catch (error: any) {
    console.log("Cookie consent handling skipped or failed gracefully:", error.message);
    // Do not rethrow — handled gracefully
  }
}
