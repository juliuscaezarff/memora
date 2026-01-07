"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Plus, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateFolderDialog } from "@/components/create-folder-dialog";
import Link from "next/link";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";
import { useFolderStore } from "@/stores/folder-store";

export function Header() {
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { selectedFolderId, setSelectedFolderId } = useFolderStore();

  const { data: folders = [] } = useQuery(orpc.folder.getAll.queryOptions());

  if (!session) {
    return (
      <Link href="/">
        <Button variant="outline">Sign In</Button>
      </Link>
    );
  }

  const currentFolder = selectedFolderId
    ? folders.find((f) => f.id === selectedFolderId)
    : (folders[0] ?? null);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-sm">
        <div className="w-full px-4 sm:px-6 h-12 sm:h-14 flex items-center justify-between">
          {/* Folders Dropdown - Left */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 sm:gap-2 text-[13px] sm:text-sm text-[#ededed] hover:text-white transition-colors outline-none">
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
              {folders.length === 0 ? (
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer focus:bg-[#1a1a1a] focus:text-white"
                  onClick={() => setIsCreateFolderOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span>Create your first folder</span>
                </DropdownMenuItem>
              ) : (
                <>
                  {folders.map((folder) => (
                    <DropdownMenuItem
                      key={folder.id}
                      className="flex items-center justify-between cursor-pointer mb-1 focus:bg-[#1a1a1a] focus:text-white"
                      onClick={() => setSelectedFolderId(folder.id)}
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
                    onClick={() => setIsCreateFolderOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    <span>New folder</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Avatar Dropdown - Right */}
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <Avatar className="w-7 h-7 sm:w-8 sm:h-8 border border-[#262626] hover:border-[#404040] transition-colors cursor-pointer">
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

      <CreateFolderDialog
        open={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
      />
    </>
  );
}
