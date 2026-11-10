import ExcelJS from 'exceljs';
import { TestCase } from '../analysers/testCaseGenerator';
import { Issue } from '../analysers/validations';

export async function generateExcelReport(
  testCases: TestCase[],
  issues: Issue[],
  filePath: string
) {
  const workbook = new ExcelJS.Workbook();

  // =========================
  // 📄 SHEET 1: TEST CASES
  // =========================
  const testSheet = workbook.addWorksheet('Test Cases');

  testSheet.columns = [
    { header: 'TestCase Name', key: 'name', width: 40 },
    { header: 'Test Step Details', key: 'step', width: 50 },
    { header: 'Expected Result', key: 'expected', width: 60 }
  ];

  // Header styling
  testSheet.getRow(1).font = { bold: true };

  testCases.forEach(tc => {
    testSheet.addRow({
      name: tc.name,
      step: tc.step,
      expected: tc.expected
    });
  });

  // =========================
  // 📄 SHEET 2: ISSUES
  // =========================
  const issueSheet = workbook.addWorksheet('Issues');

  issueSheet.columns = [
    { header: 'Type', key: 'type', width: 25 },
    { header: 'Severity', key: 'severity', width: 15 },
    { header: 'Message', key: 'message', width: 80 }
  ];

  issueSheet.getRow(1).font = { bold: true };

  issues.forEach(issue => {
    const row = issueSheet.addRow(issue);

    // 🎨 Color based on severity
    if (issue.severity === 'HIGH') {
      row.font = { color: { argb: 'FFFF0000' } }; // Red
    } else if (issue.severity === 'MEDIUM') {
      row.font = { color: { argb: 'FFFFA500' } }; // Orange
    } else if (issue.severity === 'LOW') {
      row.font = { color: { argb: 'FF808080' } }; // Grey
    }
  });

  // =========================
  // 💾 SAVE FILE
  // =========================
  await workbook.xlsx.writeFile(filePath);

  console.log(`📊 Excel Report Generated: ${filePath}`);
}