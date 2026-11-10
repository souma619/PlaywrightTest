export async function analyzePage(page: any) {
  return await page.evaluate(() => {
    const getText = (el: any) => el?.innerText?.trim() || "";

    const headings = Array.from(document.querySelectorAll('h1,h2,h3')).map(h => ({
      tag: h.tagName,
      text: getText(h)
    }));

    const buttons = Array.from(document.querySelectorAll('button')).map(btn => ({
      text: getText(btn),
      disabled: (btn as HTMLButtonElement).disabled
    }));

    const links = Array.from(document.querySelectorAll('a')).map(a => ({
      text: getText(a),
      href: (a as HTMLAnchorElement).href
    }));

    const images = Array.from(document.querySelectorAll('img')).map(img => ({
      src: (img as HTMLImageElement).src,
      alt: (img as HTMLImageElement).alt
    }));

    const sliders = Array.from(
      document.querySelectorAll('[role="slider"], input[type="range"]')
    ).length;

    return {
      title: document.title,
      headings,
      buttons,
      links,
      images,
      sliders
    };
  });
}