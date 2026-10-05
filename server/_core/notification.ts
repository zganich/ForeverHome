import { TRPCError } from "@trpc/server";

export type NotificationPayload = { title: string; content: string };

// Optional direct owner webhook. No notifications are sent unless configured.
export async function notifyOwner(
  payload: NotificationPayload
): Promise<boolean> {
  const title = payload.title.trim();
  const content = payload.content.trim();
  if (!title || !content || title.length > 1200 || content.length > 20000) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid notification title or content.",
    });
  }
  const endpoint = process.env.NOTIFICATION_WEBHOOK_URL;
  if (!endpoint) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Owner notification webhook is not configured.",
    });
  }
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.NOTIFICATION_WEBHOOK_TOKEN
          ? {
              authorization: `Bearer ${process.env.NOTIFICATION_WEBHOOK_TOKEN}`,
            }
          : {}),
      },
      body: JSON.stringify({ title, content }),
      signal: AbortSignal.timeout(10_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
