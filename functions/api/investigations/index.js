import { json, id, readJson, requireUser, requireAdmin, requireAcceptedTerms, defaultControls } from '../../_utils.js';

async function getCaseList(env, user) {
  if (user.role === 'admin') {
    const rows = await env.DB.prepare(`
      SELECT i.*,
        (SELECT COUNT(*) FROM rooms r WHERE r.investigation_id = i.id) AS room_count,
        (SELECT COUNT(*) FROM events e WHERE e.investigation_id = i.id) AS event_count,
        'admin' AS member_role
      FROM investigations i
      ORDER BY i.created_at DESC
    `).all();
    return rows.results || [];
  }

  const rows = await env.DB.prepare(`
    SELECT i.*,
      m.role AS member_role,
      (SELECT COUNT(*) FROM rooms r WHERE r.investigation_id = i.id) AS room_count,
      (SELECT COUNT(*) FROM events e WHERE e.investigation_id = i.id) AS event_count
    FROM investigations i
    JOIN investigation_members m ON m.investigation_id = i.id
    WHERE m.user_id = ?
    ORDER BY i.created_at DESC
  `).bind(user.id).all();
  return rows.results || [];
}

export async function onRequestGet({ request, env }) {
  const { user, error } = await requireUser(request, env);
  if (error) return error;
  const termsError = requireAcceptedTerms(user);
  if (termsError) return termsError;
  return json({ investigations: await getCaseList(env, user) });
}

export async function onRequestPost({ request, env }) {
  const { user, error } = await requireUser(request, env);
  if (error) return error;
  const termsError = requireAcceptedTerms(user);
  if (termsError) return termsError;
  const adminError = requireAdmin(user);
  if (adminError) return adminError;

  const body = await readJson(request);
  const title = String(body.title || '').trim();
  const location = String(body.location || '').trim();
  const date = String(body.date || '').trim();
  const lead = String(body.lead || '').trim();
  const rooms = Array.isArray(body.rooms) ? body.rooms.map((r) => String(r.name || r).trim()).filter(Boolean) : [];
  const baseCampIndex = Number.isInteger(body.baseCampIndex) ? body.baseCampIndex : 0;
  const memberUserIds = Array.isArray(body.memberUserIds) ? body.memberUserIds : [];

  if (!title) return json({ error: 'Case name is required' }, 400);
  if (rooms.length === 0) return json({ error: 'Add at least one room' }, 400);

  const investigationId = id('case');
  await env.DB.prepare('INSERT INTO investigations (id, title, location, date, lead, owner_id) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(investigationId, title, location, date, lead, user.id).run();
  await env.DB.prepare('INSERT INTO investigation_members (id, investigation_id, user_id, role) VALUES (?, ?, ?, ?)')
    .bind(id('member'), investigationId, user.id, 'admin').run();

  let baseRoomId = null;
  for (let index = 0; index < rooms.length; index++) {
    const roomId = id('room');
    if (index === baseCampIndex) baseRoomId = roomId;
    await env.DB.prepare('INSERT INTO rooms (id, investigation_id, name) VALUES (?, ?, ?)').bind(roomId, investigationId, rooms[index]).run();
  }
  await env.DB.prepare('UPDATE investigations SET base_room_id = ? WHERE id = ?').bind(baseRoomId, investigationId).run();

  for (const memberUserId of memberUserIds) {
    if (memberUserId === user.id) continue;
    const member = await env.DB.prepare('SELECT id, role FROM users WHERE id = ?').bind(memberUserId).first();
    if (member) {
      await env.DB.prepare('INSERT OR IGNORE INTO investigation_members (id, investigation_id, user_id, role) VALUES (?, ?, ?, ?)')
        .bind(id('member'), investigationId, member.id, member.role === 'admin' ? 'admin' : member.role).run();
    }
  }

  for (const label of defaultControls) {
    await env.DB.prepare('INSERT INTO control_checks (id, investigation_id, label, checked) VALUES (?, ?, ?, 0)').bind(id('control'), investigationId, label).run();
  }

  return json({ ok: true, id: investigationId });
}
