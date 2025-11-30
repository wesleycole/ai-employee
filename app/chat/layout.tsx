import { redirect } from "next/navigation";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThreadProvider } from "@/lib/thread-context";
import { HeaderTitle } from "@/components/header-title";
import { findOrCreateUser, getUserThreads } from "@/lib/user-service";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await findOrCreateUser();
  if (!user) {
    redirect("/sign-in");
  }

  const threads = await getUserThreads(user.id);

  return (
    <ThreadProvider initialThreads={threads}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "19rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 border-b border-border">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <HeaderTitle />
            </div>
            <div className="flex items-center gap-2">
              <SignedOut>
                <SignInButton>
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button size="sm">Sign Up</Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ThreadProvider>
  );
}
