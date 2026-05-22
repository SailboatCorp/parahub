import { json, id, hashPassword, randomSalt, readJson, requireBindings } from '../_utils.js';

export async function onRequestGet({ env }) {
  requireBindings(env);
  const row = await env.DB.prepare('SELECT COUNT(*) AS count FROM users').first();
  return json({ needs_setup: Number(row.count) === 0 });
}

export async function onRequestPost({ request, env }) {
  requireBindings(env);
  const row = await env.DB.prepare('SELECT COUNT(*) AS count FROM users').first();
  if (Number(row.count) > 0) return json({ error: 'Setup already complete' }, 409);

  const body = await readJson(request);
  const username = String(body.username || '').trim().toLowerCase();
  const displayName = String(body.display_name || body.username || '').trim();
  const password = String(body.password || '');
  if (!username || !displayName || password.length < 8) {
    return json({ error: 'Username, display name, and a password of at least 8 characters are required' }, 400);
  }

  const salt = randomSalt();
  const passwordHash = await hashPassword(password, salt);
  const userId = id('user');
  await env.DB.prepare(
    'INSERT INTO users (id, username, display_name, password_hash, salt, role) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(userId, username, displayName, passwordHash, salt, 'admin').run();

  return json({ ok: true });
}
