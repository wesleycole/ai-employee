"use client";

import { useParams } from "next/navigation";
import { useThreads } from "@/lib/thread-context";

export function HeaderTitle() {
  const params = useParams();
  const threadId = params.id as string | undefined;
  const { threads } = useThreads();

  if (!threadId) return null;

  const thread = threads.find((t) => t.id === threadId);
  const title = thread?.title || "New Thread";

  return (
    <span className="text-sm font-medium text-foreground truncate max-w-[300px]">
      {title}
    </span>
  );
}
