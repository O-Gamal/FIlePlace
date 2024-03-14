"use client";

import { api } from "@/convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import EmptyState from "./EmptyState";
import SearchBar from "./SearchBar";
import UploadButton from "./UploadButton";
import FileCard from "./FileCard";
import LoadingFiles from "./LoadingFiles";
import { Doc } from "@/convex/_generated/dataModel";
import { FileTypes } from "@/lib/fileTypes";
import { useState } from "react";
import FileTypeFilter from "./FileTypeFilter";

export const mapFavorites = (
  files: Doc<"files">[],
  favorites: Doc<"favoriteFiles">[]
) => {
  return files.reduce(
    (acc, file) => ({
      ...acc,
      [file._id]: favorites.some((f) => f.fileId === file._id),
    }),
    {}
  ) as Record<string, boolean>;
};

export const mapDeletedFiles = (
  files: Doc<"files">[],
  deletedFiles: Doc<"deletedFiles">[]
) => {
  return files.reduce(
    (acc, file) => ({
      ...acc,
      [file._id]: deletedFiles.some((f) => f.fileId === file._id),
    }),
    {}
  ) as Record<string, boolean>;
};

export default function Files({
  title = "My Files",
  favorites = false,
  deleted = false,
}: {
  title: string;
  favorites?: boolean;
  deleted?: boolean;
}) {
  const [filter, setFilter] = useState<FileTypes | "all">("all");

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";

  const { organization } = useOrganization();
  const { user } = useUser();

  const userId = user?.id;
  const orgId = organization?.id ?? userId;

  const favoriteFiles = useQuery(
    api.files.getAllFavorites,
    orgId ? { orgId } : "skip"
  );

  const deletedFiles = useQuery(
    api.files.getDeletedFiles,
    orgId ? { orgId } : "skip"
  );

  const files = useQuery(
    api.files.getFiles,
    orgId
      ? {
          orgId,
          searchQuery,
          favorites,
          deleted,
          filter: filter === "all" ? undefined : filter,
        }
      : "skip"
  );

  console.log(files);

  const favoritesMap =
    favoriteFiles && files ? mapFavorites(files, favoriteFiles) : {};

  const trashMap =
    deletedFiles && files ? mapDeletedFiles(files, deletedFiles) : {};

  const isLoaded = files !== undefined;
  const isEmptyFiles =
    files && !searchQuery && filter === "all" && files.length === 0;
  const isEmptySearchResults = files && searchQuery && files.length === 0;
  const isEmptyFilterResults = files && filter !== "all" && files.length === 0;

  return (
    <>
      {isEmptyFiles ? (
        <EmptyState />
      ) : (
        <>
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl font-bold">{title}</h1>
            <SearchBar />
            <UploadButton />
          </div>
          <div className="flex items-center justify-between mb-10">
            <SearchBar />
            <FileTypeFilter filter={filter} setFilter={setFilter} />
          </div>

          {isEmptySearchResults || isEmptyFilterResults ? (
            <div className="flex flex-col justify-center items-center gap-6 py-16">
              <EmptyState />
            </div>
          ) : isLoaded ? (
            <>
              {/* <FilesTable files={files} favoritesMap={favoritesMap} /> */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {files?.map((file) => (
                  <FileCard
                    key={file._id}
                    file={file}
                    isFavorite={favoritesMap[file._id]}
                    isDeleted={trashMap[file._id]}
                  />
                ))}
              </div>
            </>
          ) : (
            <LoadingFiles />
          )}
        </>
      )}
    </>
  );
}
