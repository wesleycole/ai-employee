"use server";

import { generateId, type UIMessage } from "ai";
import { workerFetch } from "./worker-client";

interface StoredMessage {
  id: string;
  role: "user" | "assistant";
  parts: UIMessage["parts"];
  createdAt: string;
  metadata?: unknown;
}

export async function createChat(): Promise<string> {
  const id = generateId();
  return id;
}

export async function loadChat(id: string): Promise<UIMessage[]> {
  const response = await workerFetch(`/threads/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    throw new Error(`Failed to load chat: ${response.statusText}`);
  }
  const messages = (await response.json()) as StoredMessage[];
  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    parts: msg.parts,
    metadata: msg.metadata,
  }));
}

export async function saveChat({
  chatId,
  messages,
}: {
  chatId: string;
  messages: UIMessage[];
}): Promise<void> {
  const serializedMessages = messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    parts: msg.parts,
    createdAt: new Date().toISOString(),
    metadata: msg.metadata,
  }));

  const response = await workerFetch(`/threads/${chatId}`, {
    method: "PUT",
    body: JSON.stringify(serializedMessages),
  });

  if (!response.ok) {
    throw new Error(`Failed to save chat: ${response.statusText}`);
  }
}

export async function appendMessage(
  chatId: string,
  message: UIMessage
): Promise<void> {
  const serializedMessage = {
    id: message.id,
    role: message.role,
    parts: message.parts,
    createdAt: new Date().toISOString(),
    metadata: message.metadata,
  };

  const response = await workerFetch(`/threads/${chatId}`, {
    method: "POST",
    body: JSON.stringify(serializedMessage),
  });

  if (!response.ok) {
    throw new Error(`Failed to append message: ${response.statusText}`);
  }
}

export async function clearChat(chatId: string): Promise<void> {
  const response = await workerFetch(`/threads/${chatId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to clear chat: ${response.statusText}`);
  }
}

export async function updateThreadTitle(
  userId: string,
  threadId: string,
  title: string
): Promise<void> {
  const response = await workerFetch(`/users/${userId}/threads/${threadId}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update thread title: ${response.statusText}`);
  }
}
