import { generateText } from "ai";

export async function generateTitle(message: string): Promise<string> {
  const { text: title } = await generateText({
    model: "anthropic/claude-sonnet-4.5",
    system:
      "Generate a concise 3-6 word title for a conversation. Return only the title, no quotes or punctuation at the end.",
    prompt: `Generate a title for this message: "${message}"`,
  });

  return title.trim().replace(/^["']|["']$/g, "");
}
