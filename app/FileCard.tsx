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

import { Doc } from "@/convex/_generated/dataModel";
import { MoreVertical, TrashIcon } from "lucide-react";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";

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
          <MoreVertical />
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

const FileCard = ({ file }: { file: Doc<"files"> }) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="relative">
            {file.name}
            <div className="absolute -right-2 top-0">
              <FileCardMenu file={file} />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <Button>Download</Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default FileCard;
