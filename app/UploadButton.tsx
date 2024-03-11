"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1).max(200),
  file: z
    .custom<FileList>(
      (value) => value instanceof FileList,
      "Please select a file"
    )
    .refine((files) => files.length > 0, "Please select a file"),
});

type FormValues = z.infer<typeof formSchema>;

export default function UploadButton() {
  const [isFileUploadDialogOpen, setIsFileUploadDialogOpen] = useState(false);

  const { organization } = useOrganization();
  const { user } = useUser();

  const userId = user?.id;
  const orgId = organization?.id ?? userId;

  const createFile = useMutation(api.files.createFile);
  const uploadUrl = useMutation(api.files.generateUploadUrl);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  });

  const fileRef = form.register("file");

  async function onSubmit(values: FormValues) {
    if (!orgId) {
      return;
    }

    const postUrl = await uploadUrl();

    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": values.file[0].type },
      body: values.file[0],
    });

    const { storageId } = await result.json();

    createFile({ name: values.title, fileId: storageId, orgId: orgId });

    form.reset();
    setIsFileUploadDialogOpen(false);
  }

  return (
    <Dialog
      open={isFileUploadDialogOpen}
      onOpenChange={(isOpen) => {
        setIsFileUploadDialogOpen(isOpen);
        form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>Upload File</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload your file here</DialogTitle>
          <DialogDescription className="pt-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>File TItle</FormLabel>
                      <FormControl>
                        <Input placeholder="My Awesome File" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="file"
                  render={() => (
                    <FormItem>
                      <FormLabel>File</FormLabel>
                      <FormControl>
                        <Input type="file" {...fileRef} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={24} />
                      Uploading
                    </div>
                  ) : (
                    "Upload"
                  )}
                </Button>
              </form>
            </Form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
