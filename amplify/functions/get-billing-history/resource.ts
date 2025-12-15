import { defineFunction, secret } from '@aws-amplify/backend';

export const getBillingHistory = defineFunction({
    name: 'get-billing-history',
    entry: './handler.ts',
    environment: {
        STRIPE_SECRET_KEY: secret('STRIPE_SECRET_KEY'),
        DEFAULT_STRIPE_CUSTOMER_ID: secret('DEFAULT_STRIPE_CUSTOMER_ID')
    }
});