const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { resolvePublicPath } = require('./server');

test('maps the root to the game page', () => {
  assert.equal(path.basename(resolvePublicPath('/')), 'index.html');
});

test('rejects traversal outside public directory', () => {
  assert.equal(resolvePublicPath('/%2e%2e%2fserver.js'), null);
});
