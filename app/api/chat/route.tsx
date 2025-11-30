import {
  streamText,
  type UIMessage,
  convertToModelMessages,
  createIdGenerator,
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";
import { auth } from "@clerk/nextjs/server";
import { saveChat, updateThreadTitle } from "@/lib/chat-store";
import { generateTitle } from "@/lib/generate-title";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const {
    messages,
    chatId,
    isFirstMessage,
  }: {
    messages: UIMessage[];
    chatId: string;
    isFirstMessage?: boolean;
  } = await req.json();

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const result = streamText({
        model: "anthropic/claude-sonnet-4.5",
        messages: convertToModelMessages(messages),
      });

      writer.merge(
        result.toUIMessageStream({
          originalMessages: messages,
          generateMessageId: createIdGenerator({
            prefix: "msg",
            size: 16,
          }),
          onFinish: async ({ messages: finalMessages }) => {
            await saveChat({ chatId, messages: finalMessages });

            if (isFirstMessage) {
              const firstUserMessage = messages.find((m) => m.role === "user");
              if (firstUserMessage) {
                const textPart = firstUserMessage.parts.find(
                  (p) => p.type === "text"
                );
                if (textPart && "text" in textPart) {
                  const title = await generateTitle(textPart.text);
                  await updateThreadTitle(userId, chatId, title);
                  writer.write({
                    type: "data-thread-title",
                    data: { threadId: chatId, title },
                    transient: true,
                  });
                }
              }
            }
          },
        })
      );
    },
  });

  return createUIMessageStreamResponse({ stream });
}
