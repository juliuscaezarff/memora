"use client";

import { GithubIcon, Loader2, Terminal } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";

export function LoginButtons() {
	const lastMethod = authClient.getLastUsedLoginMethod();
	const [loadingProvider, setLoadingProvider] = useState<
		"google" | "github" | "dev" | null
	>(null);

	const signInWithGoogle = () => {
		setLoadingProvider("google");
		authClient.signIn.social({
			provider: "google",
			callbackURL: "/bookmarks",
		});
	};

	const signInWithGithub = () => {
		setLoadingProvider("github");
		authClient.signIn.social({
			provider: "github",
			callbackURL: "/bookmarks",
		});
	};

	const signInAsDev = async () => {
		setLoadingProvider("dev");

		try {
			const response = await fetch("/api/dev-login", { method: "POST" });
			if (!response.ok) {
				throw new Error("Dev login failed");
			}

			window.location.assign("/bookmarks");
		} catch {
			setLoadingProvider(null);
			toast.error("Could not sign in as Dev");
		}
	};

	return (
		<div className="flex w-full flex-col items-center gap-4">
			<div className="grid w-full max-w-[304px] grid-cols-2 items-center gap-3 sm:gap-4">
				<div className="relative">
					<button
						type="button"
						onClick={signInWithGoogle}
						disabled={loadingProvider !== null}
						className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-black font-normal text-sm text-white no-underline transition-opacity hover:opacity-80 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60"
					>
						{loadingProvider === "google" ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<div className="flex items-center gap-2">
								<p>Sign in with</p>
								<Image
									src="/google.ico"
									alt="Google logo"
									width={18}
									height={18}
								/>
							</div>
						)}
					</button>
					{lastMethod === "google" && (
						<Badge className="absolute -top-2 -right-2 h-4 px-1.5 py-0 text-[10px]">
							Last used
						</Badge>
					)}
				</div>
				<div className="relative">
					<button
						type="button"
						onClick={signInWithGithub}
						disabled={loadingProvider !== null}
						className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-black font-normal text-sm text-white no-underline transition-opacity hover:opacity-80 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60"
					>
						{loadingProvider === "github" ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<div className="flex items-center gap-2">
								<p>Sign in with</p>
								<GithubIcon className="h-5 w-5" />
							</div>
						)}
					</button>
					{lastMethod === "github" && (
						<Badge className="absolute -top-2 -right-2 h-4 rounded-md border border-stone-600 bg-black px-1.5 py-0 text-[10px] text-white">
							Last used
						</Badge>
					)}
				</div>
			</div>

			{process.env.NODE_ENV === "development" && (
				<button
					type="button"
					onClick={signInAsDev}
					disabled={loadingProvider !== null}
					className="flex min-h-9 w-full max-w-[304px] items-center justify-center gap-2 rounded-lg border border-stone-300 bg-stone-100 px-4 font-medium text-sm text-stone-700 transition-colors duration-150 hover:border-stone-400 hover:bg-stone-200 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60"
				>
					{loadingProvider === "dev" ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Terminal className="h-4 w-4 stroke-[1.5]" />
					)}
					Entrar como Dev
				</button>
			)}
		</div>
	);
}
