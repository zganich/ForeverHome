import { TRPCError } from "@trpc/server";

export function billingAvailability() {
  const available = Boolean(
    process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") &&
      process.env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_")
  );
  return {
    available,
    message: available
      ? null
      : "Payments are currently unavailable. You can still use your existing credits.",
  };
}
export function requireBillingAvailable() {
  if (!billingAvailability().available)
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message: "Payments are currently unavailable.",
    });
}
