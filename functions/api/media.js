import { json, requireUser, requireInvestigationAccess } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const { user, error } = await requireUser(request, env);
  if (error) return error;
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  if (!key) return json({ error: 'Missing media key' }, 400);

  const event = await env.DB.prepare('SELECT investigation_id, media_type, media_name FROM events WHERE media_key = ?').bind(key).first();
  if (!event) return json({ error: 'Media not found' }, 404);
  const access = await requireInvestigationAccess(env, event.investigation_id, user);
  if (access.error) return access.error;

  const object = await env.MEDIA.get(key);
  if (!object) return json({ error: 'File missing from storage' }, 404);

  const headers = new Headers();
  headers.set('content-type', event.media_type || object.httpMetadata?.contentType || 'application/octet-stream');
  headers.set('cache-control', 'private, max-age=300');
  headers.set('content-disposition', `inline; filename="${String(event.media_name || 'media').replace(/"/g, '')}"`);
  return new Response(object.body, { headers });
}
