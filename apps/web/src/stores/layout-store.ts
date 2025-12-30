import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FolderLayoutSettings {
  showImages: boolean;
  showMonths: boolean;
}

interface LayoutState {
  // Settings per folder (keyed by folderId)
  folderSettings: Record<string, FolderLayoutSettings>;
  getSettings: (folderId: string) => FolderLayoutSettings;
  setShowImages: (folderId: string, value: boolean) => void;
  setShowMonths: (folderId: string, value: boolean) => void;
}

const defaultSettings: FolderLayoutSettings = {
  showImages: false,
  showMonths: false,
};

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      folderSettings: {},
      getSettings: (folderId) => {
        return get().folderSettings[folderId] ?? defaultSettings;
      },
      setShowImages: (folderId, value) =>
        set((state) => ({
          folderSettings: {
            ...state.folderSettings,
            [folderId]: {
              ...defaultSettings,
              ...state.folderSettings[folderId],
              showImages: value,
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
    }
  )
);
