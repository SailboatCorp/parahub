import { json, requireUser } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const { user, error } = await requireUser(request, env);
  if (error) return error;
  return json({ user });
}
