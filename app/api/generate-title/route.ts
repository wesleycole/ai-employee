import { generateText } from "ai";
import { auth } from "@clerk/nextjs/server";
import { updateThreadTitle } from "@/lib/chat-store";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { threadId, message }: { threadId: string; message: string } =
    await req.json();

  if (!threadId || !message) {
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
