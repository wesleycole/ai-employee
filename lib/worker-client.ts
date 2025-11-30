"use server";

import { auth } from "@clerk/nextjs/server";

const WORKER_URL = process.env.WORKER_URL || "http://localhost:8787";

async function getAuthHeaders(): Promise<HeadersInit> {
  const { getToken } = await auth();
  const token = await getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function workerFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = await getAuthHeaders();

  return fetch(`${WORKER_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
}
