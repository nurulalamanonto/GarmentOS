import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  server = createApp().listen(0); // port 0 = pick any free port
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://localhost:${server.address().port}`;
});

after(() => {
  server.close();
  server.closeAllConnections(); // drop keep-alive sockets so the test run can exit
});

test('GET /api/health returns the standard success shape', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  const { success, data, message } = await response.json();

  assert.equal(response.status, 200);
  assert.equal(success, true);
  assert.equal(data.status, 'ok');
  assert.equal(typeof message, 'string');
});

test('unknown routes return a 404 in the standard error shape', async () => {
  const response = await fetch(`${baseUrl}/api/does-not-exist`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.success, false);
  assert.match(body.message, /Route not found/);
});

test('invalid JSON bodies return 400 without leaking internals', async () => {
  const response = await fetch(`${baseUrl}/api/health`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{ not valid json',
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.stack, undefined);
});
