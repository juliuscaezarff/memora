"use client";

import { useMutation } from "@tanstack/react-query";
import {
  Calendar,
  CircleCheck,
  Copy,
  Eye,
  Globe,
  ImageIcon,
  Link2,
  Loader2,
  Settings2,
  Share2,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerSearch,
} from "@/components/ui/emoji-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFolderStore } from "@/stores/folder-store";
import { orpc, queryClient } from "@/utils/orpc";

interface BookmarkHeroProps {
  showImages?: boolean;
  setShowImages?: (value: boolean) => void;
  showPreview?: boolean;
  setShowPreview?: (value: boolean) => void;
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

function normalizeBookmarkUrl(input: string) {
  const withProtocol = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  const parsed = new URL(withProtocol);

  return {
    url: parsed.toString(),
    title: parsed.hostname.replace(/^www\./, ""),
    faviconUrl: `${parsed.origin}/favicon.ico`,
  };
}

function playSaveFeedback(
  input: HTMLInputElement | null,
  icon: HTMLDivElement | null,
) {
  if (!input || !icon) return;

  const restingBorderColor = input.matches(":focus") ? "#404040" : "#262626";
  input.getAnimations().forEach((animation) => {
    animation.cancel();
  });
  icon.getAnimations().forEach((animation) => {
    animation.cancel();
  });

  const timing: KeyframeAnimationOptions = {
    duration: 900,
    easing: "cubic-bezier(0.2, 0, 0, 1)",
  };

  input.animate(
    [
      { borderColor: restingBorderColor },
      { borderColor: "#10b981", offset: 0.15 },
      { borderColor: "#10b981", offset: 0.8 },
      { borderColor: restingBorderColor },
    ],
    timing,
  );
  icon.animate(
    [
      { color: "#4a4a4a" },
      { color: "#10b981", offset: 0.15 },
      { color: "#10b981", offset: 0.8 },
      { color: "#4a4a4a" },
    ],
    timing,
  );
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

function focusInput(element: HTMLInputElement | null) {
  element?.focus();
}

function FolderEmojiEditor({
  icon,
  onSelect,
}: {
  icon: string;
  onSelect: (icon: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        aria-label="Change folder icon"
        className="-ms-2.5 block w-fit cursor-pointer rounded-md p-1 text-3xl leading-none outline-none sm:text-4xl"
      >
        {icon}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-fit overflow-hidden rounded-md border-[#262626] bg-[#0a0a0a] p-0"
      >
        <EmojiPicker
          className="h-[320px] rounded-md bg-[#0a0a0a]"
          onEmojiSelect={({ emoji }) => {
            onSelect(emoji);
            setIsOpen(false);
          }}
        >
          <EmojiPickerSearch
            placeholder="Search emoji..."
            className="border-[#262626]"
          />
          <EmojiPickerContent />
        </EmojiPicker>
      </PopoverContent>
    </Popover>
  );
}

function FolderNameEditor({
  folderId,
  name,
  onCommit,
}: {
  folderId: string;
  name: string;
  onCommit: (name: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  const commitName = (value: string) => {
    setIsEditing(false);
    onCommit(value);
  };

  if (!isEditing) {
    return (
      <h1 className="font-bold text-2xl text-[#ededed] leading-tight tracking-tight sm:text-[32px]">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="cursor-text text-left outline-none"
          aria-label="Edit folder name"
        >
          {name}
        </button>
      </h1>
    );
  }

  return (
    <input
      key={folderId}
      type="text"
      defaultValue={name}
      maxLength={50}
      ref={focusInput}
      aria-label="Folder name"
      onBlur={(event) => commitName(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
        if (event.key === "Escape") {
          event.preventDefault();
          event.currentTarget.value = name;
          event.currentTarget.blur();
        }
      }}
      className="min-w-[1ch] max-w-[calc(100vw-9rem)] appearance-none border-0 bg-transparent p-0 font-bold text-2xl text-[#ededed] leading-tight tracking-tight outline-none [field-sizing:content] sm:max-w-md sm:text-[32px]"
    />
  );
}

export function BookmarkHero({
  showImages,
  setShowImages,
  showPreview,
  setShowPreview,
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
  const inputRef = useRef<HTMLInputElement>(null);
  const inputIconRef = useRef<HTMLDivElement>(null);
  const { setSelectedFolderId } = useFolderStore();

  const isShared = initialIsShared;

  const bookmarkQueryKey = orpc.bookmark.getByFolder.queryOptions({
    input: { folderId: selectedFolderId ?? "" },
  }).queryKey;

  const foldersQueryKey = orpc.folder.getAll.queryOptions().queryKey;

  const updateFolder = useMutation(
    orpc.folder.update.mutationOptions({
      onMutate: async (updatedFolder) => {
        await queryClient.cancelQueries({ queryKey: foldersQueryKey });

        const previousFolder = queryClient
          .getQueryData(foldersQueryKey)
          ?.find((folder) => folder.id === updatedFolder.id);

        queryClient.setQueryData(foldersQueryKey, (old = []) =>
          old.map((folder) =>
            folder.id === updatedFolder.id
              ? {
                  ...folder,
                  ...(updatedFolder.name !== undefined && {
                    name: updatedFolder.name,
                  }),
                  ...(updatedFolder.icon !== undefined && {
                    icon: updatedFolder.icon,
                  }),
                }
              : folder,
          ),
        );

        return { previousFolder };
      },
      onError: (error, updatedFolder, context) => {
        const previousFolder = context?.previousFolder;
        if (previousFolder) {
          queryClient.setQueryData(foldersQueryKey, (old = []) =>
            old.map((folder) =>
              folder.id === updatedFolder.id
                ? {
                    ...folder,
                    ...(updatedFolder.name !== undefined &&
                      folder.name === updatedFolder.name && {
                      name: previousFolder.name,
                    }),
                    ...(updatedFolder.icon !== undefined &&
                      folder.icon === updatedFolder.icon && {
                      icon: previousFolder.icon,
                    }),
                  }
                : folder,
            ),
          );
        }
        toast.error(error.message || "Failed to update folder");
      },
    }),
  );

  const toggleShare = useMutation(
    orpc.folder.toggleShare.mutationOptions({
      onMutate: async ({ id, isShared: newIsShared }) => {
        await queryClient.cancelQueries({ queryKey: foldersQueryKey });

        const previousFolders = queryClient.getQueryData(foldersQueryKey);

        queryClient.setQueryData(foldersQueryKey, (old = []) =>
          old.map((folder) =>
            folder.id === id ? { ...folder, isShared: newIsShared } : folder,
          ),
        );

        return { previousFolders };
      },
      onError: (error, _, context) => {
        if (context?.previousFolders) {
          queryClient.setQueryData(foldersQueryKey, context.previousFolders);
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

  const updateMetadata = useMutation(
    orpc.bookmark.updateMetadata.mutationOptions({
      onSuccess: (updatedBookmark) => {
        queryClient.setQueryData<Bookmark[]>(bookmarkQueryKey, (old = []) =>
          old.map((bookmark) =>
            bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark,
          ),
        );
      },
    }),
  );

  const enrichBookmark = async (bookmark: Bookmark) => {
    try {
      const response = await fetch(
        `/api/metadata?url=${encodeURIComponent(bookmark.url)}`,
      );
      if (!response.ok) return;

      const metadata: Metadata = await response.json();
      if (!metadata.title) return;

      updateMetadata.mutate({
        id: bookmark.id,
        title: metadata.title,
        faviconUrl: metadata.faviconUrl,
        ogImageUrl: metadata.ogImageUrl,
        description: metadata.description,
      });
    } catch {
      // The bookmark is already saved with URL-derived metadata.
    }
  };

  const createBookmark = useMutation(
    orpc.bookmark.create.mutationOptions({
      onMutate: async (newBookmark) => {
        await Promise.all([
          queryClient.cancelQueries({ queryKey: bookmarkQueryKey }),
          queryClient.cancelQueries({ queryKey: foldersQueryKey }),
        ]);

        const previousBookmarks =
          queryClient.getQueryData<Bookmark[]>(bookmarkQueryKey);
        const previousFolders = queryClient.getQueryData(foldersQueryKey);
        const temporaryId = `temp-${crypto.randomUUID()}`;

        queryClient.setQueryData<Bookmark[]>(bookmarkQueryKey, (old = []) => [
          {
            id: temporaryId,
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

        queryClient.setQueryData(foldersQueryKey, (old = []) =>
          old.map((folder) =>
            folder.id === newBookmark.folderId
              ? {
                  ...folder,
                  _count: {
                    bookmarks: folder._count.bookmarks + 1,
                  },
                }
              : folder,
          ),
        );

        return { previousBookmarks, previousFolders, temporaryId };
      },
      onSuccess: (bookmark, _, context) => {
        queryClient.setQueryData<Bookmark[]>(bookmarkQueryKey, (old = []) =>
          old.map((item) =>
            item.id === context.temporaryId ? bookmark : item,
          ),
        );
        void enrichBookmark(bookmark);
        setIsSaving(false);
      },
      onError: (error, _, context) => {
        if (context?.previousBookmarks) {
          queryClient.setQueryData(bookmarkQueryKey, context.previousBookmarks);
        }
        if (context?.previousFolders) {
          queryClient.setQueryData(foldersQueryKey, context.previousFolders);
        }
        setIsSaving(false);
        toast.error(error.message || "Failed to save bookmark");
      },
    }),
  );

  const handleSubmit = () => {
    const input = inputValue.trim();
    if (!input || !selectedFolderId) return;

    try {
      const normalized = normalizeBookmarkUrl(input);
      setIsSaving(true);
      setInputValue("");
      createBookmark.mutate({
        url: normalized.url,
        title: normalized.title,
        faviconUrl: normalized.faviconUrl,
        ogImageUrl: null,
        description: null,
        folderId: selectedFolderId,
      });
      playSaveFeedback(inputRef.current, inputIconRef.current);
      toast("Bookmark saved");
    } catch {
      toast.error("Please enter a valid URL");
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

  const handleFolderIconChange = (icon: string) => {
    if (!selectedFolderId || icon === selectedFolderIcon) return;
    updateFolder.mutate({ id: selectedFolderId, icon });
  };

  const handleFolderNameCommit = (value: string) => {
    const name = value.trim();
    if (!name) {
      toast.error("Folder name cannot be empty");
      return;
    }
    if (!selectedFolderId || name === selectedFolderName) return;

    updateFolder.mutate({ id: selectedFolderId, name });
  };

  return (
    <div className="mb-6">
      <div className="mb-3 sm:mb-4">
        {isFolderLoading ? (
          <div className="h-9 w-9 animate-pulse rounded bg-[#1a1a1a] sm:h-10 sm:w-10" />
        ) : !isPublicView && selectedFolderId ? (
          <FolderEmojiEditor
            icon={selectedFolderIcon ?? "📁"}
            onSelect={handleFolderIconChange}
          />
        ) : (
          <span className="-ms-1.5 block w-fit text-3xl sm:text-4xl">
            {selectedFolderIcon ?? "📁"}
          </span>
        )}
      </div>

      <div className="mb-6 flex items-center justify-between sm:mb-8">
        <div className="flex items-center gap-2">
          {isFolderLoading ? (
            <div className="h-8 w-40 animate-pulse rounded bg-[#1a1a1a] sm:h-9" />
          ) : !isPublicView && selectedFolderId ? (
            <FolderNameEditor
              folderId={selectedFolderId}
              name={selectedFolderName ?? "No folder selected"}
              onCommit={handleFolderNameCommit}
            />
          ) : (
            <h1 className="font-bold text-2xl text-[#ededed] tracking-tight sm:text-[32px]">
              {selectedFolderName ?? "No folder selected"}
            </h1>
          )}

          {!isFolderLoading && (
            <Tooltip>
              <TooltipTrigger>
                <span>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="rounded-md p-1.5 text-[#4a4a4a] outline-none transition-colors hover:bg-[#1a1a1a] hover:text-white">
                      <Settings2 className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-48 border-[#262626] bg-[#0a0a0a] sm:w-52"
                    >
                      {isPublicView ? (
                        <div className="flex items-center justify-between rounded-[calc(var(--radius-md)-0.25rem)] px-2 py-2 transition-colors hover:bg-[#1a1a1a]">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-[#666]" />
                            <span className="text-[#ededed] text-[13px]">
                              Show image
                            </span>
                          </div>
                          <Switch
                            checked={showImages}
                            onCheckedChange={setShowImages}
                            className="h-4 w-7 data-[state=checked]:bg-[#ededed] data-[state=unchecked]:bg-[#333]"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between rounded-[calc(var(--radius-md)-0.25rem)] px-2 py-2 transition-colors hover:bg-[#1a1a1a]">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-[#666]" />
                            <span className="text-[#ededed] text-[13px]">
                              Show preview
                            </span>
                          </div>
                          <Switch
                            checked={showPreview}
                            onCheckedChange={setShowPreview}
                            className="h-4 w-7 data-[state=checked]:bg-[#ededed] data-[state=unchecked]:bg-[#333]"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between rounded-[calc(var(--radius-md)-0.25rem)] px-2 py-2 transition-colors hover:bg-[#1a1a1a]">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#666]" />
                          <span className="text-[#ededed] text-[13px]">
                            Show months
                          </span>
                        </div>
                        <Switch
                          checked={showMonths}
                          onCheckedChange={setShowMonths}
                          className="h-4 w-7 data-[state=checked]:bg-[#ededed] data-[state=unchecked]:bg-[#333]"
                        />
                      </div>
                      <div className="mt-1 border-[#262626] border-t pt-1">
                        <button
                          type="button"
                          onClick={handleDeleteFolder}
                          disabled={deleteFolder.isPending}
                          className="flex w-full items-center gap-2 rounded-[calc(var(--radius-md)-0.25rem)] px-2 py-2 text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
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
                className="border-[#262626] bg-[#1a1a1a] px-2 py-1 text-[#ededed] text-xs"
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
                  <DropdownMenuTrigger className="rounded-md p-1.5 text-[#4a4a4a] outline-none transition-colors hover:bg-[#1a1a1a] hover:text-white">
                    <Share2 className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 border-[#262626] bg-[#0a0a0a] p-1"
                  >
                    <div className="flex items-center justify-between px-1 py-1">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-[#666]" />
                        <div className="flex flex-col">
                          <span className="text-[#ededed] text-[13px]">
                            Public
                          </span>
                          <span className="text-[#4a4a4a] text-[11px]">
                            Anyone with the link can view
                          </span>
                        </div>
                      </div>
                      <Switch
                        checked={isShared}
                        onCheckedChange={handleToggleShare}
                        disabled={toggleShare.isPending}
                        className="h-4 w-7 data-[state=checked]:bg-[#ededed] data-[state=unchecked]:bg-[#333]"
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
                            type="button"
                            onClick={handleCopyLink}
                            className={`mt-1 flex w-full items-center gap-2 rounded-[calc(var(--radius-md)-0.25rem)] border bg-[#111] px-2.5 py-2 transition-all duration-200 ${
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
                                  <CircleCheck className="h-4 w-4 text-emerald-500" />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="copy"
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <Copy className="h-4 w-4 text-[#666]" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                            <span
                              className={`truncate text-[12px] ${copied ? "text-emerald-500" : "text-[#666]"}`}
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
              className="border-[#262626] bg-[#1a1a1a] px-2 py-1 text-[#ededed] text-xs"
            >
              Share folder
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {!isPublicView && (
        <div className="relative">
          <input
            ref={inputRef}
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
            className="w-full rounded-md border border-[#262626] bg-transparent px-2.5 py-1.5 text-[#ededed] text-[14px] transition-colors duration-150 placeholder:text-[#4a4a4a] focus:border-[#404040] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-[15px]"
          />
          <div
            ref={inputIconRef}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[#4a4a4a]"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin text-current" />
            ) : (
              <Link2 className="h-4 w-4 text-current" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
