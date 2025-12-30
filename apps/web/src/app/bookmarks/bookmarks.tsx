"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookmarkHero } from "@/components/bookmark-hero";
import { BookmarkList } from "@/components/bookmark-list";
import { Header } from "@/components/header";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";
import { useFolderStore } from "@/stores/folder-store";
import { useLayoutStore } from "@/stores/layout-store";

export default function Bookmarks({
  session,
}: {
  session: typeof authClient.$Infer.Session;
}) {
  const { selectedFolderId, setSelectedFolderId } = useFolderStore();
  const { getSettings, setShowImages, setShowMonths } = useLayoutStore();

  const { data: folders = [], isLoading } = useQuery(
    orpc.folder.getAll.queryOptions(),
  );

  // Auto-select first folder if none selected or selected doesn't exist
  useEffect(() => {
    if (folders.length > 0) {
      const folderExists = folders.some((f) => f.id === selectedFolderId);
      if (!selectedFolderId || !folderExists) {
        setSelectedFolderId(folders[0].id);
      }
    }
  }, [folders, selectedFolderId, setSelectedFolderId]);

  const selectedFolder = selectedFolderId
    ? folders.find((f) => f.id === selectedFolderId)
    : (folders[0] ?? null);

  const currentFolderId = selectedFolder?.id ?? null;
  const settings = currentFolderId
    ? getSettings(currentFolderId)
    : { showImages: false, showMonths: false };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <BookmarkHero
          showImages={settings.showImages}
          setShowImages={(value) =>
            currentFolderId && setShowImages(currentFolderId, value)
          }
          showMonths={settings.showMonths}
          setShowMonths={(value) =>
            currentFolderId && setShowMonths(currentFolderId, value)
          }
          selectedFolderId={currentFolderId}
          selectedFolderIcon={selectedFolder?.icon ?? null}
          selectedFolderName={selectedFolder?.name ?? null}
          isLoading={isLoading}
        />
        <BookmarkList
          showImages={settings.showImages}
          showMonths={settings.showMonths}
          selectedFolderId={currentFolderId}
        />
      </div>
    </div>
  );
}
