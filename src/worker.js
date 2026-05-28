import { onRequestGet as setupGet, onRequestPost as setupPost } from '../functions/api/setup.js';
import { onRequestPost as loginPost } from '../functions/api/login.js';
import { onRequestPost as logoutPost } from '../functions/api/logout.js';
import { onRequestGet as meGet } from '../functions/api/me.js';
import { onRequestGet as usersGet, onRequestPost as usersPost } from '../functions/api/users.js';
import { onRequestGet as mediaGet } from '../functions/api/media.js';
import { onRequestPost as termsPost } from '../functions/api/terms.js';
import { onRequestGet as investigationsGet, onRequestPost as investigationsPost } from '../functions/api/investigations/index.js';
import { onRequestGet as investigationGet, onRequestDelete as investigationDelete } from '../functions/api/investigations/[id].js';
import { onRequestPost as roomsPost } from '../functions/api/investigations/[id]/rooms.js';
import { onRequestDelete as roomDelete } from '../functions/api/investigations/[id]/rooms/[roomId].js';
import { onRequestPost as eventsPost } from '../functions/api/investigations/[id]/events.js';
import { onRequestPatch as controlPatch } from '../functions/api/investigations/[id]/controls/[controlId].js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

async function run(handler, request, env, params = {}) {
  return handler({ request, env, params });
}

function notFound() {
  return json({ error: 'API route not found' }, 404);
}

async function handleApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const method = request.method.toUpperCase();

  try {
    if (method === 'OPTIONS') return new Response(null, { status: 204 });

    if (path === '/api/setup') {
      if (method === 'GET') return run(setupGet, request, env);
      if (method === 'POST') return run(setupPost, request, env);
      return notFound();
    }

    if (path === '/api/login' && method === 'POST') return run(loginPost, request, env);
    if (path === '/api/logout' && method === 'POST') return run(logoutPost, request, env);
    if (path === '/api/me' && method === 'GET') return run(meGet, request, env);
    if (path === '/api/media' && method === 'GET') return run(mediaGet, request, env);
    if (path === '/api/terms' && method === 'POST') return run(termsPost, request, env);

    if (path === '/api/users') {
      if (method === 'GET') return run(usersGet, request, env);
      if (method === 'POST') return run(usersPost, request, env);
      return notFound();
    }

    if (path === '/api/investigations') {
      if (method === 'GET') return run(investigationsGet, request, env);
      if (method === 'POST') return run(investigationsPost, request, env);
      return notFound();
    }

    let match = path.match(/^\/api\/investigations\/([^/]+)$/);
    if (match) {
      const params = { id: decodeURIComponent(match[1]) };
      if (method === 'GET') return run(investigationGet, request, env, params);
      if (method === 'DELETE') return run(investigationDelete, request, env, params);
      return notFound();
    }

    match = path.match(/^\/api\/investigations\/([^/]+)\/rooms$/);
    if (match) {
      const params = { id: decodeURIComponent(match[1]) };
      if (method === 'POST') return run(roomsPost, request, env, params);
      return notFound();
    }

    match = path.match(/^\/api\/investigations\/([^/]+)\/rooms\/([^/]+)$/);
    if (match) {
      const params = { id: decodeURIComponent(match[1]), roomId: decodeURIComponent(match[2]) };
      if (method === 'DELETE') return run(roomDelete, request, env, params);
      return notFound();
    }

    match = path.match(/^\/api\/investigations\/([^/]+)\/events$/);
    if (match) {
      const params = { id: decodeURIComponent(match[1]) };
      if (method === 'POST') return run(eventsPost, request, env, params);
      return notFound();
    }

    match = path.match(/^\/api\/investigations\/([^/]+)\/controls\/([^/]+)$/);
    if (match) {
      const params = { id: decodeURIComponent(match[1]), controlId: decodeURIComponent(match[2]) };
      if (method === 'PATCH') return run(controlPatch, request, env, params);
      return notFound();
    }

    return notFound();
  } catch (error) {
    console.error(error);
    return json({ error: error?.message || 'Server error' }, 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return handleApi(request, env);
    }

    // Serve the Vite-built site from Cloudflare Workers static assets.
    return env.ASSETS.fetch(request);
  },
};
