"use client";

import { useState } from "react";
import {
  Link2,
  Settings2,
  ImageIcon,
  Calendar,
  Loader2,
  Share2,
  Globe,
  Copy,
  CircleCheck,
  Trash2,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { orpc, queryClient } from "@/utils/orpc";
import { useFolderStore } from "@/stores/folder-store";

interface BookmarkHeroProps {
  showImages: boolean;
  setShowImages: (value: boolean) => void;
  showMonths: boolean;
  setShowMonths: (value: boolean) => void;
  selectedFolderId: string | null;
  selectedFolderIcon: string | null;
  selectedFolderName: string | null;
  isLoading?: boolean;
  isPublicView?: boolean;
  isShared?: boolean;
}

interface Metadata {
  url: string;
  title: string;
  description: string | null;
  faviconUrl: string | null;
  ogImageUrl: string | null;
}

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

export function BookmarkHero({
  showImages,
  setShowImages,
  showMonths,
  setShowMonths,
  selectedFolderId,
  selectedFolderIcon,
  selectedFolderName,
  isLoading: isFolderLoading = false,
  isPublicView = false,
  isShared: initialIsShared = false,
}: BookmarkHeroProps) {
  const [inputValue, setInputValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const { setSelectedFolderId } = useFolderStore();

  // Fetch folder to get isShared status
  const { data: folder } = useQuery({
    ...orpc.folder.getById.queryOptions({
      input: { id: selectedFolderId ?? "" },
    }),
    enabled: !!selectedFolderId && !isPublicView,
  });

  const isShared = folder?.isShared ?? initialIsShared;

  const bookmarkQueryKey = orpc.bookmark.getByFolder.queryOptions({
    input: { folderId: selectedFolderId ?? "" },
  }).queryKey;

  const folderQueryKey = orpc.folder.getById.queryOptions({
    input: { id: selectedFolderId ?? "" },
  }).queryKey;

  type FolderData = typeof folder;

  const toggleShare = useMutation(
    orpc.folder.toggleShare.mutationOptions({
      onMutate: async ({ isShared: newIsShared }) => {
        await queryClient.cancelQueries({ queryKey: folderQueryKey });

        const previousFolder =
          queryClient.getQueryData<FolderData>(folderQueryKey);

        queryClient.setQueryData<FolderData>(folderQueryKey, (old) => {
          if (!old) return old;
          return { ...old, isShared: newIsShared };
        });

        return { previousFolder };
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: folderQueryKey });
        queryClient.invalidateQueries({
          queryKey: orpc.folder.getAll.queryOptions().queryKey,
        });
      },
      onError: (error, _, context) => {
        if (context?.previousFolder) {
          queryClient.setQueryData(folderQueryKey, context.previousFolder);
        }
        toast.error(error.message || "Failed to update sharing");
      },
    }),
  );

  const deleteFolder = useMutation(
    orpc.folder.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.folder.getAll.queryOptions().queryKey,
        });
        setSelectedFolderId(null);
        toast("Folder deleted");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete folder");
      },
    }),
  );

  const createBookmark = useMutation(
    orpc.bookmark.create.mutationOptions({
      onMutate: async (newBookmark) => {
        await queryClient.cancelQueries({ queryKey: bookmarkQueryKey });

        const previousBookmarks =
          queryClient.getQueryData<Bookmark[]>(bookmarkQueryKey);

        queryClient.setQueryData<Bookmark[]>(bookmarkQueryKey, (old = []) => [
          {
            id: `temp-${Date.now()}`,
            url: newBookmark.url,
            title: newBookmark.title,
            faviconUrl: newBookmark.faviconUrl ?? null,
            ogImageUrl: newBookmark.ogImageUrl ?? null,
            description: newBookmark.description ?? null,
            folderId: newBookmark.folderId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          ...old,
        ]);

        return { previousBookmarks };
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: bookmarkQueryKey });
        // Also invalidate folder count
        queryClient.invalidateQueries({
          queryKey: orpc.folder.getAll.queryOptions().queryKey,
        });
      },
      onError: (error, _, context) => {
        if (context?.previousBookmarks) {
          queryClient.setQueryData(bookmarkQueryKey, context.previousBookmarks);
        }
        toast.error(error.message || "Failed to save bookmark");
      },
    }),
  );

  const handleSubmit = async () => {
    const url = inputValue.trim();
    if (!url || !selectedFolderId) return;

    setIsSaving(true);

    try {
      // Fetch metadata
      const response = await fetch(
        `/api/metadata?url=${encodeURIComponent(url)}`,
      );
      const metadata: Metadata = await response.json();

      if (metadata.url) {
        // Create bookmark with metadata
        createBookmark.mutate({
          url: metadata.url,
          title: metadata.title,
          faviconUrl: metadata.faviconUrl,
          ogImageUrl: metadata.ogImageUrl,
          description: metadata.description,
          folderId: selectedFolderId,
        });

        setInputValue("");
        toast("Bookmark saved");
      } else {
        toast.error("Failed to fetch link metadata");
      }
    } catch {
      toast.error("Failed to save bookmark");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSaving && inputValue.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleToggleShare = (value: boolean) => {
    if (!selectedFolderId) return;
    toggleShare.mutate({ id: selectedFolderId, isShared: value });
  };

  const handleCopyLink = () => {
    if (!selectedFolderId) return;
    const url = `${window.location.origin}/f/${selectedFolderId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteFolder = () => {
    if (!selectedFolderId) return;
    deleteFolder.mutate({ id: selectedFolderId });
  };

  return (
    <div className="mb-8 sm:mb-12">
      <div className="mb-3 sm:mb-4">
        {isFolderLoading ? (
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#1a1a1a] rounded animate-pulse" />
        ) : (
          <span className="text-3xl sm:text-4xl">
            {selectedFolderIcon ?? "📁"}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-2">
          {isFolderLoading ? (
            <div className="h-8 sm:h-9 w-40 bg-[#1a1a1a] rounded animate-pulse" />
          ) : (
            <h1 className="text-2xl sm:text-[32px] font-bold text-[#ededed] tracking-tight">
              {selectedFolderName ?? "No folder selected"}
            </h1>
          )}

          {!isFolderLoading && (
            <Tooltip>
              <TooltipTrigger>
                <span>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-1.5 hover:bg-[#1a1a1a] text-[#4a4a4a] hover:text-white rounded transition-colors outline-none">
                      <Settings2 className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-48 sm:w-52 bg-[#0a0a0a] border-[#262626]"
                    >
                      <div className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-[#1a1a1a] transition-colors">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-[#666]" />
                          <span className="text-[13px] text-[#ededed]">
                            Show image
                          </span>
                        </div>
                        <Switch
                          checked={showImages}
                          onCheckedChange={setShowImages}
                          className="data-[state=checked]:bg-[#ededed] data-[state=unchecked]:bg-[#333] h-4 w-7"
                        />
                      </div>
                      <div className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-[#1a1a1a] transition-colors">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#666]" />
                          <span className="text-[13px] text-[#ededed]">
                            Show months
                          </span>
                        </div>
                        <Switch
                          checked={showMonths}
                          onCheckedChange={setShowMonths}
                          className="data-[state=checked]:bg-[#ededed] data-[state=unchecked]:bg-[#333] h-4 w-7"
                        />
                      </div>
                      <div className="mt-1 pt-1 border-t border-[#262626]">
                        <button
                          onClick={handleDeleteFolder}
                          disabled={deleteFolder.isPending}
                          className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-[13px]">
                            {deleteFolder.isPending
                              ? "Deleting..."
                              : "Delete folder"}
                          </span>
                        </button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                sideOffset={10}
                className="bg-[#1a1a1a] border-[#262626] text-[#ededed] text-xs px-2 py-1"
              >
                Layout settings
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {!isFolderLoading && !isPublicView && selectedFolderId && (
          <Tooltip>
            <TooltipTrigger>
              <span>
                <DropdownMenu>
                  <DropdownMenuTrigger className="p-1.5 hover:bg-[#1a1a1a] text-[#4a4a4a] hover:text-white rounded transition-colors outline-none">
                    <Share2 className="w-4 h-4 " />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 bg-[#0a0a0a] border-[#262626] p-1"
                  >
                    <div className="flex items-center justify-between px-1 py-1">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#666]" />
                        <div className="flex flex-col">
                          <span className="text-[13px] text-[#ededed]">
                            Public
                          </span>
                          <span className="text-[11px] text-[#4a4a4a]">
                            Anyone with the link can view
                          </span>
                        </div>
                      </div>
                      <Switch
                        checked={isShared}
                        onCheckedChange={handleToggleShare}
                        disabled={toggleShare.isPending}
                        className="data-[state=checked]:bg-[#ededed] data-[state=unchecked]:bg-[#333] h-4 w-7"
                      />
                    </div>

                    <AnimatePresence>
                      {isShared && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <button
                            onClick={handleCopyLink}
                            className={`w-full flex items-center gap-2 mt-1 px-2.5 py-2 rounded-md border transition-all duration-200 bg-[#111] ${
                              copied
                                ? "border-emerald-500"
                                : "border-[#262626] hover:border-[#404040]"
                            }`}
                          >
                            <AnimatePresence mode="wait">
                              {copied ? (
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
                            <span
                              className={`text-[12px] truncate ${copied ? "text-emerald-500" : "text-[#666]"}`}
                            >
                              {typeof window !== "undefined"
                                ? `${window.location.host}/f/${selectedFolderId.slice(0, 8)}...`
                                : `memora.app/f/${selectedFolderId.slice(0, 8)}...`}
                            </span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </DropdownMenuContent>
                </DropdownMenu>
              </span>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              sideOffset={10}
              className="bg-[#1a1a1a] border-[#262626] text-[#ededed] text-xs px-2 py-1"
            >
              Share folder
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {!isPublicView && (
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedFolderId
                ? "paste a link to save"
                : "select a folder first"
            }
            disabled={!selectedFolderId || isSaving || isFolderLoading}
            className="w-full bg-transparent border border-[#262626] rounded-md px-3 sm:px-3 py-2 sm:py-2 text-[14px] sm:text-[15px] text-[#ededed] placeholder:text-[#4a4a4a] focus:outline-none focus:border-[#404040] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isSaving ? (
              <Loader2 className="w-4 h-4 text-[#4a4a4a] animate-spin" />
            ) : (
              <Link2 className="w-4 h-4 text-[#4a4a4a]" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
