"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookmarkHero } from "@/components/bookmark-hero";
import { BookmarkList } from "@/components/bookmark-list";
import { Header } from "@/components/header";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";
import { useFolderStore, useFolderStoreHydrated } from "@/stores/folder-store";
import { useLayoutStore, useLayoutStoreHydrated } from "@/stores/layout-store";

export default function Bookmarks({
  session,
}: {
  session: typeof authClient.$Infer.Session;
}) {
  const { selectedFolderId, setSelectedFolderId } = useFolderStore();
  const folderSettings = useLayoutStore((state) => state.folderSettings);
  const setShowImages = useLayoutStore((state) => state.setShowImages);
  const setShowMonths = useLayoutStore((state) => state.setShowMonths);

  const folderHydrated = useFolderStoreHydrated();
  const layoutHydrated = useLayoutStoreHydrated();
  const storesHydrated = folderHydrated && layoutHydrated;

  const { data: folders = [], isLoading: isFoldersLoading } = useQuery(
    orpc.folder.getAll.queryOptions(),
  );

  // Auto-select first folder if none selected or selected doesn't exist
  useEffect(() => {
    if (!storesHydrated) return;

    if (folders.length > 0) {
      const folderExists = folders.some((f) => f.id === selectedFolderId);
      if (!selectedFolderId || !folderExists) {
        setSelectedFolderId(folders[0].id);
      }
    }
  }, [folders, selectedFolderId, setSelectedFolderId, storesHydrated]);

  const isLoading = isFoldersLoading || !storesHydrated;

  const selectedFolder = selectedFolderId
    ? folders.find((f) => f.id === selectedFolderId)
    : (folders[0] ?? null);

  const currentFolderId = selectedFolder?.id ?? null;

  // Get settings directly from state to ensure reactivity
  const currentSettings = currentFolderId
    ? (folderSettings[currentFolderId] ?? {
        showImages: false,
        showMonths: false,
      })
    : { showImages: false, showMonths: false };

  const handleSetShowImages = (value: boolean) => {
    if (currentFolderId) {
      setShowImages(currentFolderId, value);
    }
  };

  const handleSetShowMonths = (value: boolean) => {
    if (currentFolderId) {
      setShowMonths(currentFolderId, value);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <BookmarkHero
          showImages={currentSettings.showImages}
          setShowImages={handleSetShowImages}
          showMonths={currentSettings.showMonths}
          setShowMonths={handleSetShowMonths}
          selectedFolderId={currentFolderId}
          selectedFolderIcon={selectedFolder?.icon ?? null}
          selectedFolderName={selectedFolder?.name ?? null}
          isLoading={isLoading}
        />
        <BookmarkList
          showImages={currentSettings.showImages}
          showMonths={currentSettings.showMonths}
          selectedFolderId={currentFolderId}
        />
      </div>
    </div>
  );
}
