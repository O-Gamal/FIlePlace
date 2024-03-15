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
import { Doc, Id } from "@/convex/_generated/dataModel";
import { FileTypes } from "@/lib/fileTypes";
import { useState } from "react";
import FileTypeFilter from "./FileTypeFilter";
import FilesTable, { modifiedFile } from "./FilesTable";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelative } from "date-fns";
import FileActionsMenu from "./FileActionsMenu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Grid2X2Icon,
  Grid2x2,
  GridIcon,
  ListIcon,
  RowsIcon,
  TableIcon,
} from "lucide-react";

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

function UserCell(userId: Id<"users">) {
  const userProfile = useQuery(api.users.getUserProfile, {
    userId,
  });

  return (
    <div className="flex items-center gap-1.5">
      <Avatar className="w-6 h-6">
        <AvatarImage src={userProfile?.image} alt="User" />
        <AvatarFallback>
          {userProfile?.name?.slice(0, 2)?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="text-gray-500 text-sm">{userProfile?.name}</span>
    </div>
  );
}

const columns: ColumnDef<modifiedFile>[] = [
  {
    header: "File Name",
    accessorKey: "name",
  },
  {
    header: "Type",
    accessorKey: "type",
  },
  {
    header: "User",
    cell: ({ row }) => {
      return UserCell(row.original.userId);
    },
  },
  {
    header: "last modified",
    cell: ({ row }) => {
      return formatRelative(new Date(row.original._creationTime), new Date());
    },
  },
  {
    header: "Actions",
    cell: ({ row }) => {
      return (
        <FileActionsMenu
          file={row.original}
          isFavorite={row.original.isFavorite}
          isDeleted={row.original.isDeleted}
        />
      );
    },
  },
];

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

  const favoritesMap =
    favoriteFiles && files ? mapFavorites(files, favoriteFiles) : {};

  const trashMap =
    deletedFiles && files ? mapDeletedFiles(files, deletedFiles) : {};

  const isLoaded = files !== undefined;
  const isEmptyFiles =
    files && !searchQuery && filter === "all" && files.length === 0;
  const isEmptySearchResults = files && searchQuery && files.length === 0;
  const isEmptyFilterResults = files && filter !== "all" && files.length === 0;

  const modifiedFiles = files?.map((file) => ({
    ...file,
    isFavorite: favoritesMap[file._id],
    isDeleted: trashMap[file._id],
  }));

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

          <Tabs defaultValue="grid" className="w-full">
            <div className="flex items-center justify-between mb-10">
              <TabsList>
                <TabsTrigger value="grid">
                  <Grid2X2Icon className="w-5 h-5" />
                </TabsTrigger>
                <TabsTrigger value="table">
                  <RowsIcon className="w-5 h-5" />
                </TabsTrigger>
              </TabsList>
              <FileTypeFilter filter={filter} setFilter={setFilter} />
            </div>
            {isEmptySearchResults || isEmptyFilterResults ? (
              <div className="flex flex-col justify-center items-center gap-6 py-10">
                <EmptyState />
              </div>
            ) : isLoaded ? (
              <>
                <TabsContent value="grid">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modifiedFiles?.map((file) => (
                      <FileCard key={file._id} file={file} />
                    ))}
                  </div>{" "}
                </TabsContent>
                <TabsContent value="table">
                  {modifiedFiles && (
                    <FilesTable data={modifiedFiles} columns={columns} />
                  )}
                </TabsContent>
              </>
            ) : (
              <LoadingFiles />
            )}
          </Tabs>
        </>
      )}
    </>
  );
}
