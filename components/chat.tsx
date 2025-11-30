"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useState, useRef, useEffect } from "react";
import { useThreads } from "@/lib/thread-context";
import { Button } from "@/components/ui/button";
import {
  Paperclip,
  Globe,
  BookOpen,
  AudioLines,
  Send,
  Copy,
  Check,
} from "lucide-react";

interface ChatProps {
  id: string;
  userId: string;
  initialMessages?: UIMessage[];
}

export default function Chat({ id, userId, initialMessages = [] }: ChatProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasAddedThread, setHasAddedThread] = useState(false);
  const { addThread, updateThreadTitle } = useThreads();

  const isFirstMessageRef = useRef(initialMessages.length === 0);

  const { messages, sendMessage, status } = useChat({
    id,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        chatId: id,
        userId,
        isFirstMessage: isFirstMessageRef.current,
      },
    }),
    onFinish: () => {
      isFirstMessageRef.current = false;
    },
    onData: (dataPart) => {
      if (dataPart.type === "data-thread-title") {
        const { threadId, title } = dataPart.data as {
          threadId: string;
          title: string;
        };
        updateThreadTitle(threadId, title);
      }
    },
  });

  const hasMessages = messages.length > 0;
  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!hasAddedThread && messages.length > 0 && initialMessages.length === 0) {
      addThread({
        id,
        user_id: userId,
        title: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setHasAddedThread(true);
    }
  }, [messages.length, hasAddedThread, addThread, id, userId, initialMessages.length]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getMessageText = (message: (typeof messages)[0]) => {
    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => (part as { type: "text"; text: string }).text)
      .join("");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {hasMessages ? (
        <div className="flex-1 overflow-y-auto" ref={scrollRef}>
          <div className="mx-auto max-w-3xl px-4 py-8">
            {messages.map((message) => (
              <div key={message.id} className="mb-6">
                {message.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-3xl bg-muted px-5 py-3 text-foreground">
                      {message.parts.map((part, i) => {
                        if (part.type === "text") {
                          return (
                            <p
                              key={`${message.id}-${i}`}
                              className="whitespace-pre-wrap"
                            >
                              {part.text}
                            </p>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="group">
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                      {message.parts.map((part, i) => {
                        if (part.type === "text") {
                          return (
                            <div
                              key={`${message.id}-${i}`}
                              className="whitespace-pre-wrap"
                            >
                              {part.text}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                    <div className="mt-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          copyToClipboard(getMessageText(message), message.id)
                        }
                      >
                        {copiedId === message.id ? (
                          <Check className="size-4" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="size-2 animate-pulse rounded-full bg-muted-foreground" />
                <div
                  className="size-2 animate-pulse rounded-full bg-muted-foreground"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="size-2 animate-pulse rounded-full bg-muted-foreground"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center">
          <h1 className="mb-8 text-3xl font-normal text-foreground">
            Where should we begin?
          </h1>
        </div>
      )}

      {/* Input Area */}
      <div className="mx-auto w-full max-w-3xl px-4 pb-6">
        <form onSubmit={handleSubmit}>
          <div className="rounded-3xl border border-border bg-background shadow-sm">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything"
              rows={1}
              className="w-full resize-none bg-transparent px-5 pt-4 pb-2 text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-2 rounded-full px-3 text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="size-4" />
                  Attach
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-2 rounded-full px-3 text-muted-foreground hover:text-foreground"
                >
                  <Globe className="size-4" />
                  Search
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-2 rounded-full px-3 text-muted-foreground hover:text-foreground"
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
                    disabled={isLoading}
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
          {hasMessages
            ? "AI Employee can make mistakes. Check important info."
            : "By messaging AI Employee, you agree to our Terms and have read our Privacy Policy."}
        </p>
      </div>
    </div>
  );
}
