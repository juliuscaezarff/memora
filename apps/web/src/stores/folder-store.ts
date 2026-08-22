import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";

interface FolderState {
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

const SELECTED_FOLDER_COOKIE = "memora-selected-folder";

function persistSelectedFolder(id: string | null) {
  if (typeof document === "undefined") return;

  if (!id) {
    document.cookie = `${SELECTED_FOLDER_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
    return;
  }

  document.cookie = `${SELECTED_FOLDER_COOKIE}=${encodeURIComponent(id)}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export const useFolderStore = create<FolderState>()(
  persist(
    (set) => ({
      selectedFolderId: null,
      setSelectedFolderId: (id) => {
        persistSelectedFolder(id);
        set({ selectedFolderId: id });
      },
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "memora-folder",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export const useFolderStoreHydrated = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsubFinishHydration = useFolderStore.persist.onFinishHydration(
      () => {
        setHydrated(true);
      },
    );

    if (useFolderStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return () => {
      unsubFinishHydration();
    };
  }, []);

  return hydrated;
};
