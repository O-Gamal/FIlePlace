"use client";

import { api } from "@/convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";

import UploadButton from "./uploadButton";
import FileCard from "./FileCard";

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

  return (
    <main className="container pt-10">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold">My Files</h1>
        <UploadButton />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {files?.map((file) => (
          <FileCard key={file._id} file={file} />
        ))}
      </div>
    </main>
  );
}
