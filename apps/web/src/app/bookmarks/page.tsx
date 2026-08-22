import { appRouter } from "@memora/api/routers/index";
import { auth } from "@memora/auth";
import { createRouterClient } from "@orpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { orpc } from "@/utils/orpc-client";
import { getQueryClient } from "@/utils/query-client";

import Bookmarks from "./bookmarks";

export default async function BookmarksPage() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) {
    redirect("/");
  }

  const queryClient = getQueryClient();
  const serverClient = createRouterClient(appRouter, {
    context: { session },
  });
  const cookieStore = await cookies();
  const preferredFolderId = cookieStore.get("memora-selected-folder")?.value;
  const [folders, preferredFolderBookmarks] = await Promise.all([
    serverClient.folder.getAll(),
    preferredFolderId
      ? serverClient.bookmark.getByFolder({ folderId: preferredFolderId })
      : Promise.resolve(null),
  ]);
  const selectedFolder =
    folders.find((folder) => folder.id === preferredFolderId) ??
    folders[0] ??
    null;

  queryClient.setQueryData(orpc.folder.getAll.queryOptions().queryKey, folders);

  if (selectedFolder) {
    const bookmarks =
      selectedFolder.id === preferredFolderId && preferredFolderBookmarks
        ? preferredFolderBookmarks
        : await serverClient.bookmark.getByFolder({
            folderId: selectedFolder.id,
          });

    queryClient.setQueryData(
      orpc.bookmark.getByFolder.queryOptions({
        input: { folderId: selectedFolder.id },
      }).queryKey,
      bookmarks,
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Bookmarks
        session={session}
        initialSelectedFolderId={selectedFolder?.id ?? null}
      />
    </HydrationBoundary>
  );
}
