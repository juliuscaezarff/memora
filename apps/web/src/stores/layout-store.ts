import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FolderLayoutSettings {
  showPreview: boolean;
  showMonths: boolean;
}

interface LayoutState {
  folderSettings: Record<string, FolderLayoutSettings>;
  getSettings: (folderId: string) => FolderLayoutSettings;
  setShowPreview: (folderId: string, value: boolean) => void;
  setShowMonths: (folderId: string, value: boolean) => void;
}

const defaultSettings: FolderLayoutSettings = {
  showPreview: true,
  showMonths: false,
};

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      folderSettings: {},
      getSettings: (folderId) => {
        return {
          ...defaultSettings,
          ...get().folderSettings[folderId],
        };
      },
      setShowPreview: (folderId, value) =>
        set((state) => ({
          folderSettings: {
            ...state.folderSettings,
            [folderId]: {
              ...defaultSettings,
              ...state.folderSettings[folderId],
              showPreview: value,
            },
          },
        })),
      setShowMonths: (folderId, value) =>
        set((state) => ({
          folderSettings: {
            ...state.folderSettings,
            [folderId]: {
              ...defaultSettings,
              ...state.folderSettings[folderId],
              showMonths: value,
            },
          },
        })),
    }),
    {
      name: "memora-layout",
    },
  ),
);

export const useLayoutStoreHydrated = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsubFinishHydration = useLayoutStore.persist.onFinishHydration(
      () => {
        setHydrated(true);
      },
    );

    if (useLayoutStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return () => {
      unsubFinishHydration();
    };
  }, []);

  return hydrated;
};
