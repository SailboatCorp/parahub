import { json, id, readJson, requireUser, requireCaseAdmin, requireAcceptedTerms } from '../../../_utils.js';

export async function onRequestPost({ request, env, params }) {
  const { user, error } = await requireUser(request, env);
  if (error) return error;
  const termsError = requireAcceptedTerms(user);
  if (termsError) return termsError;
  const admin = await requireCaseAdmin(env, params.id, user);
  if (admin.error) return admin.error;

  const body = await readJson(request);
  const name = String(body.name || '').trim();
  if (!name) return json({ error: 'Room name is required' }, 400);
  const roomId = id('room');
  try {
    await env.DB.prepare('INSERT INTO rooms (id, investigation_id, name) VALUES (?, ?, ?)').bind(roomId, params.id, name).run();
  } catch {
    return json({ error: 'Room could not be added. It may already exist.' }, 400);
  }
  const base = await env.DB.prepare('SELECT base_room_id FROM investigations WHERE id = ?').bind(params.id).first();
  if (!base?.base_room_id) await env.DB.prepare('UPDATE investigations SET base_room_id = ? WHERE id = ?').bind(roomId, params.id).run();
  return json({ ok: true, room: { id: roomId, investigation_id: params.id, name } });
}
