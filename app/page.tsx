"use client";

import { api } from "@/convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";

import UploadButton from "./UploadButton";
import FileCard from "./FileCard";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { organization } = useOrganization();
  const { user } = useUser();

  const userId = user?.id;
  const orgId = organization?.id ?? userId;

  const files = useQuery(
    api.files.getFiles,
    orgId
      ? {
          orgId,
        }
      : "skip"
  );

  const isLoaded = files !== undefined;

  if (!isLoaded) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 h-96">
        <Loader2 className="w-16 h-16 animate-spin text-gray-500" />
        <span className="text-lg text-gray-500">Loading files...</span>
      </div>
    );
  }

  return (
    <main className="container pt-10">
      {files && files.length === 0 ? (
        <div className="flex flex-col justify-center items-center gap-6 py-16">
          <div className="select-none pointer-events-none">
            <Image
              src="/empty.svg"
              alt="No files found"
              className="mb-4"
              width={300}
              height={300}
            />
            <span className="text-lg text-gray-500">
              You have no files, upload one now
            </span>
          </div>
          <UploadButton />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl font-bold">My Files</h1>
            <UploadButton />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {files?.map((file) => (
              <FileCard key={file._id} file={file} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
