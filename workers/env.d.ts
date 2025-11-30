import type { Thread } from './thread';

declare global {
  interface Env {
    DB: D1Database;
    THREADS: DurableObjectNamespace<Thread>;
    CLERK_SECRET_KEY: string;
    CLERK_PUBLISHABLE_KEY: string;
  }
}

export {};
