import type { Thread } from './thread';

declare global {
  interface Env {
    DB: D1Database;
    THREADS: DurableObjectNamespace<Thread>;
  }
}

export {};
