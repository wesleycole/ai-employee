import { verifyToken } from '@clerk/backend';
import type { ThreadMessage } from './thread';
export { Thread, type ThreadMessage } from './thread';

interface UserInput {
  id: string;
  email: string;
  name?: string | null;
}

interface ThreadInput {
  id: string;
  title?: string | null;
}

async function authenticate(request: Request, env: Env): Promise<{ userId: string } | null> {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });
    return { userId: payload.sub };
  } catch {
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/').filter(Boolean);

    const auth = await authenticate(request, env);
    if (!auth) {
      return new Response('Unauthorized', { status: 401 });
    }

    // User endpoints: POST /users (find or create)
    if (pathParts[0] === 'users' && pathParts.length === 1 && request.method === 'POST') {
      const input = (await request.json()) as UserInput;
      
      // Try to find existing user
      const existing = await env.DB.prepare(
        'SELECT * FROM users WHERE id = ?'
      ).bind(input.id).first();

      if (existing) {
        // Update user info if changed
        await env.DB.prepare(
          `UPDATE users SET email = ?, name = ?, updated_at = datetime('now') WHERE id = ?`
        ).bind(input.email, input.name || null, input.id).run();
        
        const updated = await env.DB.prepare(
          'SELECT * FROM users WHERE id = ?'
        ).bind(input.id).first();
        return Response.json(updated);
      }

      // Create new user
      await env.DB.prepare(
        'INSERT INTO users (id, email, name) VALUES (?, ?, ?)'
      ).bind(input.id, input.email, input.name || null).run();

      const newUser = await env.DB.prepare(
        'SELECT * FROM users WHERE id = ?'
      ).bind(input.id).first();
      return Response.json(newUser, { status: 201 });
    }

    // User threads: GET /users/:userId/threads
    if (pathParts[0] === 'users' && pathParts[2] === 'threads' && pathParts.length === 3 && request.method === 'GET') {
      const userId = pathParts[1];
      const threads = await env.DB.prepare(
        'SELECT * FROM threads WHERE user_id = ? ORDER BY updated_at DESC'
      ).bind(userId).all();
      return Response.json(threads.results);
    }

    // Create thread: POST /users/:userId/threads
    if (pathParts[0] === 'users' && pathParts[2] === 'threads' && pathParts.length === 3 && request.method === 'POST') {
      const userId = pathParts[1];
      const input = (await request.json()) as ThreadInput;

      await env.DB.prepare(
        'INSERT OR IGNORE INTO threads (id, user_id, title) VALUES (?, ?, ?)'
      ).bind(input.id, userId, input.title || null).run();

      const thread = await env.DB.prepare(
        'SELECT * FROM threads WHERE id = ?'
      ).bind(input.id).first();
      return Response.json(thread, { status: 201 });
    }

    // Verify thread ownership: GET /users/:userId/threads/:threadId
    if (pathParts[0] === 'users' && pathParts[2] === 'threads' && pathParts.length === 4 && request.method === 'GET') {
      const userId = pathParts[1];
      const threadId = pathParts[3];

      const thread = await env.DB.prepare(
        'SELECT * FROM threads WHERE id = ? AND user_id = ?'
      ).bind(threadId, userId).first();

      if (!thread) {
        return new Response('Thread not found', { status: 404 });
      }
      return Response.json(thread);
    }

    // Update thread: PATCH /users/:userId/threads/:threadId
    if (pathParts[0] === 'users' && pathParts[2] === 'threads' && pathParts.length === 4 && request.method === 'PATCH') {
      const userId = pathParts[1];
      const threadId = pathParts[3];
      const input = (await request.json()) as { title?: string };

      const result = await env.DB.prepare(
        `UPDATE threads SET title = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?`
      ).bind(input.title || null, threadId, userId).run();

      if (result.meta.changes === 0) {
        return new Response('Thread not found', { status: 404 });
      }
      return new Response('OK', { status: 200 });
    }

    // Thread DO endpoints (existing)
    if (pathParts[0] === 'threads' && pathParts.length >= 2) {
      const threadId = pathParts[1];
      if (!threadId) {
        return new Response('Thread ID required', { status: 400 });
      }

      const id = env.THREADS.idFromName(threadId);
      const stub = env.THREADS.get(id);

      if (request.method === 'GET') {
        const messages = await stub.getMessages();
        return Response.json(messages);
      }

      if (request.method === 'POST') {
        const message = (await request.json()) as ThreadMessage;
        await stub.appendMessage(message);
        return new Response('OK', { status: 200 });
      }

      if (request.method === 'PUT') {
        const messages = (await request.json()) as ThreadMessage[];
        await stub.saveMessages(messages);
        return new Response('OK', { status: 200 });
      }

      if (request.method === 'DELETE') {
        await stub.clear();
        return new Response('OK', { status: 200 });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};
