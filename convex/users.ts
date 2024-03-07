import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, internalMutation } from "./_generated/server";

export async function getUserByToken(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string
) {
  const user = await ctx.db
    .query("users")
    .withIndex("byTokenIdentifier", (q) =>
      q.eq("tokenIdentifier", tokenIdentifier)
    )
    .first();

  if (!user) {
    throw new ConvexError("User not found");
  }

  return user;
}

export const createUser = internalMutation({
  args: {
    tokenIdentifier: v.string(),
  },
  async handler(ctx, args) {
    return await ctx.db.insert("users", {
      tokenIdentifier: args.tokenIdentifier,
      orgIds: [],
    });
  },
});

export const addOrgId = internalMutation({
  args: {
    argId: v.string(),
    tokenIdentifier: v.string(),
  },
  async handler(ctx, args) {
    const user = await getUserByToken(ctx, args.tokenIdentifier);

    await ctx.db.patch(user._id, {
      orgIds: [...user.orgIds, args.argId],
    });
  },
});
