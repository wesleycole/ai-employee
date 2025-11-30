"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface NewChatRedirectProps {
  chatId: string;
  promptFromUrl?: string;
}

export function NewChatRedirect({ chatId, promptFromUrl }: NewChatRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    let prompt = promptFromUrl;
    
    if (!prompt) {
      const pendingPrompt = sessionStorage.getItem("pendingChatPrompt");
      if (pendingPrompt) {
        prompt = pendingPrompt;
        sessionStorage.removeItem("pendingChatPrompt");
      }
    }

    if (prompt) {
      router.replace(`/chat/${chatId}?prompt=${encodeURIComponent(prompt)}`);
    } else {
      router.replace(`/chat/${chatId}`);
    }
  }, [chatId, promptFromUrl, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-muted-foreground">Starting chat...</div>
    </div>
  );
}
