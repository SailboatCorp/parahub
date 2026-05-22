import { json, readJson, requireUser, requireCaseAdmin } from '../../../../_utils.js';

export async function onRequestPatch({ request, env, params }) {
  const { user, error } = await requireUser(request, env);
  if (error) return error;
  const admin = await requireCaseAdmin(env, params.id, user);
  if (admin.error) return admin.error;

  const body = await readJson(request);
  const checked = body.checked ? 1 : 0;
  await env.DB.prepare('UPDATE control_checks SET checked = ? WHERE id = ? AND investigation_id = ?').bind(checked, params.controlId, params.id).run();
  return json({ ok: true });
}
