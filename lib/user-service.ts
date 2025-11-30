"use server";

import { currentUser } from "@clerk/nextjs/server";

const WORKER_URL = process.env.WORKER_URL || "http://localhost:8787";

export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Thread {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export async function findOrCreateUser(): Promise<User | null> {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return null;
  }

  const response = await fetch(`${WORKER_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      name: clerkUser.fullName,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to find or create user: ${response.statusText}`);
  }

  return response.json();
}

export async function getUserThreads(userId: string): Promise<Thread[]> {
  const response = await fetch(`${WORKER_URL}/users/${userId}/threads`);
  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    throw new Error(`Failed to get user threads: ${response.statusText}`);
  }
  return response.json();
}

export async function createThread(
  userId: string,
  threadId: string,
  title?: string
): Promise<Thread> {
  const response = await fetch(`${WORKER_URL}/users/${userId}/threads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: threadId, title }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create thread: ${response.statusText}`);
  }

  return response.json();
}

export async function verifyThreadOwnership(
  userId: string,
  threadId: string
): Promise<boolean> {
  const response = await fetch(
    `${WORKER_URL}/users/${userId}/threads/${threadId}`
  );
  return response.ok;
}

export async function updateThreadTitle(
  userId: string,
  threadId: string,
  title: string
): Promise<void> {
  const response = await fetch(
    `${WORKER_URL}/users/${userId}/threads/${threadId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update thread title: ${response.statusText}`);
  }
}
