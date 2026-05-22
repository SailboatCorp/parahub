import { json, id, safeName, readJson, requireUser, requireInvestigationAccess } from '../../../_utils.js';

const MAX_FILE_SIZE = 25 * 1024 * 1024;

function normalizeClassification(value) {
  const allowed = ['Unreviewed', 'Known cause', 'Likely normal cause', 'Unclear', 'High-interest anomaly'];
  return allowed.includes(value) ? value : 'Unreviewed';
}

export async function onRequestPost({ request, env, params }) {
  const { user, error } = await requireUser(request, env);
  if (error) return error;
  const access = await requireInvestigationAccess(env, params.id, user);
  if (access.error) return access.error;
  if (access.member.role === 'viewer') return json({ error: 'Viewers cannot add events' }, 403);

  const contentType = request.headers.get('content-type') || '';
  let type, roomId, value, unit, note, classification, file;

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    type = String(form.get('type') || '').trim();
    roomId = String(form.get('room_id') || '').trim();
    value = String(form.get('value') || '').trim();
    unit = String(form.get('unit') || '').trim();
    note = String(form.get('note') || '').trim();
    classification = normalizeClassification(String(form.get('classification') || 'Unreviewed'));
    const maybeFile = form.get('file');
    if (maybeFile && typeof maybeFile === 'object' && maybeFile.size > 0) file = maybeFile;
  } else {
    const body = await readJson(request);
    type = String(body.type || '').trim();
    roomId = String(body.room_id || '').trim();
    value = String(body.value || '').trim();
    unit = String(body.unit || '').trim();
    note = String(body.note || '').trim();
    classification = normalizeClassification(String(body.classification || 'Unreviewed'));
  }

  if (!type) return json({ error: 'Event type is required' }, 400);
  const room = await env.DB.prepare('SELECT id FROM rooms WHERE id = ? AND investigation_id = ?').bind(roomId, params.id).first();
  if (!room) return json({ error: 'Invalid room for this investigation' }, 400);

  let mediaKey = null;
  let mediaName = null;
  let mediaType = null;
  let mediaSize = null;
  const eventId = id('event');

  if (file) {
    if (file.size > MAX_FILE_SIZE) return json({ error: 'File is too large. Max size is 25 MB for V1.' }, 400);
    if (!file.type.startsWith('image/') && !file.type.startsWith('audio/')) return json({ error: 'Only image and audio files are allowed in V1.' }, 400);
    mediaName = safeName(file.name || `${type.toLowerCase()}-upload`);
    mediaType = file.type || 'application/octet-stream';
    mediaSize = file.size;
    mediaKey = `investigations/${params.id}/events/${eventId}/${Date.now()}-${mediaName}`;
    await env.MEDIA.put(mediaKey, file.stream(), {
      httpMetadata: { contentType: mediaType },
      customMetadata: { originalName: mediaName, investigationId: params.id, eventId },
    });
  }

  await env.DB.prepare(`
    INSERT INTO events (id, investigation_id, room_id, user_id, type, value, unit, note, classification, media_key, media_name, media_type, media_size)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(eventId, params.id, roomId, user.id, type, value, unit, note, classification, mediaKey, mediaName, mediaType, mediaSize).run();

  return json({ ok: true, id: eventId });
}
