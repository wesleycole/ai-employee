"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { Thread } from "@/lib/user-service";

interface ThreadContextValue {
  threads: Thread[];
  addThread: (thread: Thread) => void;
  updateThreadTitle: (threadId: string, title: string) => void;
}

const ThreadContext = createContext<ThreadContextValue | null>(null);

export function ThreadProvider({
  children,
  initialThreads,
}: {
  children: React.ReactNode;
  initialThreads: Thread[];
}) {
  const [threads, setThreads] = useState(initialThreads);

  const addThread = useCallback((thread: Thread) => {
    setThreads((prev) => {
      if (prev.some((t) => t.id === thread.id)) return prev;
      return [thread, ...prev];
    });
  }, []);

  const updateThreadTitle = useCallback((threadId: string, title: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, title } : t))
    );
  }, []);

  return (
    <ThreadContext.Provider value={{ threads, addThread, updateThreadTitle }}>
      {children}
    </ThreadContext.Provider>
  );
}

export function useThreads() {
  const context = useContext(ThreadContext);
  if (!context) {
    throw new Error("useThreads must be used within a ThreadProvider");
  }
  return context;
}
