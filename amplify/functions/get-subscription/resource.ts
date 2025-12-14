import { defineFunction, secret } from '@aws-amplify/backend';

export const getSubscription = defineFunction({
  name: 'get-subscription',
  entry: './handler.ts',
  environment: {
    STRIPE_SECRET_KEY: secret('STRIPE_SECRET_KEY'),
    // In a real app, this would be a DB lookup. For now, we mock it via Env or Hardcoding.
    DEFAULT_STRIPE_CUSTOMER_ID: secret('DEFAULT_STRIPE_CUSTOMER_ID'),
  }
});