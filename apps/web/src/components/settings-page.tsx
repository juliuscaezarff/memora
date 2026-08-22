"use client";

import {
	ArrowLeft,
	CircleUserRound,
	Keyboard,
	Link2,
	Tags,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { ApiKeySection } from "@/components/settings/api-key-section";
import { DangerZoneSection } from "@/components/settings/danger-zone-section";
import { LabelsSection } from "@/components/settings/labels-section";
import { ProfileSection } from "@/components/settings/profile-section";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type SettingsSection = "profile" | "labels" | "mcp" | "keyboard";

const navigation = [
	{ id: "profile", label: "Profile", href: "/settings", icon: CircleUserRound },
	{ id: "labels", label: "Labels", href: "/settings/labels", icon: Tags },
	{ id: "mcp", label: "MCP", href: "/settings/mcp", icon: Link2 },
	{
		id: "keyboard",
		label: "Keyboard",
		href: "/settings/keyboard",
		icon: Keyboard,
	},
] as const;

function SettingsContent({ section }: { section: SettingsSection }) {
	if (section === "labels") return <LabelsSection />;

	if (section === "mcp") {
		return (
			<section>
				<div className="mb-5">
					<h1 className="font-medium text-[#ededed] text-xl">MCP</h1>
					<p className="mt-1 text-[#666] text-[13px] leading-5">
						Connect your Memora library to an MCP-compatible client.
					</p>
				</div>
				<ApiKeySection />
			</section>
		);
	}

	if (section === "keyboard") {
		return (
			<section>
				<div className="mb-5">
					<h1 className="font-medium text-[#ededed] text-xl">Keyboard</h1>
					<p className="mt-1 text-[#666] text-[13px] leading-5">
						Navigate and manage your links without leaving the keyboard.
					</p>
				</div>
				<div className="rounded-md border border-[#262626] border-dashed px-4 py-10 text-center">
					<Keyboard className="mx-auto size-5 text-[#555]" strokeWidth={1.5} />
					<p className="mt-3 text-[#888] text-sm">
						Keyboard shortcuts are coming soon.
					</p>
				</div>
			</section>
		);
	}

	return (
		<section>
			<div className="mb-5">
				<h1 className="font-medium text-[#ededed] text-xl">Profile</h1>
				<p className="mt-1 text-[#666] text-[13px] leading-5">
					Manage your account details and security.
				</p>
			</div>
			<ProfileSection />
			<Separator className="mb-8 bg-[#1a1a1a]" />
			<DangerZoneSection />
		</section>
	);
}

export function SettingsPage({
	section = "profile",
}: {
	section?: SettingsSection;
}) {
	return (
		<div className="min-h-dvh bg-black text-[#ededed]">
			<main className="mx-auto grid w-full max-w-5xl gap-8 px-4 pt-8 pb-16 sm:px-6 sm:pt-12 md:grid-cols-[12rem_minmax(0,36rem)] md:gap-16 lg:gap-24">
				<nav aria-label="Settings" className="min-w-0">
					<Link
						href="/bookmarks"
						className="mb-8 flex w-fit items-center gap-2 rounded-md px-2 py-1 text-[#888] text-sm outline-none transition-colors duration-100 hover:text-[#ededed] focus-visible:ring-1 focus-visible:ring-[#666]"
					>
						<ArrowLeft className="size-4" strokeWidth={1.5} />
						Back
					</Link>
					<p className="mb-3 px-2 font-medium text-[#555] text-[10px] uppercase tracking-wider">
						Settings
					</p>
					<div className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible">
						{navigation.map((item) => {
							const Icon = item.icon;
							const active = section === item.id;

							return (
								<Link
									key={item.id}
									href={item.href as Route}
									aria-current={active ? "page" : undefined}
									className={cn(
										"flex h-8 shrink-0 items-center gap-2 rounded-md px-2 text-[13px] outline-none transition-colors duration-100 focus-visible:ring-1 focus-visible:ring-[#666]",
										active
											? "bg-[#151515] text-[#ededed]"
											: "text-[#777] hover:bg-[#0d0d0d] hover:text-[#c7c7c7]",
									)}
								>
									<Icon className="size-4" strokeWidth={1.5} />
									<span>{item.label}</span>
									{item.id === "keyboard" ? (
										<Badge
											variant="outline"
											className="ms-auto h-4 rounded-full border-[#262626] bg-[#151515] px-1.5 py-0 font-medium text-[#666] text-[8px] leading-none tracking-wide"
										>
											Soon
										</Badge>
									) : null}
								</Link>
							);
						})}
					</div>
				</nav>

				<div className="min-w-0">
					<SettingsContent section={section} />
				</div>
			</main>
		</div>
	);
}
