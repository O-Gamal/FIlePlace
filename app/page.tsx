"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  useOrganization,
  useUser,
} from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";

export default function Home() {
  const { organization } = useOrganization();
  const { user } = useUser();

  const userId = user?.id;
  const orgId = organization?.id ?? userId;

  const createFile = useMutation(api.files.createFile);
  const files = useQuery(
    api.files.getFiles,
    orgId
      ? {
          orgId,
        }
      : "skip"
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {files?.map((file) => (
        <div key={file._id}>{file.name}</div>
      ))}

      <Button
        onClick={() => createFile({ name: "My File", orgId: orgId ?? "" })}
      >
        Create File
      </Button>
    </main>
  );
}
