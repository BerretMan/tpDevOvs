const test = require('node:test');
const assert = require('node:assert');
const app = require('./server');
test('GET /api/health répond ok', async () => {
const server = app.listen(0);
const { port } = server.address();
const res = await fetch(`http://127.0.0.1:${port}/api/health`);
const body = await res.json();
server.close();
assert.strictEqual(res.status, 200);
assert.strictEqual(body.status, 'ok');
});

test('PATCH /api/tasks/:id refuse un corps invalide', async () => {
const server = app.listen(0);
const { port } = server.address();
const res = await fetch(`http://127.0.0.1:${port}/api/tasks/1`, {
method: 'PATCH',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ done: 'oui' }),
});
server.close();
assert.strictEqual(res.status, 400);
});

test('POST /api/tasks sans titre répond 400', async () => {
const server = app.listen(0);
const { port } = server.address();
const res = await fetch(`http://127.0.0.1:${port}/api/tasks`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ title: '' }),
});
server.close();
assert.strictEqual(res.status, 400);
});

test('DELETE /api/tasks/abc répond 400', async () => {
const server = app.listen(0);
const { port } = server.address();
const res = await fetch(`http://127.0.0.1:${port}/api/tasks/abc`, { method: 'DELETE' });
server.close();
assert.strictEqual(res.status, 400);
});
