const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json());
const pool = new Pool({
host: process.env.DB_HOST || 'db',
port: Number(process.env.DB_PORT || 5432),
user: process.env.DB_USER || 'monapp',
password: process.env.DB_PASSWORD || 'monapp',
database: process.env.DB_NAME || 'monapp',
});
app.get('/api/health', (req, res) => {
res.json({ status: 'ok' });
});
app.get('/api/tasks', async (req, res) => {
try {
const { rows } = await pool.query(
'SELECT id, title, done, created_at FROM tasks ORDER BY id'
);
res.json(rows);
} catch (err) {
console.error(err);
res.status(500).json({ error: 'database error' });
}
});
app.post('/api/tasks', async (req, res) => {
const title = (req.body.title || '').trim();
if (!title) {
return res.status(400).json({ error: 'title required' });
}
try {
const { rows } = await pool.query(
'INSERT INTO tasks (title) VALUES ($1) RETURNING id, title, done, created_at',
[title]
);
res.status(201).json(rows[0]);
} catch (err) {
console.error(err);
res.status(500).json({ error: 'database error' });
}
});
app.delete('/api/tasks/:id', async (req, res) => {
const id = Number(req.params.id);
if (!Number.isInteger(id) || id <= 0) {
return res.status(400).json({ error: 'invalid id' });
}
try {
const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
if (rowCount === 0) {
return res.status(404).json({ error: 'task not found' });
}
res.status(204).end();
} catch (err) {
console.error(err);
res.status(500).json({ error: 'database error' });
}
});
async function migrate() {
await pool.query(`
CREATE TABLE IF NOT EXISTS tasks (
id SERIAL PRIMARY KEY,
title TEXT NOT NULL,
done BOOLEAN NOT NULL DEFAULT FALSE,
created_at TIMESTAMP NOT NULL DEFAULT NOW()
)
`);
}
async function start() {
for (let i = 1; i <= 30; i++) {
try {
await migrate();
break;
} catch (err) {
console.log(`Base pas prête (tentative ${i}/30) : ${err.message}`);
if (i === 30) process.exit(1);
await new Promise((resolve) => setTimeout(resolve, 2000));
}
}
app.listen(3000, () => console.log('Backend prêt sur le port 3000'));
}
if (require.main === module) {
    start();
}
module.exports = app;