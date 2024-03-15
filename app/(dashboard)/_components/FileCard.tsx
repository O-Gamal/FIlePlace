import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Doc } from "@/convex/_generated/dataModel";
import {
  FileIcon,
  FileTextIcon,
  GanttChartIcon,
  ImageIcon,
} from "lucide-react";

import { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelative } from "date-fns";
import FileActionsMenu, { getFileUrl } from "./FileActionsMenu";

type FileCardProps = {
  file: Doc<"files"> & {
    isFavorite: boolean;
    isDeleted: boolean;
  };
};

const FileCard = ({ file }: FileCardProps) => {
  const typeIcons: Record<Doc<"files">["type"], ReactNode> = {
    image: <ImageIcon />,
    csv: <GanttChartIcon />,
    pdf: <FileTextIcon />,
    other: <FileIcon />,
  };

  const userProfile = useQuery(api.users.getUserProfile, {
    userId: file.userId,
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="relative flex gap-2 text-lg font-medium">
            {typeIcons[file.type]}
            {file.name}
            <div className="absolute -right-2 top-0">
              <FileActionsMenu
                file={file}
                isFavorite={file.isFavorite}
                isDeleted={file.isDeleted}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {file.type === "image" ? (
            <div className="relative h-40">
              <Image
                src={getFileUrl(file.fileId)}
                alt={file.name}
                sizes="100%"
                fill
                priority
                unoptimized={true}
                className="rounded-md object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 bg-gray-100 rounded-lg">
              {typeIcons[file.type]}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            <Avatar className="w-6 h-6">
              <AvatarImage src={userProfile?.image} alt="User" />
              <AvatarFallback>
                {userProfile?.name?.slice(0, 2)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-gray-500 text-sm">{userProfile?.name}</span>
          </div>
          <div className="text-sm text-gray-500">
            {formatRelative(new Date(file._creationTime), new Date())}
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default FileCard;
