import { json, requireUser, requireInvestigationAccess, requireCaseAdmin, requireAcceptedTerms } from '../../_utils.js';

export async function onRequestGet({ request, env, params }) {
  const { user, error } = await requireUser(request, env);
  if (error) return error;
  const termsError = requireAcceptedTerms(user);
  if (termsError) return termsError;
  const investigationId = params.id;
  const access = await requireInvestigationAccess(env, investigationId, user);
  if (access.error) return access.error;

  const investigation = await env.DB.prepare('SELECT * FROM investigations WHERE id = ?').bind(investigationId).first();
  if (!investigation) return json({ error: 'Investigation not found' }, 404);

  const rooms = (await env.DB.prepare('SELECT * FROM rooms WHERE investigation_id = ? ORDER BY created_at ASC').bind(investigationId).all()).results || [];
  const members = (await env.DB.prepare(`
    SELECT m.id, m.user_id, m.role, u.username, u.display_name
    FROM investigation_members m
    JOIN users u ON u.id = m.user_id
    WHERE m.investigation_id = ?
    ORDER BY u.display_name ASC
  `).bind(investigationId).all()).results || [];
  const events = (await env.DB.prepare(`
    SELECT e.*, r.name AS room_name, u.display_name AS user_name, u.username AS username
    FROM events e
    JOIN rooms r ON r.id = e.room_id
    JOIN users u ON u.id = e.user_id
    WHERE e.investigation_id = ?
    ORDER BY e.created_at DESC
  `).bind(investigationId).all()).results || [];
  const controls = (await env.DB.prepare('SELECT * FROM control_checks WHERE investigation_id = ? ORDER BY created_at ASC').bind(investigationId).all()).results || [];

  return json({ investigation, rooms, members, events, controls, current_member_role: access.member.role });
}

export async function onRequestDelete({ request, env, params }) {
  const { user, error } = await requireUser(request, env);
  if (error) return error;
  const termsError = requireAcceptedTerms(user);
  if (termsError) return termsError;
  const admin = await requireCaseAdmin(env, params.id, user);
  if (admin.error) return admin.error;

  await env.DB.prepare('DELETE FROM investigations WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}
