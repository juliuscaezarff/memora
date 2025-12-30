import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FolderState {
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
}

export const useFolderStore = create<FolderState>()(
  persist(
    (set) => ({
      selectedFolderId: null,
      setSelectedFolderId: (id) => set({ selectedFolderId: id }),
    }),
    {
      name: "memora-folder",
    }
  )
);
