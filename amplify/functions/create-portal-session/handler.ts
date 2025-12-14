import Stripe from 'stripe';
import type { Handler } from 'aws-lambda';

export const handler: Handler = async (event) => {
  const stripeSecret = process.env.STRIPE_SECRET_KEY as string;
  const customerId = process.env.DEFAULT_STRIPE_CUSTOMER_ID as string; // Simulating user lookup
  const frontEndUrl = process.env.STRIPE_BILLING_PORTAL_RETURN_URL as string;

  if (!stripeSecret || !customerId || !frontEndUrl) {
    throw new Error("Configuration Error: Missing Stripe environment variables or Frontend URL.");
  }

  const stripe = new Stripe(stripeSecret);

  try {
    const cleanUrl = frontEndUrl.endsWith('/') ? frontEndUrl.slice(0, -1) : frontEndUrl;
    const returnUrl = `${cleanUrl}?billing_return=true`;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl, 
    });

    return { 
      url: session.url 
    };
  } catch (error) { 
    console.error("Portal Error:", error);
    throw new Error(`Failed to create portal session: ${(error as Error).message}`);
  }
};
