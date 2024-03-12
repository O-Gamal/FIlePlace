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
  FileIcon,
  FileTextIcon,
  GanttChartIcon,
  ImageIcon,
  MoreVertical,
  TrashIcon,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

const FileCardMenu = ({ file }: { file: Doc<"files"> }) => {
  const [isDeleteConfimationDialogOpen, setIsDeleteConfimationDialogOpen] =
    useState(false);

  const { toast } = useToast();
  const deleteFile = useMutation(api.files.deleteFile);

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
                deleteFile({
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
              setIsDeleteConfimationDialogOpen(true);
            }}
          >
            <div className="flex items-center gap-2 text-red-500">
              <TrashIcon className="w-4 h-4" />
              <span>Delete</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

function getFileUrl(fileId: Id<"_storage">) {
  return process.env.NEXT_PUBLIC_CONVEX_URL + "/api/storage/" + fileId;
}

const FileCard = ({ file }: { file: Doc<"files"> }) => {
  const typeIcons: Record<Doc<"files">["type"], ReactNode> = {
    image: <ImageIcon />,
    csv: <GanttChartIcon />,
    pdf: <FileTextIcon />,
    other: <FileIcon />,
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="relative flex gap-2">
            {typeIcons[file.type]}
            {file.name}
            <div className="absolute -right-2 top-0">
              <FileCardMenu file={file} />
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
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              window.open(getFileUrl(file.fileId), "_blank");
            }}
          >
            Download
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default FileCard;
