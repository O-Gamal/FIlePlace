import {
  AlertDialogContent,
  AlertDialog,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Protect } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import {
  ArchiveRestore,
  DownloadIcon,
  MoreVertical,
  StarIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";

export function getFileUrl(fileId: Id<"_storage">) {
  return process.env.NEXT_PUBLIC_CONVEX_URL + "/api/storage/" + fileId;
}

const FileActionsMenu = ({
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
  const me = useQuery(api.users.getMe);

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
          <Protect
            condition={(check) => {
              return (
                check({
                  role: "org:admin",
                }) || file.userId === me?._id
              );
            }}
            fallback={<></>}
          >
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

export default FileActionsMenu;
