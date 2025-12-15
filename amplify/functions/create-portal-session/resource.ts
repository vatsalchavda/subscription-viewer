import { defineFunction, secret } from '@aws-amplify/backend';

export const createPortalSession = defineFunction({
  name: 'create-portal-session',
  entry: './handler.ts',
  environment: {
    STRIPE_SECRET_KEY: secret('STRIPE_SECRET_KEY'),
    DEFAULT_STRIPE_CUSTOMER_ID: secret('DEFAULT_STRIPE_CUSTOMER_ID'),
    STRIPE_BILLING_PORTAL_RETURN_URL: process.env.STRIPE_BILLING_PORTAL_RETURN_URL || "https://localhost:5173",
  }
});
