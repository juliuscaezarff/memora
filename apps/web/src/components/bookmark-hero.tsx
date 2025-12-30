"use client";

import { useState } from "react";
import { Link2, Settings2, ImageIcon, Calendar, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
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

interface BookmarkHeroProps {
  showImages: boolean;
  setShowImages: (value: boolean) => void;
  showMonths: boolean;
  setShowMonths: (value: boolean) => void;
  selectedFolderId: string | null;
  selectedFolderIcon: string | null;
  selectedFolderName: string | null;
  isLoading?: boolean;
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
}: BookmarkHeroProps) {
  const [inputValue, setInputValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const bookmarkQueryKey = orpc.bookmark.getByFolder.queryOptions({
    input: { folderId: selectedFolderId ?? "" },
  }).queryKey;

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
        toast.success("Bookmark saved");
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

  return (
    <div className="mb-8 sm:mb-12">
      {/* Folder icon like Notion */}
      <div className="mb-3 sm:mb-4">
        {isFolderLoading ? (
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#1a1a1a] rounded animate-pulse" />
        ) : (
          <span className="text-3xl sm:text-4xl">
            {selectedFolderIcon ?? "📁"}
          </span>
        )}
      </div>

      {/* Title with layout settings dropdown */}
      <div className="flex items-center gap-2 mb-6 sm:mb-8">
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
                  <DropdownMenuTrigger className="p-1.5 hover:bg-[#1a1a1a] rounded transition-colors outline-none">
                    <Settings2 className="w-4 h-4 text-[#4a4a4a] hover:text-[#666]" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-48 sm:w-52 bg-[#0a0a0a] border-[#262626] p-2"
                  >
                    {/* Show Images toggle */}
                    <div className="flex items-center justify-between px-2 py-2 rounded hover:bg-[#1a1a1a] transition-colors">
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

                    {/* Show Months toggle */}
                    <div className="flex items-center justify-between px-2 py-2 rounded hover:bg-[#1a1a1a] transition-colors">
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

      {/* Input field like "who to bother" */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedFolderId ? "paste a link to save" : "select a folder first"
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
    </div>
  );
}
