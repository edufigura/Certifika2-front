const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const ts = require('typescript');
const source = readFileSync(join(__dirname, '../src/lib/deliveryStatus.ts'), 'utf8');
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const compiled = { exports: {} };
new Function('module', 'exports', output)(compiled, compiled.exports);
const { deliveryState } = compiled.exports;
const event = { id: 'real-event', acceptedBySqs: false, attempts: 0 };

test('acceptance by SQS does not imply consumer processing', () => {
  assert.equal(deliveryState({ ...event, acceptedBySqs: true }).key, 'accepted');
  assert.equal(deliveryState({ ...event, acceptedBySqs: true }, { processed: false }).key, 'accepted');
});
test('consumer confirmation is required for processed state', () => {
  assert.equal(deliveryState(event).key, 'pending');
  assert.equal(deliveryState(event, { processed: true, delivered: 0, readCount: 0 }).key, 'processed');
});
test('failed attempts remain pending rather than showing success', () => {
  assert.equal(deliveryState({ ...event, attempts: 3 }).label, 'Pendiente de reintento');
});
