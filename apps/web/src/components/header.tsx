"use client";

import { ChevronDown, Plus, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { orpc, queryClient } from "@/utils/orpc";
import { useFolderStore } from "@/stores/folder-store";
import { cn } from "@/lib/utils";

type HeaderFolder = {
  id: string;
  name: string;
  icon: string;
  _count: { bookmarks: number };
};

export function Header({
  session,
  folders,
  onCreateFolder,
}: {
  session: typeof authClient.$Infer.Session;
  folders: HeaderFolder[];
  onCreateFolder: () => void;
}) {
  const router = useRouter();
  const { selectedFolderId, setSelectedFolderId } = useFolderStore();

  const currentFolder = selectedFolderId
    ? folders.find((f) => f.id === selectedFolderId)
    : (folders[0] ?? null);

  return (
    <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-sm">
      <div
        className={cn(
          "flex h-12 w-full items-center px-4 sm:h-14 sm:px-6",
          folders.length > 0 ? "justify-between" : "justify-end",
        )}
      >
          {/* Folders Dropdown - Left */}
          {folders.length > 0 && (
            <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md text-[13px] text-[#ededed] outline-none transition-colors hover:text-white sm:gap-2 sm:text-sm">
              {currentFolder ? (
                <>
                  <span className="text-base">{currentFolder.icon}</span>
                  <span className="max-w-[120px] sm:max-w-none truncate">
                    {currentFolder.name}
                  </span>
                </>
              ) : (
                <span className="text-[#666]">No folders yet</span>
              )}
              <ChevronDown className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#666]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-52 sm:w-56 bg-[#0a0a0a] border-[#262626] text-[#ededed]"
            >
              <>
                  {folders.map((folder) => (
                    <DropdownMenuItem
                      key={folder.id}
                      className="flex items-center justify-between cursor-pointer mb-1 focus:bg-[#1a1a1a] focus:text-white"
                      onClick={() => setSelectedFolderId(folder.id)}
                      onMouseEnter={() => {
                        queryClient.prefetchQuery(
                          orpc.bookmark.getByFolder.queryOptions({
                            input: { folderId: folder.id },
                          }),
                        );
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{folder.icon}</span>
                        <span className="text-[13px] sm:text-sm">
                          {folder.name}
                        </span>
                      </div>
                      <span className="text-xs text-[#666]">
                        {folder._count.bookmarks}
                      </span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-[#262626]" />
                  <DropdownMenuItem
                    className="flex items-center gap-2 mt-1 cursor-pointer text-[#666] focus:bg-[#1a1a1a] focus:text-white"
                    onClick={onCreateFolder}
                  >
                    <Plus className="w-4 h-4" />
                    <span>New folder</span>
                  </DropdownMenuItem>
              </>
            </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Avatar Dropdown - Right */}
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <Avatar className="h-7 w-7 cursor-pointer border border-[#262626] transition-colors hover:border-[#404040] sm:h-8 sm:w-8">
                <AvatarImage src={session.user.image ?? undefined} />
                <AvatarFallback className="bg-[#1a1a1a] text-[#ededed] text-xs">
                  {session.user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) ?? "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 sm:w-48 bg-[#0a0a0a] border-[#262626] text-[#ededed]"
            >
              <Link href="/settings">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-[#1a1a1a] focus:text-white">
                  <Settings className="w-4 h-4 text-[#666]" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator className="bg-[#262626] mt-1 mb-1" />
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-[#888] focus:bg-[#1a1a1a] focus:text-white"
                variant="destructive"
                onClick={() => {
                  authClient.signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        router.push("/");
                      },
                    },
                  });
                }}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
    </header>
  );
}
