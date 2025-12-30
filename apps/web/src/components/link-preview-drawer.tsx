"use client";

import { useState } from "react";
import { ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LinkPreviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
}

export function LinkPreviewDrawer({
  open,
  onOpenChange,
  url,
  title,
}: LinkPreviewDrawerProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleOpenExternal = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={`${isFullScreen ? "h-[97vh] max-h-[97vh]" : "h-[50vh] sm:h-[70vh] max-h-[70vh]"} transition-all duration-300`}
      >
        <div className="flex items-center justify-between border-b border-[#1a1a1a] py-2 px-4">
          <DrawerTitle className="text-sm font-medium text-[#ededed] truncate">
            {title}
          </DrawerTitle>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#666] hover:text-[#ededed] hover:bg-[#1a1a1a]"
                  onClick={handleOpenExternal}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Open in new tab</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#666] hover:text-[#ededed] hover:bg-[#1a1a1a]"
                  onClick={() => setIsFullScreen(!isFullScreen)}
                >
                  {isFullScreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isFullScreen ? "Half screen" : "Full screen"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <iframe
            src={url}
            title={title}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
