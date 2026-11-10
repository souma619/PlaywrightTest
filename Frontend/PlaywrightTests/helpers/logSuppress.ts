import { Page } from '@playwright/test';

const attachedPages = new WeakSet<Page>();

const suppressPatterns = [
  'TP: Tracking Event:',
  '0: I: error state changed',
  '0: I: question data init',
  '0: SQ: validating form',
  'theme in RemodelProfile',
  '0: error/warning changed:',
  '0: Max file size for upload is',
  '[oaiq]',
  'Amplitude Logger [Warn]',
  'Amplitude Logger [Error]',
  'Engagement SDK',
  '[Amplitude]',
  'Failed to load resource',
  '[vision_load_ms]',
  'THREE.KTX2Loader: ETC1S and UASTC textures should use multiple-of-four dimensions.',
  '[.WebGL-0x15f4018f8e00]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels'
  // add more patterns here as needed
];

export function attachConsoleLogger(page: Page): void {
  if (attachedPages.has(page)) {
    return;
  }

  attachedPages.add(page);

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();

    // Keep error logs visible for debugging real test failures.
    if (suppressPatterns.some(pattern => text.includes(pattern))) return;

    const timestamp = new Date().toUTCString();
    console.log(`${timestamp} - ${type.toUpperCase()} - ${text}`);
  });
}