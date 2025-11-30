"use client";

import * as React from "react";
import { MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useThreads } from "@/lib/thread-context";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
	const { threads } = useThreads();
	const params = useParams();
	const currentThreadId = params.id as string | undefined;

	return (
		<Sidebar variant="floating" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href="/">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
									<Image
										src="/logo.jpg"
										alt="AI Employee Logo"
										width={32}
										height={32}
									/>
								</div>
								<div className="flex flex-col gap-0.5 leading-none">
									<span className="font-medium">AI Employee</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<Link href="/chat">
								<Plus className="size-4" />
								<span>New Thread</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Your Threads</SidebarGroupLabel>
					<SidebarMenu>
						{threads.length === 0 ? (
							<SidebarMenuItem>
								<div className="px-2 py-1.5 text-sm text-muted-foreground">
									No threads yet
								</div>
							</SidebarMenuItem>
						) : (
							threads.map((thread) => (
								<SidebarMenuItem key={thread.id}>
									<SidebarMenuButton
										asChild
										isActive={currentThreadId === thread.id}
									>
										<Link href={`/chat/${thread.id}`}>
											<MessageSquare className="size-4" />
											<span className="truncate">
												{thread.title || `Thread ${thread.id.slice(0, 8)}...`}
											</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))
						)}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
