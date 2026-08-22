import { Facehash, stringHash } from "facehash";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const FACEHASH_COLORS = [
	"#dc2626",
	"#ea580c",
	"#ca8a04",
	"#059669",
	"#0891b2",
	"#2563eb",
	"#7c3aed",
	"#db2777",
];

const MOUTH_VARIANTS = 6;

function FacehashMouth({ seed }: { seed: string }) {
	const variant = stringHash(seed) % MOUTH_VARIANTS;

	return (
		<svg
			aria-hidden="true"
			fill="none"
			style={{ height: "18cqw", width: "32cqw" }}
			viewBox="0 0 32 18"
		>
			{variant === 0 ? (
				<path
					d="M3 3c2 16 24 16 26 0"
					stroke="currentColor"
					strokeLinecap="round"
					strokeWidth="4"
				/>
			) : null}
			{variant === 1 ? (
				<path
					d="M5 9h22"
					stroke="currentColor"
					strokeLinecap="round"
					strokeWidth="5"
				/>
			) : null}
			{variant === 2 ? (
				<ellipse cx="16" cy="9" fill="currentColor" rx="8" ry="7" />
			) : null}
			{variant === 3 ? (
				<path
					d="M3 11c9 3 20 1 26-6"
					stroke="currentColor"
					strokeLinecap="round"
					strokeWidth="4"
				/>
			) : null}
			{variant === 4 ? (
				<path
					d="m2 6 7 7 7-7 7 7 7-7"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="3.5"
				/>
			) : null}
			{variant === 5 ? (
				<>
					<path d="M4 3c1 18 23 18 24 0Z" fill="currentColor" />
					<path d="M10 13c3-4 9-4 12 0-3 3-9 3-12 0Z" fill="#fb7185" />
				</>
			) : null}
		</svg>
	);
}

type UserAvatarProps = {
	avatarSeed?: string | null;
	className?: string;
	image?: string | null;
	name?: string | null;
};

export function UserAvatar({
	avatarSeed,
	className,
	image,
	name,
}: UserAvatarProps) {
	const displayName = name?.trim() || "User";
	const initials = displayName
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<Avatar className={cn("overflow-hidden", className)}>
			{avatarSeed ? (
				<Facehash
					aria-label={`Avatar de ${displayName}`}
					className="rounded-full text-white"
					colors={FACEHASH_COLORS}
					interactive={false}
					name={avatarSeed}
					onRenderMouth={() => <FacehashMouth seed={avatarSeed} />}
					size="100%"
				/>
			) : (
				<>
					<AvatarImage
						alt={`Foto de ${displayName}`}
						src={image ?? undefined}
					/>
					<AvatarFallback className="bg-[#1a1a1a] text-[#ededed]">
						{initials}
					</AvatarFallback>
				</>
			)}
		</Avatar>
	);
}
