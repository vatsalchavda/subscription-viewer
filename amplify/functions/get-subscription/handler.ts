import Stripe from 'stripe';
import type { Handler } from 'aws-lambda';

// 1. Define the exact shape we need.
// This overrides the complex SDK types and eliminates ambiguity.
interface SubscriptionShape {
  status: string;
  current_period_end?: number;
  ended_at?: number;
  items: {
    data: {
      plan: {
        product: string;
      }
    }[]
  };
}

export const handler: Handler = async (event) => {
  const stripeSecret = process.env.STRIPE_SECRET_KEY as string;
  const customerId = process.env.DEFAULT_STRIPE_CUSTOMER_ID as string;

  if (!stripeSecret || !customerId) {
    throw new Error("Configuration Error: Missing Stripe environment variables.");
  }

  // Initialize Stripe
  const stripe = new Stripe(stripeSecret);

  try {
    // fetch all subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 10,
    });

    if (subscriptions.data.length === 0) {
      return [];
    }

    // map over all subscriptions and format the response
    const formattedSubs = await Promise.all(subscriptions.data.map(async (sub) => {
      const subscription = sub as unknown as SubscriptionShape;

      const dateValue = subscription.current_period_end ?? subscription.ended_at;
      let renewalDate = "N/A";
      if (typeof dateValue === 'number' && dateValue > 0) {
        renewalDate = new Date(dateValue * 1000).toLocaleDateString();
      }

      // Product name logic
      let productName = 'Unknown Plan';
      const planItem = subscription.items?.data[0]?.plan;

      if (planItem && planItem.product) {
        try {
          if (typeof planItem.product === 'string') {
            const product = await stripe.products.retrieve(planItem.product);
            productName = product.name;
          }
        } catch (error){
          console.error("Could not fetch product details: ", error);
        }
      }

      return {
        status: subscription.status,
        planName: productName,
        renewalDate: renewalDate,
      };
    }));

    return formattedSubs;

  } catch (error) {
    console.error("Stripe Error:", error);
    throw new Error(`Failed to fetch subscription: ${(error as Error).message}`);
  }
};
