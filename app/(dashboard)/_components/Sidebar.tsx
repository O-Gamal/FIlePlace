"use client";

import { cn } from "@/lib/utils";
import { FileIcon, StarIcon, Trash } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const links = [
  {
    title: "All Files",
    href: "/",
    icon: {
      outlined: <FileIcon className="w-5 h-5" />,
      solid: <FileIcon className="w-5 h-5 fill-gray-600" />,
    },
  },
  {
    title: "Favorites",
    href: "/favorites",
    icon: {
      outlined: <StarIcon className="w-5 h-5" />,
      solid: <StarIcon className="w-5 h-5 fill-gray-600" />,
    },
  },
  {
    title: "Recently Deleted",
    href: "/deleted",
    icon: {
      outlined: <Trash className="w-5 h-5" />,
      solid: <Trash className="w-5 h-5 fill-gray-600" />,
    },
  },
];
const Sidebar = () => {
  const pathName = usePathname();

  return (
    <div className="w-[280px] h-screen fixed left-0 top-[72px] border-r border-gray-200">
      <ul className="flex flex-col gap-2 p-4">
        {links.map((link) => {
          const isActive = pathName === link.href;
          return (
            <li
              key={link.title}
              className={cn(
                "px-4 py-2 rounded-md cursor-pointer",
                { "bg-gray-100 ring-1 ring-gray-200": isActive },
                "transition-colors duration-200"
              )}
            >
              <Link
                href={link.href}
                className="flex items-center gap-3 text-gray-600 hover:text-gray-800"
              >
                {isActive ? link.icon.solid : link.icon.outlined}
                {link.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;
