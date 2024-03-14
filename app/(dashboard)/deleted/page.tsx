"use client";

import React from "react";
import Files from "../_components/Files";

const FavoritesPage = () => {
  return (
    <main className="container pt-10 xxl:px-0">
      <Files title="Recently Deleted Files" deleted />
    </main>
  );
};

export default FavoritesPage;
