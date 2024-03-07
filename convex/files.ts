import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";
import { getUserByToken } from "./users";

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
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError(
        "Unauthorized, you must be signed in to create a file."
      );
    }

    if (!args.orgId) {
      throw new ConvexError("Organization ID is required.");
    }

    const user = await getUserByToken(ctx, identity.tokenIdentifier);

    const hasAccess = await hasAccessToOrg(
      ctx,
      user.tokenIdentifier,
      args.orgId
    );

    if (!hasAccess) {
      await ctx.db.insert("files", {
        name: args.name,
        orgId: args.orgId,
      });
    }
  },
});

export const getFiles = query({
  args: {
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity || !args.orgId) {
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

    return await ctx.db
      .query("files")
      .withIndex("byOrgId", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});
