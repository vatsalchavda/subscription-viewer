import { defineFunction, secret } from '@aws-amplify/backend';

export const createPortalSession = defineFunction({
  name: 'create-portal-session',
  entry: './handler.ts',
  environment: {
    STRIPE_SECRET_KEY: secret('STRIPE_SECRET_KEY'),
    // In a real app, this would be a DB lookup. For now, we mock it via Env or Hardcoding.
    DEFAULT_STRIPE_CUSTOMER_ID: secret('DEFAULT_STRIPE_CUSTOMER_ID'),
    STRIPE_BILLING_PORTAL_RETURN_URL: process.env.STRIPE_BILLING_PORTAL_RETURN_URL || "https://localhost:5173",
  }
});
