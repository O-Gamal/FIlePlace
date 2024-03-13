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

export default function Files({
  title = "My Files",
  favorites = false,
}: {
  title: string;
  favorites?: boolean;
}) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";

  const { organization } = useOrganization();
  const { user } = useUser();

  const userId = user?.id;
  const orgId = organization?.id ?? userId;

  const files = useQuery(
    api.files.getFiles,
    orgId
      ? {
          orgId,
          searchQuery,
          favorites,
        }
      : "skip"
  );

  const isLoaded = files !== undefined;
  const isEmptyFiles = files && !searchQuery && files.length === 0;
  const isEmptySearchResults = files && searchQuery && files.length === 0;

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

          {isEmptySearchResults ? (
            <div className="flex flex-col justify-center items-center gap-6 py-16">
              <EmptyState />
            </div>
          ) : isLoaded ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {files?.map((file) => (
                <FileCard key={file._id} file={file} />
              ))}
            </div>
          ) : (
            <LoadingFiles />
          )}
        </>
      )}
    </>
  );
}
