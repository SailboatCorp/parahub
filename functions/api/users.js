import { json, id, hashPassword, randomSalt, readJson, requireUser, requireAdmin } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const { user, error } = await requireUser(request, env);
  if (error) return error;
  const adminError = requireAdmin(user);
  if (adminError) return adminError;
  const rows = await env.DB.prepare('SELECT id, username, display_name, role, created_at FROM users ORDER BY created_at DESC').all();
  return json({ users: rows.results || [] });
}

export async function onRequestPost({ request, env }) {
  const { user, error } = await requireUser(request, env);
  if (error) return error;
  const adminError = requireAdmin(user);
  if (adminError) return adminError;

  const body = await readJson(request);
  const username = String(body.username || '').trim().toLowerCase();
  const displayName = String(body.display_name || body.username || '').trim();
  const role = String(body.role || 'investigator');
  const password = String(body.password || '');
  if (!username || !displayName || password.length < 8) return json({ error: 'Username, display name, and password of at least 8 characters are required' }, 400);
  if (!['admin', 'investigator', 'viewer'].includes(role)) return json({ error: 'Invalid role' }, 400);

  const salt = randomSalt();
  const passwordHash = await hashPassword(password, salt);
  const userId = id('user');
  try {
    await env.DB.prepare('INSERT INTO users (id, username, display_name, password_hash, salt, role) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(userId, username, displayName, passwordHash, salt, role).run();
  } catch (err) {
    return json({ error: 'Could not create account. The username may already exist.' }, 400);
  }
  return json({ ok: true, user: { id: userId, username, display_name: displayName, role } });
}
