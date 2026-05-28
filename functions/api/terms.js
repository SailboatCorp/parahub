import { json, requireUser, cleanUser, CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION } from '../_utils.js';

export async function onRequestPost({ request, env }) {
  const { user, error } = await requireUser(request, env);
  if (error) return error;

  const acceptedAt = new Date().toISOString();
  await env.DB.prepare(`
    UPDATE users
    SET terms_accepted = 1,
        accepted_terms_version = ?,
        accepted_privacy_version = ?,
        terms_accepted_at = ?,
        terms_accepted_by_user_id = ?,
        terms_accepted_by_name = ?
    WHERE id = ?
  `).bind(
    CURRENT_TERMS_VERSION,
    CURRENT_PRIVACY_VERSION,
    acceptedAt,
    user.id,
    user.display_name || user.username || '',
    user.id
  ).run();

  const row = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(user.id).first();
  return json({ ok: true, user: cleanUser(row) });
}
