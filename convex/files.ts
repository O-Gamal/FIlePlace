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

async function hasAccessToOrg(ctx: QueryCtx | MutationCtx, orgId: string) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError(
      "Unauthorized, you must be signed in to create a file."
    );
  }

  const user = await getUserByToken(ctx, identity.tokenIdentifier);

  const isOrgMember = user.orgIds.includes(orgId);
  const isPersonalOrg = user.tokenIdentifier.includes(orgId);

  return {
    hasAccess: isOrgMember || isPersonalOrg,
    user,
    tokenIdentifier: identity.tokenIdentifier,
  };
}

export const createFile = mutation({
  args: {
    name: v.string(),
    type: FileType,
    fileId: v.id("_storage"),
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const { hasAccess, user } = await hasAccessToOrg(ctx, args.orgId);

    if (!hasAccess) {
      throw new ConvexError(
        "Unauthorized, you do not have access to this org."
      );
    }

    await ctx.db.insert("files", {
      name: args.name,
      type: args.type,
      orgId: args.orgId,
      userId: user._id,
      fileId: args.fileId,
    });
  },
});

export const getFiles = query({
  args: {
    orgId: v.string(),
    searchQuery: v.optional(v.string()),
    favorites: v.optional(v.boolean()),
    deleted: v.optional(v.boolean()),
    filter: v.optional(FileType),
  },

  async handler(ctx, args) {
    const { hasAccess, tokenIdentifier } = await hasAccessToOrg(
      ctx,
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
    const deleted = args.deleted;
    const filter = args.filter;

    if (query) {
      files = files.filter((file) =>
        file.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    const user = await getUserByToken(ctx, tokenIdentifier);

    const deletedFiles = await ctx.db
      .query("deletedFiles")
      .withIndex("byUserId_byOrgId_byFileId", (q) =>
        q.eq("userId", user._id).eq("orgId", args.orgId)
      )
      .collect();

    if (deleted) {
      files = files.filter((file) =>
        deletedFiles.some((f) => f.fileId === file._id)
      );
    } else {
      if (favortes) {
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

      files = files.filter(
        (file) => !deletedFiles.some((f) => f.fileId === file._id)
      );
    }

    if (filter) {
      files = files.filter((file) => file.type === filter);
    }

    return files;
  },
});

export const toggleDeleteFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  async handler(ctx, args) {
    const file = await ctx.db.get(args.fileId);

    if (!file) {
      throw new ConvexError("File not found.");
    }

    const { hasAccess, tokenIdentifier } = await hasAccessToOrg(
      ctx,
      file.orgId
    );

    if (!hasAccess) {
      throw new ConvexError(
        "Unauthorized, you do not have access to this org."
      );
    }

    const user = await getUserByToken(ctx, tokenIdentifier);

    const deletedFile = await ctx.db
      .query("deletedFiles")
      .withIndex("byUserId_byOrgId_byFileId", (q) =>
        q.eq("userId", user._id).eq("orgId", file.orgId).eq("fileId", file._id)
      )
      .first();

    if (!deletedFile) {
      await ctx.db.insert("deletedFiles", {
        fileId: file._id,
        userId: user._id,
        orgId: file.orgId,
      });
    } else {
      await ctx.db.delete(deletedFile._id);
    }
  },
});

export const perminantlyDeleteFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  async handler(ctx, args) {
    const file = await ctx.db.get(args.fileId);

    if (!file) {
      throw new ConvexError("File not found.");
    }

    const { hasAccess } = await hasAccessToOrg(ctx, file.orgId);

    if (!hasAccess) {
      throw new ConvexError(
        "Unauthorized, you do not have access to this org."
      );
    }

    await ctx.storage.delete(file.fileId);
    await ctx.db.delete(args.fileId);
  },
});

export const toggleFavorite = mutation({
  args: {
    fileId: v.id("files"),
  },
  async handler(ctx, args) {
    const file = await ctx.db.get(args.fileId);

    if (!file) {
      throw new ConvexError("File not found.");
    }

    const { hasAccess, tokenIdentifier } = await hasAccessToOrg(
      ctx,
      file.orgId
    );

    if (!hasAccess) {
      throw new ConvexError(
        "Unauthorized, you do not have access to this org."
      );
    }

    const user = await getUserByToken(ctx, tokenIdentifier);

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

export const getAllFavorites = query({
  args: {
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const { hasAccess, user } = await hasAccessToOrg(ctx, args.orgId);

    if (!hasAccess) {
      return [];
    }

    const favorites = await ctx.db
      .query("favoriteFiles")
      .withIndex("byUserId_byOrgId_byFileId", (q) =>
        q.eq("userId", user._id).eq("orgId", args.orgId)
      )
      .collect();

    return favorites;
  },
});

export const getDeletedFiles = query({
  args: {
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const { hasAccess, user } = await hasAccessToOrg(ctx, args.orgId);

    if (!hasAccess) {
      return [];
    }

    const deletedFiles = await ctx.db
      .query("deletedFiles")
      .withIndex("byUserId_byOrgId_byFileId", (q) =>
        q.eq("userId", user._id).eq("orgId", args.orgId)
      )
      .collect();

    return deletedFiles;
  },
});
