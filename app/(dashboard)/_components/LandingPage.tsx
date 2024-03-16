import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import Image from "next/image";
import { useState } from "react";

const navigation = [
  { name: "Product", href: "#" },
  { name: "Features", href: "#" },
  { name: "Marketplace", href: "#" },
  { name: "Company", href: "#" },
];

export default function LandingPage() {
  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-4 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Your Files in One Place
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              FilePlace is a modern file storage solution that allows you to
              store, share, and access your files from anywhere.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <SignInButton mode="modal">
                <Button>Get Started</Button>
              </SignInButton>
              <Button variant="outline">Learn More</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
