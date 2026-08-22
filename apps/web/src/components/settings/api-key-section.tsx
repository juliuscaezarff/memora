"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Copy, Eye, EyeOff, Link2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { orpc, queryClient } from "@/utils/orpc";

export function ApiKeySection() {
	const [showUrl, setShowUrl] = useState(false);
	const [copied, setCopied] = useState(false);

	const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

	const { data: apiKey, isLoading } = useQuery(orpc.apiKey.get.queryOptions());

	const createKey = useMutation(
		orpc.apiKey.create.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.apiKey.get.queryOptions().queryKey,
				});
				setShowUrl(true);
				toast.success("MCP URL generated");
			},
			onError: () => {
				toast.error("Failed to generate MCP URL");
			},
		}),
	);

	const regenerateKey = useMutation(
		orpc.apiKey.regenerate.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.apiKey.get.queryOptions().queryKey,
				});
				setShowUrl(true);
				toast.success("MCP URL regenerated");
			},
			onError: () => {
				toast.error("Failed to regenerate MCP URL");
			},
		}),
	);

	const mcpUrl = apiKey?.key ? `${baseUrl}/mcp/${apiKey.key}` : "";

	const copyToClipboard = async () => {
		if (mcpUrl) {
			await navigator.clipboard.writeText(mcpUrl);
			setCopied(true);
			toast.success("MCP URL copied to clipboard");
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const maskedUrl = apiKey?.key
		? `${baseUrl}/mcp/${apiKey.key.slice(0, 6)}${"•".repeat(12)}${apiKey.key.slice(-4)}`
		: "";

	if (isLoading) {
		return (
			<section className="mb-6">
				<h2 className="mb-3 font-medium text-[#666] text-xs uppercase tracking-wider">
					MCP Integration
				</h2>
				<div className="rounded-md border border-[#262626] bg-[#0a0a0a] p-3">
					<div className="h-16 animate-pulse rounded-md bg-[#1a1a1a]" />
				</div>
			</section>
		);
	}

	return (
		<section className="mb-6">
			<h2 className="mb-3 font-medium text-[#666] text-xs uppercase tracking-wider">
				MCP Integration
			</h2>

			<div className="rounded-md border border-[#262626] bg-[#0a0a0a] p-3">
				<div className="mb-3 flex items-start gap-3">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#1a1a1a]">
						<Link2 className="h-4 w-4 text-[#666]" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="mb-1 text-[#ededed] text-sm">MCP Server URL</p>
						<p className="text-[#666] text-xs leading-relaxed">
							Use this URL to connect your bookmarks with Claude, ChatGPT, or
							any MCP-compatible client
						</p>
					</div>
				</div>

				{apiKey ? (
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<div className="flex-1 overflow-hidden text-ellipsis rounded-md border border-[#262626] bg-[#1a1a1a] px-2.5 py-1.5 font-mono text-[#888] text-xs">
								{showUrl ? mcpUrl : maskedUrl}
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setShowUrl(!showUrl)}
								className="h-8 w-8 rounded-md text-[#666] hover:bg-[#1a1a1a] hover:text-[#ededed]"
							>
								{showUrl ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={copyToClipboard}
								className="h-8 w-8 rounded-md text-[#666] hover:bg-[#1a1a1a] hover:text-[#ededed]"
							>
								{copied ? (
									<Check className="h-4 w-4 text-green-500" />
								) : (
									<Copy className="h-4 w-4" />
								)}
							</Button>
						</div>

						<div className="flex items-center justify-between">
							<p className="text-[#666] text-xs">
								Keep this URL secret. Do not share it publicly.
							</p>
							<AlertDialog>
								<AlertDialogTrigger
									render={
										<Button
											variant="ghost"
											size="sm"
											className="h-7 rounded-md px-2 text-[#888] text-xs hover:bg-[#1a1a1a] hover:text-[#ededed]"
										/>
									}
								>
									<RefreshCw className="mr-1.5 h-3.5 w-3.5" />
									Regenerate
								</AlertDialogTrigger>
								<AlertDialogContent className="rounded-sm border-[#262626] bg-[#0a0a0a]">
									<AlertDialogHeader>
										<AlertDialogTitle className="text-[#ededed]">
											Regenerate MCP URL?
										</AlertDialogTitle>
										<AlertDialogDescription className="text-[#666]">
											This will invalidate your current URL. Any integrations
											using the old URL will stop working.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel className="rounded-sm border-[#262626] bg-transparent text-[#888] hover:bg-[#1a1a1a] hover:text-[#ededed]">
											Cancel
										</AlertDialogCancel>
										<AlertDialogAction
											onClick={() => regenerateKey.mutate({})}
											disabled={regenerateKey.isPending}
											className="rounded-sm bg-[#ededed] text-[#0a0a0a] hover:bg-[#d4d4d4]"
										>
											{regenerateKey.isPending
												? "Regenerating..."
												: "Regenerate"}
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					</div>
				) : (
					<Button
						onClick={() => createKey.mutate({})}
						disabled={createKey.isPending}
						className="h-9 w-full rounded-md border border-[#262626] bg-[#1a1a1a] text-[#ededed] text-sm transition-[background-color,border-color] duration-100 hover:border-[#404040] hover:bg-[#262626]"
					>
						{createKey.isPending ? (
							<>
								<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
								Generating...
							</>
						) : (
							<>
								<Link2 className="mr-2 h-4 w-4" />
								Generate MCP URL
							</>
						)}
					</Button>
				)}
			</div>
		</section>
	);
}
