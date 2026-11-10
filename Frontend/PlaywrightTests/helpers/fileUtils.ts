import fs from 'fs';
import path from 'path';

// ✅ Ensure directory exists (VERY IMPORTANT)
export function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ✅ Save JSON file
export function saveJSON(data: any, filePath: string) {
  const dir = path.dirname(filePath);
  ensureDir(dir);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`📁 JSON saved: ${filePath}`);
}

// ✅ Save simple text/log file (optional)
export function saveText(content: string, filePath: string) {
  const dir = path.dirname(filePath);
  ensureDir(dir);

  fs.writeFileSync(filePath, content);
  console.log(`📄 File saved: ${filePath}`);
}

export function saveHTML(content: string, filePath: string) {
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, content, 'utf-8');
}

// ✅ Create full report folder structure (one call)
export function createReportFolders(basePath: string) {
  const folders = [
    `${basePath}/screenshots`,
    `${basePath}/json`,
    `${basePath}/excel`
  ];

  folders.forEach(folder => ensureDir(folder));

  console.log(`📂 Report folders created under: ${basePath}`);

  
}