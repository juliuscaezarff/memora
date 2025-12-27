"use client";

import { useState } from "react";
import {
  ChevronDown,
  Folder,
  Plus,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { CreateFolderModal } from "@/components/create-folder-modal"
import Link from "next/link";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const folders = [
  { id: 1, name: "All Bookmarks", count: 24 },
  { id: 2, name: "Design Inspiration", count: 8 },
  { id: 3, name: "Dev Resources", count: 12 },
  { id: 4, name: "Read Later", count: 4 },
];

export function Header() {
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (!session) {
    return (
      <Link href="/">
        <Button variant="outline">Sign In</Button>
      </Link>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-sm">
        <div className="w-full px-4 sm:px-6 h-12 sm:h-14 flex items-center justify-between">
          {/* Folders Dropdown - Left */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 sm:gap-2 text-[13px] sm:text-sm text-[#ededed] hover:text-white transition-colors outline-none">
              <Folder className="w-4 h-4 text-[#666]" />
              <span className="max-w-[120px] sm:max-w-none truncate">
                All Bookmarks
              </span>
              <ChevronDown className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#666]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-52 sm:w-56 bg-[#0a0a0a] border-[#262626] text-[#ededed]"
            >
              {folders.map((folder) => (
                <DropdownMenuItem
                  key={folder.id}
                  className="flex items-center justify-between cursor-pointer focus:bg-[#1a1a1a] focus:text-white"
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-[#666]" />
                    <span className="text-[13px] sm:text-sm">
                      {folder.name}
                    </span>
                  </div>
                  <span className="text-xs text-[#666]">{folder.count}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-[#262626]" />
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-[#666] focus:bg-[#1a1a1a] focus:text-white"
                onSelect={() => setIsCreateFolderOpen(true)}
              >
                <Plus className="w-4 h-4" />
                <span>New folder</span>
              </DropdownMenuItem>
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
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-[#1a1a1a] focus:text-white">
                <User className="w-4 h-4 text-[#666]" />
                <span>Profile</span>
              </DropdownMenuItem>
              <Link href="/">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-[#1a1a1a] focus:text-white">
                  <Settings className="w-4 h-4 text-[#666]" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator className="bg-[#262626]" />
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

      {/*<CreateFolderModal open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen} />*/}
    </>
  );
}
