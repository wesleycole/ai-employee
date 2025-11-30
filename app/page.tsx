import { HomeChatInput } from "@/components/home-chat-input";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center">
        <h1 className="mb-8 text-3xl font-normal text-foreground">
          Where should we begin?
        </h1>
        <HomeChatInput />
      </main>
    </div>
  );
}
