import { RedirectToSignIn } from "@clerk/nextjs";
import { createChat } from "@/lib/chat-store";
import { findOrCreateUser, createThread } from "@/lib/user-service";
import { NewChatRedirect } from "@/components/new-chat-redirect";

export default async function NewChatWithPromptPage({
  searchParams,
}: {
  searchParams: Promise<{ prompt?: string }>;
}) {
  const { prompt } = await searchParams;
  const user = await findOrCreateUser();
  
  if (!user) {
    return <RedirectToSignIn signInForceRedirectUrl="/chat/new" />;
  }

  const id = await createChat();
  await createThread(user.id, id);

  return <NewChatRedirect chatId={id} promptFromUrl={prompt} />;
}
