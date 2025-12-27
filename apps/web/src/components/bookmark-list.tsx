"use client";

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

const bookmarks = [
  {
    id: 1,
    title: "Vercel Documentation",
    url: "vercel.com/docs",
    ogImage: "/vercel-docs-dark.jpg",
    savedAt: "December 2025",
  },
  {
    id: 2,
    title: "Linear — Plan and build products",
    url: "linear.app",
    ogImage: "/linear-app-dark-purple.jpg",
    savedAt: "December 2025",
  },
  {
    id: 3,
    title: "Figma — Design Tool",
    url: "figma.com",
    ogImage: "/figma-design-dark.jpg",
    savedAt: "November 2025",
  },
  {
    id: 4,
    title: "Raycast — Supercharged productivity",
    url: "raycast.com",
    ogImage: "/raycast-productivity-dark.jpg",
    savedAt: "November 2025",
  },
  {
    id: 5,
    title: "Arc — The browser company",
    url: "arc.net",
    ogImage: "/arc-browser-dark-gradient.jpg",
    savedAt: "October 2025",
  },
];

interface BookmarkListProps {
  showImages: boolean;
  showMonths: boolean;
}

export function BookmarkList({ showImages, showMonths }: BookmarkListProps) {
  const groupedBookmarks = showMonths
    ? bookmarks.reduce(
        (acc, bookmark) => {
          const month = bookmark.savedAt;
          if (!acc[month]) acc[month] = [];
          acc[month].push(bookmark);
          return acc;
        },
        {} as Record<string, typeof bookmarks>,
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
                    <Globe size={12} />
                  </span>

                  {/* OG Image - menor em mobile */}
                  {showImages && (
                    <div className="w-[60px] h-[34px] sm:w-[100px] sm:h-[56px] rounded overflow-hidden bg-[#111] flex-shrink-0">
                      <img
                        src={bookmark.ogImage || "/placeholder.svg"}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Title and URL */}
                  <div
                    className={`min-w-0 ${showImages ? "flex flex-col gap-0.5" : "flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3"}`}
                  >
                    <span className="text-[13px] sm:text-[15px] font-medium text-[#ededed] truncate">
                      {bookmark.title}
                    </span>
                    {showImages && (
                      <span className="text-[11px] sm:text-[12px] text-[#4a4a4a] truncate">
                        {bookmark.url}
                      </span>
                    )}

                    {/* URL em mobile quando nao tem imagem */}
                    {!showImages && (
                      <span className="text-[11px] sm:text-[13px] text-[#4a4a4a] truncate sm:hidden">
                        {bookmark.url}
                      </span>
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
                    <span className="hidden sm:block text-[13px] text-[#4a4a4a]">
                      {bookmark.url}
                    </span>
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
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-[#1a1a1a] focus:text-white">
                        <ExternalLink className="w-4 h-4 text-[#666]" />
                        <span className="text-[13px]">Open link</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-[#1a1a1a] focus:text-white">
                        <Copy className="w-4 h-4 text-[#666]" />
                        <span className="text-[13px]">Copy URL</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-[#1a1a1a] focus:text-white">
                        <Share2 className="w-4 h-4 text-[#666]" />
                        <span className="text-[13px]">Share</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-red-400 focus:bg-[#1a1a1a] focus:text-red-400">
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
