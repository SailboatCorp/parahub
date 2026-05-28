import { json, requireUser, requireCaseAdmin, requireAcceptedTerms } from '../../../../_utils.js';

export async function onRequestDelete({ request, env, params }) {
  const { user, error } = await requireUser(request, env);
  if (error) return error;
  const termsError = requireAcceptedTerms(user);
  if (termsError) return termsError;
  const admin = await requireCaseAdmin(env, params.id, user);
  if (admin.error) return admin.error;

  const eventCount = await env.DB.prepare('SELECT COUNT(*) AS count FROM events WHERE room_id = ?').bind(params.roomId).first();
  if (Number(eventCount.count) > 0) return json({ error: 'This room has timeline events, so it cannot be deleted safely.' }, 400);

  await env.DB.prepare('DELETE FROM rooms WHERE id = ? AND investigation_id = ?').bind(params.roomId, params.id).run();
  const investigation = await env.DB.prepare('SELECT base_room_id FROM investigations WHERE id = ?').bind(params.id).first();
  if (investigation?.base_room_id === params.roomId) {
    const nextRoom = await env.DB.prepare('SELECT id FROM rooms WHERE investigation_id = ? ORDER BY created_at ASC LIMIT 1').bind(params.id).first();
    await env.DB.prepare('UPDATE investigations SET base_room_id = ? WHERE id = ?').bind(nextRoom?.id || null, params.id).run();
  }
  return json({ ok: true });
}
