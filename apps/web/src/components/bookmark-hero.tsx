"use client";

import { useState } from "react";
import { Link2, Settings2, ImageIcon, Calendar } from "lucide-react";
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

interface BookmarkHeroProps {
  showImages: boolean;
  setShowImages: (value: boolean) => void;
  showMonths: boolean;
  setShowMonths: (value: boolean) => void;
}

export function BookmarkHero({
  showImages,
  setShowImages,
  showMonths,
  setShowMonths,
}: BookmarkHeroProps) {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="mb-8 sm:mb-12">
      {/* Emoji icon like Notion */}
      <div className="mb-3 sm:mb-4">
        <span className="text-3xl sm:text-4xl">🔖</span>
      </div>

      {/* Title with layout settings dropdown */}
      <div className="flex items-center gap-2 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-[32px] font-bold text-[#ededed] tracking-tight">
          My Bookmarks
        </h1>

        <Tooltip>
          <TooltipTrigger asChild>
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
            className="bg-[#1a1a1a] border-[#262626] text-[#ededed] text-xs px-2 py-1"
          >
            Layout settings
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Input field like "who to bother" */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="paste a link to save"
          className="w-full bg-transparent border border-[#262626] rounded-md px-3 sm:px-4 py-2.5 sm:py-3 text-[14px] sm:text-[15px] text-[#ededed] placeholder:text-[#4a4a4a] focus:outline-none focus:border-[#404040] transition-colors"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Link2 className="w-4 h-4 text-[#4a4a4a]" />
        </div>
      </div>
    </div>
  );
}
