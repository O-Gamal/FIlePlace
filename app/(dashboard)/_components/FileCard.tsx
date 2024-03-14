import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Doc, Id } from "@/convex/_generated/dataModel";
import {
  ArchiveRestore,
  DownloadIcon,
  FileIcon,
  FileTextIcon,
  GanttChartIcon,
  ImageIcon,
  MoreVertical,
  StarIcon,
  TrashIcon,
} from "lucide-react";

import { ReactNode, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Protect } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelative, subDays } from "date-fns";

const FileCardMenu = ({
  file,
  isFavorite,
  isDeleted,
}: {
  file: Doc<"files">;
  isFavorite: boolean;
  isDeleted?: boolean;
}) => {
  const [isDeleteConfimationDialogOpen, setIsDeleteConfimationDialogOpen] =
    useState(false);

  const { toast } = useToast();
  const deleteFile = useMutation(api.files.toggleDeleteFile);
  const perminantlyDeleteFile = useMutation(api.files.perminantlyDeleteFile);

  const toggleFavorite = useMutation(api.files.toggleFavorite);

  return (
    <>
      <AlertDialog
        open={isDeleteConfimationDialogOpen}
        onOpenChange={setIsDeleteConfimationDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader className="mb-4">
            <AlertDialogTitle>
              {`Are you sure you want to delete ${file.name}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                perminantlyDeleteFile({
                  fileId: file._id,
                });
                toast({
                  title: file.name + " has been deleted successfully.",
                  variant: "destructive",
                  duration: 5000,
                });
              }}
            >
              Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreVertical className="w-5 h-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              toggleFavorite({
                fileId: file._id,
              });
            }}
          >
            <div className="flex items-center gap-2 text-gray-500">
              <StarIcon
                className={cn("w-4 h-4", {
                  "fill-gray-500 ": isFavorite,
                })}
              />
              <span className="">
                {isFavorite ? "Remove from favorites" : "Add to favorites"}
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              window.open(getFileUrl(file.fileId), "_blank");
            }}
          >
            <div className="flex items-center gap-2 text-gray-500">
              <DownloadIcon className={cn("w-4 h-4")} />
              <span className="">Download</span>
            </div>
          </DropdownMenuItem>
          {isDeleted && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  deleteFile({
                    fileId: file._id,
                  });
                }}
              >
                <div className="flex items-center gap-2 text-gray-500">
                  <ArchiveRestore className="w-4 h-4" />
                  <span>Restore file</span>
                </div>
              </DropdownMenuItem>
            </>
          )}
          <Protect role="org:admin" fallback={<></>}>
            <DropdownMenuItem
              onClick={() => {
                if (isDeleted) {
                  setIsDeleteConfimationDialogOpen(true);
                } else {
                  deleteFile({
                    fileId: file._id,
                  });
                  toast({
                    title: file.name + " has been moved to trash.",
                    variant: "destructive",
                    duration: 5000,
                  });
                }
              }}
            >
              <div className="flex items-center gap-2 text-red-500">
                <TrashIcon className="w-4 h-4" />
                <span>
                  {isDeleted ? "Permanently delete" : "Move to trash"}
                </span>
              </div>
            </DropdownMenuItem>
          </Protect>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

function getFileUrl(fileId: Id<"_storage">) {
  return process.env.NEXT_PUBLIC_CONVEX_URL + "/api/storage/" + fileId;
}

type FileCardProps = {
  file: Doc<"files">;
  isFavorite: boolean;
  isDeleted?: boolean;
};
const FileCard = ({ file, isFavorite, isDeleted }: FileCardProps) => {
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
              <FileCardMenu
                file={file}
                isFavorite={isFavorite}
                isDeleted={isDeleted}
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
