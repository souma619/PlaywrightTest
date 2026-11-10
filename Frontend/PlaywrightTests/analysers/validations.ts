export interface Issue {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
}

export function validateAnalysis(data: any): Issue[] {
  const issues: Issue[] = [];

  // 🔴 1. Title Validation
  if (!data.title || data.title.trim() === "") {
    issues.push({
      type: "TITLE_MISSING",
      severity: "HIGH",
      message: "Page title is missing or empty"
    });
  }

  // 🔴 2. Missing H1
  const h1Count = data.headings.filter((h: any) => h.tag === 'H1').length;
  if (h1Count === 0) {
    issues.push({
      type: "H1_MISSING",
      severity: "HIGH",
      message: "No H1 tag found on page"
    });
  }

  if (h1Count > 1) {
    issues.push({
      type: "MULTIPLE_H1",
      severity: "MEDIUM",
      message: `Multiple H1 tags found (${h1Count})`
    });
  }

  // 🔴 3. Empty Headings
  data.headings.forEach((h: any, i: number) => {
    if (!h.text) {
      issues.push({
        type: "EMPTY_HEADING",
        severity: "LOW",
        message: `Heading ${h.tag} at index ${i} has no text`
      });
    }
  });

  // 🔴 4. Button Validation
  data.buttons.forEach((btn: any, i: number) => {
    if (!btn.text) {
      issues.push({
        type: "EMPTY_BUTTON",
        severity: "HIGH",
        message: `Button at index ${i} has no text`
      });
    }

    if (btn.disabled) {
      issues.push({
        type: "DISABLED_BUTTON",
        severity: "LOW",
        message: `Button '${btn.text}' is disabled`
      });
    }
  });

  // 🔴 5. Image ALT validation
  data.images.forEach((img: any, i: number) => {
    if (!img.alt) {
      issues.push({
        type: "MISSING_ALT",
        severity: "MEDIUM",
        message: `Image at index ${i} is missing alt text`
      });
    }
  });

  // 🔴 6. Link Validation
  data.links.forEach((link: any, i: number) => {
    if (!link.href || link.href.trim() === "") {
      issues.push({
        type: "INVALID_LINK",
        severity: "HIGH",
        message: `Link at index ${i} has empty href`
      });
    }

    if (!link.text) {
      issues.push({
        type: "EMPTY_LINK_TEXT",
        severity: "LOW",
        message: `Link '${link.href}' has no visible text`
      });
    }
  });

  // 🔴 7. Duplicate Headings
  const headingTexts = data.headings.map((h: any) => h.text);
  const duplicates = headingTexts.filter(
    (item: string, index: number) => headingTexts.indexOf(item) !== index
  );

  if (duplicates.length > 0) {
    issues.push({
      type: "DUPLICATE_HEADINGS",
      severity: "LOW",
      message: `Duplicate headings found: ${[...new Set(duplicates)].join(", ")}`
    });
  }

  // 🔴 8. Slider Validation
  if (data.sliders === 0) {
    issues.push({
      type: "SLIDER_MISSING",
      severity: "MEDIUM",
      message: "No slider component found on page"
    });
  }

  return issues;
}