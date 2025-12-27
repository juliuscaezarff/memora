"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Copy,
  Share2,
  ExternalLink,
  MoreHorizontal,
  Trash2,
  Globe,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "./ui/button";
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

interface BookmarkListProps {
  showImages: boolean;
  showMonths: boolean;
  selectedFolderId: string | null;
}

function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function extractDisplayUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export function BookmarkList({
  showImages,
  showMonths,
  selectedFolderId,
}: BookmarkListProps) {
  const { data: bookmarks = [] } = useQuery({
    ...orpc.bookmark.getByFolder.queryOptions({
      input: { folderId: selectedFolderId ?? "" },
    }),
    enabled: !!selectedFolderId,
  });

  const bookmarkQueryKey = orpc.bookmark.getByFolder.queryOptions({
    input: { folderId: selectedFolderId ?? "" },
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
        toast.success("Bookmark deleted");
      },
      onError: (error, _, context) => {
        if (context?.previousBookmarks) {
          queryClient.setQueryData(bookmarkQueryKey, context.previousBookmarks);
        }
        toast.error(error.message || "Failed to delete bookmark");
      },
    }),
  );

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const handleOpenLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShare = async (url: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyUrl(url);
    }
  };

  if (!selectedFolderId) {
    return (
      <div className="text-center py-12 text-[#4a4a4a]">
        <p>Create a folder to start saving bookmarks</p>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12 text-[#4a4a4a]">
        <p>No bookmarks yet. Paste a link above to save your first bookmark.</p>
      </div>
    );
  }

  const groupedBookmarks = showMonths
    ? bookmarks.reduce(
        (acc, bookmark) => {
          const month = formatMonth(bookmark.createdAt);
          if (!acc[month]) acc[month] = [];
          acc[month].push(bookmark);
          return acc;
        },
        {} as Record<string, Bookmark[]>,
      )
    : { all: bookmarks };

  return (
    <div className="space-y-6">
      {Object.entries(groupedBookmarks).map(([month, items]) => (
        <div key={month}>
          {showMonths && month !== "all" && (
            <div className="text-[10px] sm:text-[11px] font-medium text-[#4a4a4a] uppercase tracking-wider mb-3">
              {month}
            </div>
          )}

          <div className="space-y-0">
            {items.map((bookmark, index) => (
              <div
                key={bookmark.id}
                className={`group flex items-center justify-between py-2.5 sm:py-3 gap-2 sm:gap-3 ${
                  index !== items.length - 1 ? "border-b border-[#1a1a1a]" : ""
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  {/* Favicon */}
                  <span className="text-sm text-[#666] w-4 sm:w-5 flex justify-center flex-shrink-0">
                    {bookmark.faviconUrl ? (
                      <img
                        src={bookmark.faviconUrl}
                        alt=""
                        className="w-4 h-4 rounded-sm"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove(
                            "hidden",
                          );
                        }}
                      />
                    ) : null}
                    <Globe
                      size={14}
                      className={bookmark.faviconUrl ? "hidden" : ""}
                    />
                  </span>

                  {/* OG Image - menor em mobile */}
                  {showImages && (
                    <div className="w-[60px] h-[34px] sm:w-[100px] sm:h-[56px] rounded overflow-hidden bg-[#111] flex-shrink-0">
                      {bookmark.ogImageUrl ? (
                        <img
                          src={bookmark.ogImageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "";
                            e.currentTarget.classList.add("hidden");
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Globe size={20} className="text-[#333]" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Title and URL */}
                  <div
                    className={`min-w-0 ${showImages ? "flex flex-col gap-0.5" : "flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3"}`}
                  >
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] sm:text-[15px] font-medium text-[#ededed] truncate hover:text-[#6366f1]"
                    >
                      {bookmark.title}
                    </a>
                    {showImages && (
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] sm:text-[12px] text-[#4a4a4a] truncate hover:text-[#6366f1]"
                      >
                        {extractDisplayUrl(bookmark.url)}
                      </a>
                    )}

                    {/* URL em mobile quando nao tem imagem */}
                    {!showImages && (
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] sm:text-[13px] text-[#4a4a4a] truncate sm:hidden hover:text-[#6366f1]"
                      >
                        {extractDisplayUrl(bookmark.url)}
                      </a>
                    )}

                    {/* Actions inline - hidden on mobile */}
                    {!showImages && (
                      <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-[#666] hover:text-[#ededed] hover:bg-[#1a1a1a]"
                              onClick={() => handleCopyUrl(bookmark.url)}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            Copy link
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-[#666] hover:text-[#ededed] hover:bg-[#1a1a1a]"
                              onClick={() =>
                                handleShare(bookmark.url, bookmark.title)
                              }
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">Share</TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side - URL and actions */}
                <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
                  {/* URL desktop only quando nao tem imagem */}
                  {!showImages && (
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden sm:block text-[13px] text-[#4a4a4a] hover:text-[#6366f1]"
                    >
                      {extractDisplayUrl(bookmark.url)}
                    </a>
                  )}

                  {/* Actions com imagem - desktop only */}
                  {showImages && (
                    <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-[#666] hover:text-[#ededed] hover:bg-[#1a1a1a]"
                            onClick={() => handleCopyUrl(bookmark.url)}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Copy link</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-[#666] hover:text-[#ededed] hover:bg-[#1a1a1a]"
                            onClick={() =>
                              handleShare(bookmark.url, bookmark.title)
                            }
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Share</TooltipContent>
                      </Tooltip>
                    </div>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-1.5 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-[#1a1a1a] rounded transition-all outline-none">
                      <MoreHorizontal className="w-4 h-4 text-[#666]" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-36 sm:w-40 bg-[#0a0a0a] border-[#262626] text-[#ededed]"
                    >
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer focus:bg-[#1a1a1a] focus:text-white"
                        onClick={() => handleOpenLink(bookmark.url)}
                      >
                        <ExternalLink className="w-4 h-4 text-[#666]" />
                        <span className="text-[13px]">Open link</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer focus:bg-[#1a1a1a] focus:text-white"
                        onClick={() => handleCopyUrl(bookmark.url)}
                      >
                        <Copy className="w-4 h-4 text-[#666]" />
                        <span className="text-[13px]">Copy URL</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer focus:bg-[#1a1a1a] focus:text-white"
                        onClick={() =>
                          handleShare(bookmark.url, bookmark.title)
                        }
                      >
                        <Share2 className="w-4 h-4 text-[#666]" />
                        <span className="text-[13px]">Share</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer text-red-400 focus:bg-[#1a1a1a] focus:text-red-400"
                        onClick={() =>
                          deleteBookmark.mutate({ id: bookmark.id })
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-[13px]">Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
