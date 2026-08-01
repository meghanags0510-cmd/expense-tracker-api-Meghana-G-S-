const fs = require('fs');
const path = require('path');

function resolveDataFile() {
  return process.env.DATA_FILE || path.join(__dirname, '..', '..', 'data', 'expenses.json');
}

function ensureFileExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]', 'utf8');
  }
}

function load() {
  const filePath = resolveDataFile();
  ensureFileExists(filePath);
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function save(expenses) {
  const filePath = resolveDataFile();
  ensureFileExists(filePath);
  fs.writeFileSync(filePath, JSON.stringify(expenses, null, 2), 'utf8');
}

module.exports = { load, save, resolveDataFile };
