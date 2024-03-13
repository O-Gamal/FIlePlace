"use client";

import React from "react";
import Files from "../_components/Files";
import { useOrganization, useUser } from "@clerk/nextjs";

const FavoritesPage = () => {
  return (
    <main className="container pt-10 px-0">
      <Files title="My Favorites" favorites />
    </main>
  );
};

export default FavoritesPage;
