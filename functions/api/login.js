import { json, hashPassword, readJson, requireBindings } from '../_utils.js';

export async function onRequestPost({ request, env }) {
  requireBindings(env);
  const body = await readJson(request);
  const username = String(body.username || '').trim().toLowerCase();
  const password = String(body.password || '');
  const user = await env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
  if (!user) return json({ error: 'Invalid username or password' }, 401);

  const attempt = await hashPassword(password, user.salt);
  if (attempt !== user.password_hash) return json({ error: 'Invalid username or password' }, 401);

  const token = crypto.randomUUID() + crypto.randomUUID();
  const expires = Date.now() + 1000 * 60 * 60 * 24 * 30;
  await env.DB.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').bind(token, user.id, expires).run();

  return json({
    token,
    user: { id: user.id, username: user.username, display_name: user.display_name, role: user.role },
  });
}
