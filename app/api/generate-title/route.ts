import { generateText } from "ai";
import { updateThreadTitle } from "@/lib/chat-store";

export async function POST(req: Request) {
  const { threadId, userId, message }: { threadId: string; userId: string; message: string } =
    await req.json();

  if (!threadId || !userId || !message) {
    return new Response("Missing required fields", { status: 400 });
  }

  const { text: title } = await generateText({
    model: "anthropic/claude-sonnet-4.5",
    system:
      "Generate a concise 3-6 word title for a conversation. Return only the title, no quotes or punctuation at the end.",
    prompt: `Generate a title for this message: "${message}"`,
  });

  const cleanTitle = title.trim().replace(/^["']|["']$/g, "");

  await updateThreadTitle(userId, threadId, cleanTitle);

  return Response.json({ title: cleanTitle });
}
