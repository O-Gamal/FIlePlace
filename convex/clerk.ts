"use node";

import type { WebhookEvent } from "@clerk/nextjs/dist/types/server";
import { v } from "convex/values";
import { Webhook } from "svix";
import { internalAction } from "./_generated/server";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || "";

export const fulfill = internalAction({
  args: {
    Headers: v.any(),
    payload: v.string(),
  },
  handler: async (_, args) => {
    const webhook = new Webhook(webhookSecret);
    const payload = webhook.verify(args.payload, args.Headers) as WebhookEvent;
    return payload;
  },
});
