import { internal } from "./_generated/api";
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payload = await request.text();
    const header = request.headers;

    try {
      const result = await ctx.runAction(internal.clerk.fulfill, {
        payload,
        Headers: {
          "svix-id": header.get("svix-id"),
          "svix-signature": header.get("svix-signature"),
          "svix-timestamp": header.get("svix-timestamp"),
        },
      });

      switch (result.type) {
        case "user.created":
          await ctx.runMutation(internal.users.createUser, {
            tokenIdentifier: `https://rare-humpback-48.clerk.accounts.dev|${result.data.id}`,
          });
          break;
        case "organizationMembership.created":
          await ctx.runMutation(internal.users.addOrgId, {
            tokenIdentifier: `https://rare-humpback-48.clerk.accounts.dev|${result.data.id}`,
            argId: result.data.organization.id,
          });
          break;
      }

      return new Response(null, {
        status: 200,
      });
    } catch (error) {
      console.error(error);
      return new Response("Webhook Error", {
        status: 400,
      });
    }
  }),
});

export default http;
