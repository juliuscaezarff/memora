"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Copy,
  Share2,
  ExternalLink,
  MoreHorizontal,
  Trash2,
  FolderInput,
  CircleCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { orpc, queryClient } from "@/utils/orpc";

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
};

interface BookmarkActionsProps {
  bookmark: Bookmark;
  currentFolderId: string;
}

export function BookmarkActions({
  bookmark,
  currentFolderId,
}: BookmarkActionsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: folders = [] } = useQuery(orpc.folder.getAll.queryOptions());

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
      <DropdownMenuTrigger className="p-1.5 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-[#1a1a1a] rounded transition-all outline-none">
        <MoreHorizontal className="w-4 h-4 text-[#666]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-40 bg-[#0a0a0a] border-[#262626] text-[#ededed]"
      >
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer focus:bg-[#1a1a1a] focus:text-white"
          onClick={handleOpenLink}
        >
          <ExternalLink className="w-4 h-4 text-[#666]" />
          <span className="text-[13px]">Open link</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer focus:bg-[#1a1a1a] focus:text-white"
          onClick={handleCopyUrl}
        >
          <AnimatePresence mode="wait">
            {copiedId === bookmark.id ? (
              <motion.div
                key="check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <CircleCheck className="w-4 h-4 text-emerald-500" />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Copy className="w-4 h-4 text-[#666]" />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="text-[13px]">
            {copiedId === bookmark.id ? "Copied!" : "Copy URL"}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 mb-1 cursor-pointer focus:bg-[#1a1a1a] focus:text-white"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4 text-[#666]" />
          <span className="text-[13px]">Share</span>
        </DropdownMenuItem>

        {otherFolders.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-[#262626]" />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-2 mt-1 mb-1 cursor-pointer focus:bg-[#1a1a1a] focus:text-white data-[state=open]:bg-[#1a1a1a]">
                <FolderInput className="w-4 h-4 text-[#666]" />
                <span className="text-[13px]">Move to</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-[#0a0a0a] border-[#262626] text-[#ededed]">
                {otherFolders.map((folder) => (
                  <DropdownMenuItem
                    key={folder.id}
                    className="flex items-center gap-2 cursor-pointer focus:bg-[#1a1a1a] focus:text-white"
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

        <DropdownMenuSeparator className="bg-[#262626]" />
        <DropdownMenuItem
          variant="destructive"
          className="flex items-center gap-2 mt-1 cursor-pointer"
          onClick={() => deleteBookmark.mutate({ id: bookmark.id })}
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-[13px]">Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
