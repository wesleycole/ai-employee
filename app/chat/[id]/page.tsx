import type { Metadata } from "next";
import { loadChat } from "@/lib/chat-store";
import Chat from "@/components/chat";
import {
  findOrCreateUser,
  verifyThreadOwnership,
  createThread,
} from "@/lib/user-service";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Chat",
};

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await findOrCreateUser();
  if (!user) {
    redirect("/sign-in");
  }

  const isOwner = await verifyThreadOwnership(user.id, id);
  const messages = await loadChat(id);

  if (!isOwner) {
    if (messages.length > 0) {
      redirect("/chat");
    }
    await createThread(user.id, id);
  }

  return (
    <main className="flex flex-1 flex-col">
      <Chat id={id} userId={user.id} initialMessages={messages} />
    </main>
  );
}
