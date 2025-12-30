import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";

interface FolderState {
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useFolderStore = create<FolderState>()(
  persist(
    (set) => ({
      selectedFolderId: null,
      setSelectedFolderId: (id) => set({ selectedFolderId: id }),
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
