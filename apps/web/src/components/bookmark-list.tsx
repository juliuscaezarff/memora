"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Share2, Globe, CircleCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "./ui/button";
import { BookmarkActions } from "./bookmark-actions";
import { orpc } from "@/utils/orpc";

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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: bookmarks = [] } = useQuery({
    ...orpc.bookmark.getByFolder.queryOptions({
      input: { folderId: selectedFolderId ?? "" },
    }),
    enabled: !!selectedFolderId,
  });

  const handleCopyUrl = (url: string, bookmarkId: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(bookmarkId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (
    url: string,
    title: string,
    bookmarkId: string,
  ) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyUrl(url, bookmarkId);
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

                  {/* OG Image */}
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
                              onClick={() =>
                                handleCopyUrl(bookmark.url, bookmark.id)
                              }
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
                                    <CircleCheck className="w-3.5 h-3.5 text-emerald-500" />
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="copy"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            {copiedId === bookmark.id ? "Copied!" : "Copy link"}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-[#666] hover:text-[#ededed] hover:bg-[#1a1a1a]"
                              onClick={() =>
                                handleShare(
                                  bookmark.url,
                                  bookmark.title,
                                  bookmark.id,
                                )
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
                            onClick={() =>
                              handleCopyUrl(bookmark.url, bookmark.id)
                            }
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
                                  <CircleCheck className="w-3.5 h-3.5 text-emerald-500" />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="copy"
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          {copiedId === bookmark.id ? "Copied!" : "Copy link"}
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-[#666] hover:text-[#ededed] hover:bg-[#1a1a1a]"
                            onClick={() =>
                              handleShare(
                                bookmark.url,
                                bookmark.title,
                                bookmark.id,
                              )
                            }
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Share</TooltipContent>
                      </Tooltip>
                    </div>
                  )}

                  <BookmarkActions
                    bookmark={bookmark}
                    currentFolderId={selectedFolderId}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
