import { Doc } from "@/convex/_generated/dataModel";

export type FileTypes = Doc<"files">["type"];
const FileTypes: Record<string, FileTypes> = {
  // Images
  "image/png": "image",
  "image/jpeg": "image",
  "image/gif": "image",
  "image/webp": "image",
  "image/svg+xml": "image",
  // PDF
  "application/pdf": "pdf",
  // CSV
  "text/csv": "csv",
  "application/csv": "csv",
  "application/vnd.ms-excel": "csv",
};

export const getFileType = (contentType: string): FileTypes => {
  return FileTypes[contentType] || "other";
};
