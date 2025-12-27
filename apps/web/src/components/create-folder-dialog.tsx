"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerSearch,
} from "@/components/ui/emoji-picker";
import { orpc, queryClient } from "@/utils/orpc";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Folder = {
  id: string;
  name: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  allowDuplicate: boolean;
  isShared: boolean;
  _count: { bookmarks: number };
};

export function CreateFolderDialog({
  open,
  onOpenChange,
}: CreateFolderDialogProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📁");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const queryKey = orpc.folder.getAll.queryOptions().queryKey;

  const createFolder = useMutation(
    orpc.folder.create.mutationOptions({
      onMutate: async (newFolder) => {
        await queryClient.cancelQueries({ queryKey });

        const previousFolders = queryClient.getQueryData<Folder[]>(queryKey);

        queryClient.setQueryData<Folder[]>(queryKey, (old = []) => [
          {
            id: `temp-${Date.now()}`,
            name: newFolder.name,
            icon: newFolder.icon ?? "📁",
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: "",
            allowDuplicate: true,
            isShared: false,
            _count: { bookmarks: 0 },
          },
          ...old,
        ]);

        return { previousFolders };
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
        toast.success("Folder created");
        handleClose();
      },
      onError: (error, _, context) => {
        if (context?.previousFolders) {
          queryClient.setQueryData(queryKey, context.previousFolders);
        }
        toast.error(error.message || "Failed to create folder");
      },
    }),
  );

  const handleClose = () => {
    setName("");
    setIcon("📁");
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a folder name");
      return;
    }
    createFolder.mutate({ name: name.trim(), icon });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0a0a] border-[#262626] text-[#ededed] sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-[#ededed]">
            Create new folder
          </DialogTitle>
          <DialogDescription className="text-[#666]">
            Choose an emoji and name for your folder.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3">
            <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
              <PopoverTrigger>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-12 text-2xl bg-[#1a1a1a] border-[#262626] hover:bg-[#262626] hover:border-[#404040]"
                >
                  {icon}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-fit p-0 bg-[#0a0a0a] border-[#262626]"
                align="start"
              >
                <EmojiPicker
                  className="h-[320px] bg-[#0a0a0a]"
                  onEmojiSelect={({ emoji }) => {
                    setIcon(emoji);
                    setEmojiPickerOpen(false);
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

            <div className="flex-1 space-y-1.5">
              <Label htmlFor="name" className="text-[#999] text-xs">
                Folder name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My folder"
                className="bg-[#1a1a1a] border-[#262626] text-[#ededed] placeholder:text-[#4a4a4a] focus:border-[#404040]"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="text-[#666] hover:text-[#ededed] hover:bg-[#1a1a1a]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createFolder.isPending || !name.trim()}
              className="bg-[#ededed] text-[#0a0a0a] hover:bg-[#d4d4d4]"
            >
              {createFolder.isPending ? "Creating..." : "Create folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
