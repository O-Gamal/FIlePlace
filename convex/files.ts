import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";
import { getUserByToken } from "./users";
import { FileType } from "./schema";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError(
      "Unauthorized, you must be signed in to upload a file."
    );
  }

  return await ctx.storage.generateUploadUrl();
});

async function hasAccessToOrg(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string,
  orgId: string
) {
  const user = await getUserByToken(ctx, tokenIdentifier);

  const isOrgMember = user.orgIds.includes(orgId);
  const isPersonalOrg = user.tokenIdentifier.includes(orgId);

  return isOrgMember || isPersonalOrg;
}

export const createFile = mutation({
  args: {
    name: v.string(),
    type: FileType,
    fileId: v.id("_storage"),
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError(
        "Unauthorized, you must be signed in to create a file."
      );
    }

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      args.orgId
    );

    if (!hasAccess) {
      throw new ConvexError(
        "Unauthorized, you do not have access to this org."
      );
    }

    await ctx.db.insert("files", {
      name: args.name,
      type: args.type,
      orgId: args.orgId,
      fileId: args.fileId,
    });
  },
});

export const getFiles = query({
  args: {
    orgId: v.string(),
    searchQuery: v.optional(v.string()),
    favorites: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      args.orgId
    );

    if (!hasAccess) {
      return [];
    }

    let files = await ctx.db
      .query("files")
      .withIndex("byOrgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    const query = args.searchQuery;
    const favortes = args.favorites;

    if (query) {
      files = files.filter((file) =>
        file.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (favortes) {
      const user = await getUserByToken(ctx, identity.tokenIdentifier);
      const favorites = await ctx.db
        .query("favoriteFiles")
        .withIndex("byUserId_byOrgId_byFileId", (q) =>
          q.eq("userId", user._id).eq("orgId", args.orgId)
        )
        .collect();

      files = files.filter((file) =>
        favorites.some((f) => f.fileId === file._id)
      );
    }

    return files;
  },
});

export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError(
        "Unauthorized, you must be signed in to delete a file."
      );
    }

    const file = await ctx.db.get(args.fileId);

    if (!file) {
      throw new ConvexError("File not found.");
    }

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      file.orgId
    );

    if (!hasAccess) {
      throw new ConvexError(
        "Unauthorized, you do not have access to this org."
      );
    }

    await ctx.db.delete(args.fileId);
  },
});

export const toggleFavorite = mutation({
  args: {
    fileId: v.id("files"),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Unauthorized, you must be signed in.");
    }

    const file = await ctx.db.get(args.fileId);

    if (!file) {
      throw new ConvexError("File not found.");
    }

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      file.orgId
    );

    if (!hasAccess) {
      throw new ConvexError(
        "Unauthorized, you do not have access to this org."
      );
    }

    const user = await getUserByToken(ctx, identity.tokenIdentifier);

    const favorite = await ctx.db
      .query("favoriteFiles")
      .withIndex("byUserId_byOrgId_byFileId", (q) =>
        q.eq("userId", user._id).eq("orgId", file.orgId).eq("fileId", file._id)
      )
      .first();

    if (!favorite) {
      await ctx.db.insert("favoriteFiles", {
        fileId: file._id,
        userId: user._id,
        orgId: file.orgId,
      });
    } else {
      await ctx.db.delete(favorite._id);
    }
  },
});
