export interface TestCase {
  name: string;
  step: string;
  expected: string;
}

export function generateTestCases(data: any): TestCase[] {
  const testCases: TestCase[] = [];

  // 🔹 1. Page Title
  testCases.push({
    name: "TC_Verify_Page_Title",
    step: "Fetch page title",
    expected: `Title should be exactly '${data.title}'`
  });

  // 🔹 2. Headings
  data.headings.forEach((h: any, index: number) => {
    if (h.text) {
      testCases.push({
        name: `TC_Verify_${h.tag}_${index + 1}`,
        step: `Locate ${h.tag} heading`,
        expected: `Heading text should be exactly '${h.text}'`
      });
    } else {
      testCases.push({
        name: `TC_Verify_Empty_${h.tag}_${index + 1}`,
        step: `Locate ${h.tag} heading`,
        expected: `Heading should NOT be empty`
      });
    }
  });

  // 🔹 3. Buttons
  data.buttons.forEach((btn: any, index: number) => {
    if (btn.text) {
      testCases.push({
        name: `TC_Verify_Button_${index + 1}_${btn.text}`,
        step: `Locate button '${btn.text}'`,
        expected: `Button text should be exactly '${btn.text}' and button should be clickable`
      });

      // Negative case
      testCases.push({
        name: `TC_Verify_Button_${index + 1}_${btn.text}_Not_Empty`,
        step: `Inspect button '${btn.text}'`,
        expected: `Button text should NOT be empty`
      });
    } else {
      testCases.push({
        name: `TC_Verify_Button_${index + 1}_Empty`,
        step: "Locate button",
        expected: "Button should have visible text and should NOT be empty"
      });
    }
  });

  // 🔹 4. Links
  data.links.forEach((link: any, index: number) => {
    if (link.href) {
      testCases.push({
        name: `TC_Verify_Link_${index + 1}`,
        step: `Click link '${link.text || link.href}'`,
        expected: `Link should navigate to '${link.href}'`
      });
    }

    if (!link.text) {
      testCases.push({
        name: `TC_Verify_Link_${index + 1}_Text`,
        step: `Inspect link '${link.href}'`,
        expected: "Link should have visible text and should NOT be empty"
      });
    }
  });

  // 🔹 5. Images
  data.images.forEach((img: any, index: number) => {
    testCases.push({
      name: `TC_Verify_Image_${index + 1}`,
      step: `Inspect image with src '${img.src}'`,
      expected: `Image should load successfully and src should be '${img.src}'`
    });

    if (img.alt) {
      testCases.push({
        name: `TC_Verify_Image_${index + 1}_Alt`,
        step: `Inspect alt text of image`,
        expected: `Alt text should be '${img.alt}'`
      });
    } else {
      testCases.push({
        name: `TC_Verify_Image_${index + 1}_Alt_Missing`,
        step: `Inspect alt text of image`,
        expected: "Image alt text should NOT be empty"
      });
    }
  });

  // 🔹 6. Slider
  if (data.sliders > 0) {
    testCases.push({
      name: "TC_Verify_Slider_Presence",
      step: "Locate slider component",
      expected: "Slider should be visible on page"
    });

    testCases.push({
      name: "TC_Verify_Slider_Functionality",
      step: "Drag slider left and right",
      expected: "Slider should move smoothly and update UI accordingly"
    });
  } else {
    testCases.push({
      name: "TC_Verify_Slider_Missing",
      step: "Check for slider component",
      expected: "Slider should be present on page"
    });
  }

  return testCases;
}