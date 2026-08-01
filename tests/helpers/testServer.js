const os = require('os');
const path = require('path');
const fs = require('fs');

function createTestContext() {
  const dataFile = path.join(
    os.tmpdir(),
    `expense-tracker-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
  );
  fs.writeFileSync(dataFile, '[]', 'utf8');
  process.env.DATA_FILE = dataFile;

  // Force a fresh require of the service module so its in-memory cache
  // doesn't leak state from a previous test's DATA_FILE.
  jest.resetModules();
  const createApp = require('../../src/app');
  const app = createApp();

  return {
    app,
    dataFile,
    cleanup() {
      if (fs.existsSync(dataFile)) {
        fs.unlinkSync(dataFile);
      }
    },
  };
}

module.exports = { createTestContext };
