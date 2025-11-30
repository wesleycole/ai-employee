import { DurableObject } from 'cloudflare:workers';

export interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant';
  parts: Array<{ type: string; text?: string; [key: string]: unknown }>;
  createdAt: string;
  metadata?: unknown;
}

export class Thread extends DurableObject<Env> {
  private sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.initializeSchema();
  }

  private initializeSchema() {
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        parts TEXT NOT NULL,
        metadata TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Migration: add metadata column if it doesn't exist (for existing tables)
    const columns = this.sql
      .exec<{ name: string }>("PRAGMA table_info(messages)")
      .toArray();
    const hasMetadata = columns.some((col) => col.name === "metadata");
    if (!hasMetadata) {
      this.sql.exec("ALTER TABLE messages ADD COLUMN metadata TEXT");
    }
  }

  async getMessages(): Promise<ThreadMessage[]> {
    const results = this.sql
      .exec<{ id: string; role: string; parts: string; metadata: string | null; created_at: string }>(
        'SELECT id, role, parts, metadata, created_at FROM messages ORDER BY created_at ASC'
      )
      .toArray();

    return results.map((row) => ({
      id: row.id,
      role: row.role as 'user' | 'assistant',
      parts: JSON.parse(row.parts),
      createdAt: row.created_at,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    }));
  }

  async appendMessage(message: ThreadMessage): Promise<void> {
    this.sql.exec(
      'INSERT INTO messages (id, role, parts, metadata, created_at) VALUES (?, ?, ?, ?, ?)',
      message.id,
      message.role,
      JSON.stringify(message.parts),
      message.metadata ? JSON.stringify(message.metadata) : null,
      message.createdAt
    );
  }

  async saveMessages(messages: ThreadMessage[]): Promise<void> {
    this.sql.exec('DELETE FROM messages');
    for (const message of messages) {
      await this.appendMessage(message);
    }
  }

  async deleteMessage(id: string): Promise<void> {
    this.sql.exec('DELETE FROM messages WHERE id = ?', id);
  }

  async clear(): Promise<void> {
    this.sql.exec('DELETE FROM messages');
  }
}
