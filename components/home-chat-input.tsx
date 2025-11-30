"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Paperclip, Globe, BookOpen, AudioLines, Send } from "lucide-react";

export function HomeChatInput() {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { redirectToSignIn } = useClerk();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const prompt = input.trim();

    if (!isSignedIn) {
      sessionStorage.setItem("pendingChatPrompt", prompt);
      redirectToSignIn({ signInForceRedirectUrl: "/chat/new" });
      return;
    }

    router.push(`/chat/new?prompt=${encodeURIComponent(prompt)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4">
      <form onSubmit={handleSubmit}>
        <div className="rounded-3xl border border-border bg-background shadow-sm">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            rows={1}
            disabled={isSubmitting}
            className="w-full resize-none bg-transparent px-5 pt-4 pb-2 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          />
          <div className="flex items-center justify-between px-3 pb-3">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2 rounded-full px-3 text-muted-foreground hover:text-foreground"
                disabled={isSubmitting}
              >
                <Paperclip className="size-4" />
                Attach
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2 rounded-full px-3 text-muted-foreground hover:text-foreground"
                disabled={isSubmitting}
              >
                <Globe className="size-4" />
                Search
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2 rounded-full px-3 text-muted-foreground hover:text-foreground"
                disabled={isSubmitting}
              >
                <BookOpen className="size-4" />
                Study
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {input.trim() ? (
                <Button
                  type="submit"
                  size="icon"
                  disabled={isSubmitting}
                  className="size-9 rounded-full"
                >
                  <Send className="size-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full px-4 text-muted-foreground"
                  disabled={isSubmitting}
                >
                  <AudioLines className="size-4" />
                  Voice
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        By messaging AI Employee, you agree to our Terms and have read our Privacy Policy.
      </p>
    </div>
  );
}
