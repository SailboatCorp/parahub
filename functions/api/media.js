import { json, requireUser, requireInvestigationAccess, requireAcceptedTerms } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const { user, error } = await requireUser(request, env);
  if (error) return error;
  const termsError = requireAcceptedTerms(user);
  if (termsError) return termsError;
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  if (!key) return json({ error: 'Missing media key' }, 400);

  const event = await env.DB.prepare('SELECT investigation_id, media_type, media_name, media_data FROM events WHERE media_key = ?').bind(key).first();
  if (!event) return json({ error: 'Media not found' }, 404);
  const access = await requireInvestigationAccess(env, event.investigation_id, user);
  if (access.error) return access.error;

  if (!event.media_data) return json({ error: 'File missing from database' }, 404);
  const binary = atob(event.media_data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const headers = new Headers();
  headers.set('content-type', event.media_type || 'application/octet-stream');
  headers.set('cache-control', 'private, max-age=300');
  headers.set('content-disposition', `inline; filename="${String(event.media_name || 'media').replace(/"/g, '')}"`);
  return new Response(bytes, { headers });
}
