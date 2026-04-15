import Stripe from "stripe";

let stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (!stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) throw new Error("Missing STRIPE_SECRET_KEY");
    stripe = new Stripe(apiKey);
  }
  return stripe;
}
