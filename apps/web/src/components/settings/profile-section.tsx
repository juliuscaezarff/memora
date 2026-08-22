"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";

export function ProfileSection() {
	const { data: session } = authClient.useSession();

	const initials =
		session?.user?.name
			?.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2) ?? "U";

	return (
		<section className="mb-6">
			<h2 className="mb-3 font-medium text-[#666] text-xs uppercase tracking-wider">
				Profile
			</h2>

			<div className="flex items-center gap-3">
				<div className="group relative">
					<Avatar className="h-14 w-14 border border-[#262626]">
						<AvatarImage src={session?.user?.image ?? undefined} />
						<AvatarFallback className="bg-[#1a1a1a] text-[#ededed] text-base">
							{initials}
						</AvatarFallback>
					</Avatar>
				</div>
				<div>
					<p className="text-[#ededed] text-sm">
						{session?.user?.name ?? "User"}
					</p>
					<p className="text-[#666] text-xs">{session?.user?.email}</p>
				</div>
			</div>
		</section>
	);
}
