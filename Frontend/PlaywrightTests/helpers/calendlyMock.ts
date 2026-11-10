import { Page } from '@playwright/test';

export async function mockCalendlyIfNeeded(page: Page) {

  const shouldMock = process.env.MOCK_CALENDLY === 'true';
  if (!shouldMock) return;

  console.log('Running with MOCK Calendly booking');

  await page.addInitScript(() => {

    // Keep sending success event every 2 seconds
    const sendCalendlySuccess = () => {
      window.postMessage(
        {
          event: 'calendly.event_scheduled',
          payload: {
            event: { uri: 'https://calendly.com/fake-event' }
          }
        },
        '*'
      );
    };

    // send continuously so app receives it whenever Calendly opens
    setInterval(sendCalendlySuccess, 2000);
  });
}
