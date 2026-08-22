"use client";

import { useQuery } from "@tanstack/react-query";
import { FolderPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BookmarkHero } from "@/components/bookmark-hero";
import { BookmarkList } from "@/components/bookmark-list";
import { CreateFolderDialog } from "@/components/create-folder-dialog";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import type { authClient } from "@/lib/auth-client";
import { useFolderStore, useFolderStoreHydrated } from "@/stores/folder-store";
import { useLayoutStore, useLayoutStoreHydrated } from "@/stores/layout-store";
import { orpc } from "@/utils/orpc";

export default function Bookmarks({
  session,
  initialSelectedFolderId,
}: {
  session: typeof authClient.$Infer.Session;
  initialSelectedFolderId: string | null;
}) {
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const { selectedFolderId, setSelectedFolderId } = useFolderStore();
  const folderSettings = useLayoutStore((state) => state.folderSettings);
  const setShowPreview = useLayoutStore((state) => state.setShowPreview);
  const setShowMonths = useLayoutStore((state) => state.setShowMonths);

  const folderHydrated = useFolderStoreHydrated();
  const layoutHydrated = useLayoutStoreHydrated();
  const storesHydrated = folderHydrated && layoutHydrated;
  const appliedInitialSelection = useRef(false);

  const { data: folders = [], isLoading: isFoldersLoading } = useQuery(
    orpc.folder.getAll.queryOptions(),
  );

  // Auto-select first folder if none selected or selected doesn't exist
  useEffect(() => {
    if (!storesHydrated) return;

    if (!appliedInitialSelection.current) {
      appliedInitialSelection.current = true;
      if (initialSelectedFolderId !== selectedFolderId) {
        setSelectedFolderId(initialSelectedFolderId);
        return;
      }
    }

    if (folders.length > 0) {
      const folderExists = folders.some((f) => f.id === selectedFolderId);
      if (!selectedFolderId || !folderExists) {
        setSelectedFolderId(folders[0].id);
      }
    }
  }, [
    folders,
    initialSelectedFolderId,
    selectedFolderId,
    setSelectedFolderId,
    storesHydrated,
  ]);

  const isLoading = isFoldersLoading || !storesHydrated;
  const isEmpty = !isLoading && folders.length === 0;

  const selectedFolder = selectedFolderId
    ? folders.find((f) => f.id === selectedFolderId)
    : (folders[0] ?? null);

  const currentFolderId = selectedFolder?.id ?? null;

  // Get settings directly from state to ensure reactivity
  const storedSettings = currentFolderId
    ? folderSettings[currentFolderId]
    : undefined;
  const currentSettings = {
    showPreview: storedSettings?.showPreview ?? true,
    showMonths: storedSettings?.showMonths ?? false,
  };

  const handleSetShowPreview = (value: boolean) => {
    if (currentFolderId) {
      setShowPreview(currentFolderId, value);
    }
  };

  const handleSetShowMonths = (value: boolean) => {
    if (currentFolderId) {
      setShowMonths(currentFolderId, value);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-black">
      <Header
        session={session}
        folders={folders}
        onCreateFolder={() => setIsCreateFolderOpen(true)}
      />

      {isEmpty ? (
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <section className="flex w-full max-w-md flex-col items-center rounded-lg border border-[#262626] bg-black px-6 py-10 text-center sm:px-10">
            <span className="flex size-8 items-center justify-center rounded-md bg-[#1a1a1a] text-[#a3a3a3]">
              <FolderPlus className="size-4" strokeWidth={1.5} />
            </span>
            <h1 className="mt-3 text-balance font-semibold text-sm text-[#ededed] leading-tight">
              No folders yet
            </h1>
            <p className="mt-2 max-w-xs text-pretty text-[13px] text-[#888] leading-5">
              You haven&apos;t created any folders yet. Get started by creating
              your first folder.
            </p>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsCreateFolderOpen(true)}
              className="mt-4 rounded-md bg-[#ededed] px-3 text-[13px] text-[#0a0a0a] hover:bg-[#d4d4d4]"
            >
              Create folder
            </Button>
          </section>
        </main>
      ) : (
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          <BookmarkHero
            showPreview={currentSettings.showPreview}
            setShowPreview={handleSetShowPreview}
            showMonths={currentSettings.showMonths}
            setShowMonths={handleSetShowMonths}
            selectedFolderId={currentFolderId}
            selectedFolderIcon={selectedFolder?.icon ?? null}
            selectedFolderName={selectedFolder?.name ?? null}
            isShared={selectedFolder?.isShared ?? false}
            isLoading={isLoading}
          />
          <BookmarkList
            showPreview={currentSettings.showPreview}
            showMonths={currentSettings.showMonths}
            selectedFolderId={currentFolderId}
            folders={folders}
          />
        </div>
      )}

      <CreateFolderDialog
        open={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
      />
    </div>
  );
}
