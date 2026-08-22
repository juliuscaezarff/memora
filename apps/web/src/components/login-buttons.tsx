"use client";

import { GithubIcon, Loader2, Terminal } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export function LoginButtons() {
	const [loadingProvider, setLoadingProvider] = useState<
		"google" | "github" | "dev" | null
	>(null);

	const signInWithGoogle = () => {
		setLoadingProvider("google");
		authClient.signIn.social({ provider: "google", callbackURL: "/bookmarks" });
	};

	const signInWithGithub = () => {
		setLoadingProvider("github");
		authClient.signIn.social({ provider: "github", callbackURL: "/bookmarks" });
	};

	const signInAsDev = async () => {
		setLoadingProvider("dev");
		try {
			const response = await fetch("/api/dev-login", { method: "POST" });
			if (!response.ok) throw new Error("Dev login failed");
			window.location.assign("/bookmarks");
		} catch {
			setLoadingProvider(null);
			toast.error("Could not sign in as Dev");
		}
	};

	const buttonClass =
		"inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm font-semibold text-[#e8e8e5] transition-[color,opacity,scale] duration-150 hover:text-white active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 sm:text-base";

	return (
		<div className="flex w-full flex-wrap items-center gap-x-4 gap-y-2">
			<span aria-hidden="true" className="text-[#4a4a48] text-base">
				›
			</span>
			<span className="text-[#777775] text-sm sm:text-base">continue with</span>
			<span className="flex items-center gap-4">
				<button
					type="button"
					onClick={signInWithGoogle}
					disabled={loadingProvider !== null}
					className={buttonClass}
				>
					{loadingProvider === "google" ? (
						<Loader2
							aria-label="Signing in with Google"
							className="size-4 animate-spin"
						/>
					) : (
						<>
							<Image src="/google.ico" alt="" width={16} height={16} />
							Google
						</>
					)}
				</button>
				<span aria-hidden="true" className="text-[#333331]">
					/
				</span>
				<button
					type="button"
					onClick={signInWithGithub}
					disabled={loadingProvider !== null}
					className={buttonClass}
				>
					{loadingProvider === "github" ? (
						<Loader2
							aria-label="Signing in with GitHub"
							className="size-4 animate-spin"
						/>
					) : (
						<>
							<GithubIcon aria-hidden="true" className="size-4 stroke-[2]" />
							GitHub
						</>
					)}
				</button>
				{process.env.NODE_ENV === "development" && (
					<>
						<span aria-hidden="true" className="text-[#333331]">
							/
						</span>
						<button
							type="button"
							onClick={signInAsDev}
							disabled={loadingProvider !== null}
							className={buttonClass}
						>
							{loadingProvider === "dev" ? (
								<Loader2
									aria-label="Signing in as Dev"
									className="size-4 animate-spin"
								/>
							) : (
								<>
									<Terminal aria-hidden="true" className="size-4 stroke-[2]" />
									Dev
								</>
							)}
						</button>
					</>
				)}
			</span>
		</div>
	);
}
