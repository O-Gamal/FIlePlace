"use client";

import React from "react";
import Files from "../_components/Files";

const FavoritesPage = () => {
  return (
    <main className="container pt-10 xxl:px-0">
      <Files title="My Favorites" favorites />
    </main>
  );
};

export default FavoritesPage;
