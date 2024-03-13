import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const FileType = v.union(
  v.literal("image"),
  v.literal("csv"),
  v.literal("pdf"),
  v.literal("other")
);
export default defineSchema({
  files: defineTable({
    name: v.string(),
    type: FileType,
    orgId: v.string(),
    fileId: v.id("_storage"),
  }).index("byOrgId", ["orgId"]),

  favoriteFiles: defineTable({
    fileId: v.id("files"),
    userId: v.id("users"),
    orgId: v.string(),
  }).index("byUserId_byOrgId_byFileId", ["userId", "orgId", "fileId"]),

  users: defineTable({
    tokenIdentifier: v.string(),
    orgIds: v.array(v.string()),
  }).index("byTokenIdentifier", ["tokenIdentifier"]),
});
