import { json, id, hashPassword, randomSalt, readJson, requireUser, requireAdmin, requireAcceptedTerms } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const { user, error } = await requireUser(request, env);
  if (error) return error;
  const termsError = requireAcceptedTerms(user);
  if (termsError) return termsError;
  const adminError = requireAdmin(user);
  if (adminError) return adminError;
  const rows = await env.DB.prepare('SELECT id, username, display_name, role, created_at, credit_preference, custom_credit_name, terms_accepted, accepted_terms_version, accepted_privacy_version, terms_accepted_at FROM users ORDER BY created_at DESC').all();
  return json({ users: rows.results || [] });
}

export async function onRequestPost({ request, env }) {
  const { user, error } = await requireUser(request, env);
  if (error) return error;
  const termsError = requireAcceptedTerms(user);
  if (termsError) return termsError;
  const adminError = requireAdmin(user);
  if (adminError) return adminError;

  const body = await readJson(request);
  const username = String(body.username || '').trim().toLowerCase();
  const displayName = String(body.display_name || body.username || '').trim();
  const role = String(body.role || 'investigator');
  const creditPreference = String(body.credit_preference || 'Anonymous investigator');
  const customCreditName = String(body.custom_credit_name || '').trim();
  const password = String(body.password || '');
  if (!username || !displayName || password.length < 8) return json({ error: 'Username, display name, and password of at least 8 characters are required' }, 400);
  if (!['admin', 'investigator', 'viewer'].includes(role)) return json({ error: 'Invalid role' }, 400);
  const allowedCredit = ['Anonymous investigator', 'First name only', 'Full name', 'Custom credit name', 'Do not publicly credit me'];
  if (!allowedCredit.includes(creditPreference)) return json({ error: 'Invalid credit preference' }, 400);

  const salt = randomSalt();
  const passwordHash = await hashPassword(password, salt);
  const userId = id('user');
  try {
    await env.DB.prepare(`
      INSERT INTO users (id, username, display_name, password_hash, salt, role, credit_preference, custom_credit_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(userId, username, displayName, passwordHash, salt, role, creditPreference, customCreditName).run();
  } catch (err) {
    return json({ error: 'Could not create account. The username may already exist, or the database may need migration 0002_terms_acceptance.sql.' }, 400);
  }
  return json({ ok: true, user: { id: userId, username, display_name: displayName, role, credit_preference: creditPreference, custom_credit_name: customCreditName } });
}
