import { Button } from "@/components/ui/button";
import {
  OrganizationSwitcher,
  SignInButton,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import React from "react";

const Header = () => {
  return (
    <div className="border-b py-4 bg-slate-50">
      <div className="container flex justify-between">
        <h3 className="font-medium">FilePlace</h3>
        <div className="flex items-center gap-4">
          <OrganizationSwitcher />
          <UserButton />
          <SignedOut>
            <SignInButton mode="modal">
              <Button>Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </div>
  );
};

export default Header;
