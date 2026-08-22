"use client";

import { Check, LoaderCircle, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { UserAvatar } from "@/components/user-avatar";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const AVATAR_OPTIONS = Array.from({ length: 8 }, (_, index) => index);

export function ProfileSection() {
	const { data: session } = authClient.useSession();
	const [open, setOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	if (!session) return null;

	const { user } = session;
	const avatarSeed = user.avatarSeed ?? null;
	const seeds = AVATAR_OPTIONS.map(
		(index) => `${user.id}:memora-face:${index}`,
	);

	async function selectAvatar(nextSeed: string | null) {
		if (nextSeed === avatarSeed || isSaving) return;

		setIsSaving(true);
		const { error } = await authClient.updateUser({ avatarSeed: nextSeed });
		setIsSaving(false);

		if (error) {
			toast.error("Could not update your avatar");
			return;
		}

		setOpen(false);
		toast.success(nextSeed ? "New avatar selected" : "Original photo restored");
	}

	return (
		<section className="mb-6">
			<h2 className="mb-3 font-medium text-[#666] text-xs uppercase tracking-wider">
				Profile
			</h2>

			<div className="flex items-center gap-3">
				<UserAvatar
					avatarSeed={avatarSeed}
					className="size-14"
					image={user.image}
					name={user.name}
				/>
				<div className="min-w-0 flex-1">
					<p className="text-[#ededed] text-sm">{user.name ?? "User"}</p>
					<p className="truncate text-[#666] text-xs">{user.email}</p>
				</div>
				<Button
					className="h-7 rounded-md border-[#262626] bg-[#0d0d0d] text-[#aaa] text-xs hover:bg-[#171717] hover:text-[#ededed] active:scale-[0.96]"
					onClick={() => setOpen(true)}
					size="sm"
					variant="outline"
				>
					<Pencil className="mr-1.5 size-3.5" strokeWidth={1.5} />
					Change avatar
				</Button>
			</div>

			<Dialog onOpenChange={setOpen} open={open}>
				<DialogContent className="gap-5 rounded-xl border border-[#262626] bg-[#0a0a0a] p-5 text-[#ededed] shadow-2xl">
					<DialogHeader className="pe-8">
						<DialogTitle className="text-base">
							Choose your new face
						</DialogTitle>
						<DialogDescription className="text-[#777]">
							Each option is unique to your account and saved to your profile.
						</DialogDescription>
					</DialogHeader>

					<div className="grid grid-cols-3 justify-items-center gap-2.5 sm:grid-cols-4">
						<button
							aria-label={
								user.image
									? "Use original photo"
									: "Use original avatar with initials"
							}
							aria-pressed={!avatarSeed}
							className={cn(
								"group relative size-[4.25rem] rounded-xl bg-[#111] p-1.5 outline-none ring-1 ring-[#262626] transition-[background-color,box-shadow,scale] duration-100 hover:bg-[#181818] focus-visible:ring-2 focus-visible:ring-[#777] active:scale-[0.96]",
								!avatarSeed && "ring-2 ring-[#ededed]",
							)}
							disabled={isSaving}
							onClick={() => selectAvatar(null)}
							type="button"
						>
							<UserAvatar
								className="size-full"
								image={user.image}
								name={user.name}
							/>
							<span className="absolute inset-x-2 bottom-1 rounded-sm bg-black/75 py-0.5 font-medium text-[8px] text-white leading-none">
								Original
							</span>
							{!avatarSeed ? (
								<Check
									className="absolute top-1.5 right-1.5 size-4 rounded-full bg-white p-0.5 text-black"
									strokeWidth={2.5}
								/>
							) : null}
						</button>

						{seeds.map((seed, index) => {
							const selected = seed === avatarSeed;

							return (
								<button
									aria-label={`Choose avatar ${index + 1}`}
									aria-pressed={selected}
									className={cn(
										"relative size-[4.25rem] rounded-xl bg-[#111] p-1.5 outline-none ring-1 ring-[#262626] transition-[background-color,box-shadow,scale] duration-100 hover:bg-[#181818] focus-visible:ring-2 focus-visible:ring-[#777] active:scale-[0.96]",
										selected && "ring-2 ring-[#ededed]",
									)}
									disabled={isSaving}
									key={seed}
									onClick={() => selectAvatar(seed)}
									type="button"
								>
									<UserAvatar
										avatarSeed={seed}
										className="size-full"
										name={user.name}
									/>
									{selected ? (
										<Check
											className="absolute top-1.5 right-1.5 size-4 rounded-full bg-white p-0.5 text-black"
											strokeWidth={2.5}
										/>
									) : null}
								</button>
							);
						})}
					</div>

					{isSaving ? (
						<p
							aria-live="polite"
							className="flex items-center justify-center gap-2 text-[#777] text-xs"
						>
							<LoaderCircle className="size-3.5 animate-spin" />
							Saving avatar…
						</p>
					) : null}
				</DialogContent>
			</Dialog>
		</section>
	);
}
