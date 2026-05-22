const encoder = new TextEncoder();

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export function requireBindings(env) {
  if (!env.DB) throw new Error('Missing D1 binding named DB');
  if (!env.MEDIA) throw new Error('Missing R2 binding named MEDIA');
}

export function id(prefix = 'id') {
  return `${prefix}_${crypto.randomUUID()}`;
}

function hex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' },
    key,
    256
  );
  return hex(bits);
}

export function randomSalt() {
  return crypto.randomUUID() + crypto.randomUUID();
}

export function cleanUser(row) {
  if (!row) return null;
  return { id: row.id, username: row.username, display_name: row.display_name, role: row.role, created_at: row.created_at };
}

export async function getUserFromRequest(request, env) {
  requireBindings(env);
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return null;
  const now = Date.now();
  const row = await env.DB.prepare(
    `SELECT u.id, u.username, u.display_name, u.role, u.created_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > ?`
  ).bind(token, now).first();
  return cleanUser(row);
}

export async function requireUser(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user) return { error: json({ error: 'Not logged in' }, 401) };
  return { user };
}

export function requireAdmin(user) {
  if (!user || user.role !== 'admin') return json({ error: 'Admin only' }, 403);
  return null;
}

export async function getMembership(env, investigationId, user) {
  if (!user) return null;
  if (user.role === 'admin') {
    const own = await env.DB.prepare('SELECT role FROM investigation_members WHERE investigation_id = ? AND user_id = ?').bind(investigationId, user.id).first();
    return { role: own?.role || 'admin' };
  }
  return await env.DB.prepare('SELECT role FROM investigation_members WHERE investigation_id = ? AND user_id = ?').bind(investigationId, user.id).first();
}

export async function requireInvestigationAccess(env, investigationId, user) {
  const member = await getMembership(env, investigationId, user);
  if (!member) return { error: json({ error: 'You do not have access to this investigation' }, 403) };
  return { member };
}

export async function requireCaseAdmin(env, investigationId, user) {
  if (user.role === 'admin') return { ok: true };
  const member = await getMembership(env, investigationId, user);
  if (!member || member.role !== 'admin') return { error: json({ error: 'Case admin only' }, 403) };
  return { ok: true };
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function safeName(name) {
  return String(name || 'file')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

export const defaultControls = [
  'Phones away from meter',
  'Router location checked',
  'Heating pipes checked',
  'Windows and drafts checked',
  'Nearby plug sockets checked',
  'Appliances checked',
  'People and pets accounted for',
];
