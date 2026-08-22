"use client";

import { useMutation } from "@tanstack/react-query";
import {
	CircleCheck,
	Copy,
	ExternalLink,
	FolderInput,
	MoreHorizontal,
	PanelRight,
	Share2,
	Tag,
	Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { orpc, queryClient } from "@/utils/orpc";
import { LinkPreviewDrawer } from "./link-preview-drawer";

type Bookmark = {
	id: string;
	url: string;
	title: string;
	faviconUrl: string | null;
	ogImageUrl: string | null;
	description: string | null;
	folderId: string;
	createdAt: Date;
	updatedAt: Date;
	labels: BookmarkLabel[];
};

type BookmarkLabel = {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	name: string;
	userId: string;
	color: string;
};

interface BookmarkActionsProps {
	bookmark: Omit<Bookmark, "labels"> & { labels?: BookmarkLabel[] };
	currentFolderId: string;
	folders: Array<{ id: string; name: string; icon: string }>;
	labels?: BookmarkLabel[];
	alwaysVisible?: boolean;
}

export function BookmarkActions({
	bookmark,
	currentFolderId,
	folders,
	labels = [],
	alwaysVisible = false,
}: BookmarkActionsProps) {
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const [showPreview, setShowPreview] = useState(false);

	const bookmarkQueryKey = orpc.bookmark.getByFolder.queryOptions({
		input: { folderId: currentFolderId },
	}).queryKey;

	const deleteBookmark = useMutation(
		orpc.bookmark.delete.mutationOptions({
			onMutate: async ({ id }) => {
				await queryClient.cancelQueries({ queryKey: bookmarkQueryKey });

				const previousBookmarks =
					queryClient.getQueryData<Bookmark[]>(bookmarkQueryKey);

				queryClient.setQueryData<Bookmark[]>(bookmarkQueryKey, (old = []) =>
					old.filter((b) => b.id !== id),
				);

				return { previousBookmarks };
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: bookmarkQueryKey });
				queryClient.invalidateQueries({
					queryKey: orpc.folder.getAll.queryOptions().queryKey,
				});
			},
			onError: (error, _, context) => {
				if (context?.previousBookmarks) {
					queryClient.setQueryData(bookmarkQueryKey, context.previousBookmarks);
				}
				toast.error(error.message || "Failed to delete bookmark");
			},
		}),
	);

	const moveBookmark = useMutation(
		orpc.bookmark.move.mutationOptions({
			onMutate: async ({ id }) => {
				await queryClient.cancelQueries({ queryKey: bookmarkQueryKey });

				const previousBookmarks =
					queryClient.getQueryData<Bookmark[]>(bookmarkQueryKey);

				queryClient.setQueryData<Bookmark[]>(bookmarkQueryKey, (old = []) =>
					old.filter((b) => b.id !== id),
				);

				return { previousBookmarks };
			},
			onSuccess: (_, { targetFolderId }) => {
				queryClient.invalidateQueries({ queryKey: bookmarkQueryKey });
				queryClient.invalidateQueries({
					queryKey: orpc.bookmark.getByFolder.queryOptions({
						input: { folderId: targetFolderId },
					}).queryKey,
				});
				queryClient.invalidateQueries({
					queryKey: orpc.folder.getAll.queryOptions().queryKey,
				});
			},
			onError: (error, _, context) => {
				if (context?.previousBookmarks) {
					queryClient.setQueryData(bookmarkQueryKey, context.previousBookmarks);
				}
				toast.error(error.message || "Failed to move bookmark");
			},
		}),
	);

	const setLabel = useMutation(
		orpc.label.setOnBookmark.mutationOptions({
			onMutate: async ({ bookmarkId, labelId, assigned }) => {
				await queryClient.cancelQueries({ queryKey: bookmarkQueryKey });
				const previousBookmarks =
					queryClient.getQueryData<Bookmark[]>(bookmarkQueryKey);
				const label = labels.find((item) => item.id === labelId);

				queryClient.setQueryData<Bookmark[]>(bookmarkQueryKey, (old = []) =>
					old.map((item) => {
						if (item.id !== bookmarkId || !label) return item;

						return {
							...item,
							labels: assigned
								? [
										...(item.labels ?? []).filter(
											(current) => current.id !== labelId,
										),
										label,
									]
								: (item.labels ?? []).filter(
										(current) => current.id !== labelId,
									),
						};
					}),
				);

				return { previousBookmarks };
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: bookmarkQueryKey });
				queryClient.invalidateQueries({
					queryKey: orpc.label.getAll.queryOptions().queryKey,
				});
			},
			onError: (error, _, context) => {
				if (context?.previousBookmarks) {
					queryClient.setQueryData(bookmarkQueryKey, context.previousBookmarks);
				}
				toast.error(error.message || "Failed to update label");
			},
		}),
	);

	const handleCopyUrl = () => {
		navigator.clipboard.writeText(bookmark.url);
		setCopiedId(bookmark.id);
		setTimeout(() => setCopiedId(null), 2000);
	};

	const handleOpenLink = () => {
		window.open(bookmark.url, "_blank", "noopener,noreferrer");
	};

	const handleShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({ title: bookmark.title, url: bookmark.url });
			} catch {
				// User cancelled or share failed
			}
		} else {
			handleCopyUrl();
		}
	};

	const handleMove = (targetFolderId: string) => {
		moveBookmark.mutate({ id: bookmark.id, targetFolderId });
	};

	const otherFolders = folders.filter((f) => f.id !== currentFolderId);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				aria-label="Bookmark actions"
				className={cn(
					"shrink-0 rounded p-1.5 text-[#666] outline-none transition-colors duration-100 hover:text-white focus-visible:text-white",
					!alwaysVisible &&
						"hover:bg-[#1a1a1a] focus-visible:bg-[#1a1a1a] sm:opacity-0 sm:group-hover:opacity-100",
				)}
			>
				<MoreHorizontal className="size-4" />
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-40 border-[#262626] bg-[#0a0a0a] text-[#ededed]"
			>
				<DropdownMenuItem
					className="flex cursor-pointer items-center gap-2 focus:bg-[#1a1a1a] focus:text-white"
					onClick={handleOpenLink}
				>
					<ExternalLink className="h-4 w-4 text-[#666]" />
					<span className="text-[13px]">Open link</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					className="flex cursor-pointer items-center gap-2 focus:bg-[#1a1a1a] focus:text-white"
					onClick={() => setShowPreview(true)}
				>
					<PanelRight className="h-4 w-4 text-[#666]" />
					<span className="text-[13px]">Preview</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					className="flex cursor-pointer items-center gap-2 focus:bg-[#1a1a1a] focus:text-white"
					onClick={handleCopyUrl}
				>
					<AnimatePresence mode="wait" initial={false}>
						{copiedId === bookmark.id ? (
							<motion.div
								key="check"
								initial={{ scale: 0.25, opacity: 0, filter: "blur(4px)" }}
								animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
								exit={{ scale: 0.25, opacity: 0, filter: "blur(4px)" }}
								transition={{ type: "spring", duration: 0.3, bounce: 0 }}
							>
								<CircleCheck className="h-4 w-4 text-emerald-500" />
							</motion.div>
						) : (
							<motion.div
								key="copy"
								initial={{ scale: 0.25, opacity: 0, filter: "blur(4px)" }}
								animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
								exit={{ scale: 0.25, opacity: 0, filter: "blur(4px)" }}
								transition={{ type: "spring", duration: 0.3, bounce: 0 }}
							>
								<Copy className="h-4 w-4 text-[#666]" />
							</motion.div>
						)}
					</AnimatePresence>
					<span className="text-[13px]">
						{copiedId === bookmark.id ? "Copied!" : "Copy URL"}
					</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					className="mb-1 flex cursor-pointer items-center gap-2 focus:bg-[#1a1a1a] focus:text-white"
					onClick={handleShare}
				>
					<Share2 className="h-4 w-4 text-[#666]" />
					<span className="text-[13px]">Share</span>
				</DropdownMenuItem>

				{otherFolders.length > 0 && (
					<>
						<DropdownMenuSeparator className="bg-[#262626]" />
						<DropdownMenuSub>
							<DropdownMenuSubTrigger className="mt-1 mb-1 flex cursor-pointer items-center gap-2 focus:bg-[#1a1a1a] focus:text-white data-[state=open]:bg-[#1a1a1a]">
								<FolderInput className="h-4 w-4 text-[#666]" />
								<span className="text-[13px]">Move to</span>
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent className="border-[#262626] bg-[#0a0a0a] text-[#ededed]">
								{otherFolders.map((folder) => (
									<DropdownMenuItem
										key={folder.id}
										className="flex cursor-pointer items-center gap-2 focus:bg-[#1a1a1a] focus:text-white"
										onClick={() => handleMove(folder.id)}
									>
										<span className="text-sm">{folder.icon}</span>
										<span className="text-[13px]">{folder.name}</span>
									</DropdownMenuItem>
								))}
							</DropdownMenuSubContent>
						</DropdownMenuSub>
					</>
				)}

				{labels.length > 0 && (
					<>
						<DropdownMenuSeparator className="bg-[#262626]" />
						<DropdownMenuSub>
							<DropdownMenuSubTrigger className="my-1 flex cursor-pointer items-center gap-2 focus:bg-[#1a1a1a] focus:text-white data-[state=open]:bg-[#1a1a1a]">
								<Tag className="h-4 w-4 text-[#666]" />
								<span className="text-[13px]">Labels</span>
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent className="min-w-44 border-[#262626] bg-[#0a0a0a] text-[#ededed]">
								{labels.map((label) => {
									const assigned =
										bookmark.labels?.some((item) => item.id === label.id) ??
										false;

									return (
										<DropdownMenuCheckboxItem
											key={label.id}
											checked={assigned}
											onCheckedChange={(checked) =>
												setLabel.mutate({
													bookmarkId: bookmark.id,
													labelId: label.id,
													assigned: checked,
												})
											}
											className="cursor-pointer focus:bg-[#1a1a1a] focus:text-white"
										>
											<span
												className="size-2 rounded-full"
												style={{ backgroundColor: label.color }}
											/>
											<span className="truncate text-[13px]">{label.name}</span>
										</DropdownMenuCheckboxItem>
									);
								})}
							</DropdownMenuSubContent>
						</DropdownMenuSub>
					</>
				)}

				<DropdownMenuSeparator className="bg-[#262626]" />
				<DropdownMenuItem
					variant="destructive"
					className="mt-1 flex cursor-pointer items-center gap-2"
					onClick={() => deleteBookmark.mutate({ id: bookmark.id })}
				>
					<Trash2 className="h-4 w-4" />
					<span className="text-[13px]">Delete</span>
				</DropdownMenuItem>
			</DropdownMenuContent>

			<LinkPreviewDrawer
				open={showPreview}
				onOpenChange={setShowPreview}
				url={bookmark.url}
				title={bookmark.title}
			/>
		</DropdownMenu>
	);
}
