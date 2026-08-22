"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { BookmarkHero } from "@/components/bookmark-hero";
import { BookmarkList } from "@/components/bookmark-list";
import { Header } from "@/components/header";
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
    <div className="min-h-screen bg-black">
      <Header session={session} />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
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
    </div>
  );
}
