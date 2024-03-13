"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ConvexProvider client={convex}>{children}</ConvexProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
