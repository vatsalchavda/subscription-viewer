import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { getSubscription } from '../functions/get-subscription/resource'; 
import { createPortalSession } from '../functions/create-portal-session/resource';
import { getBillingHistory } from '../functions/get-billing-history/resource';

const schema = a.schema({
  SubscriptionResponse: a.customType({
    status: a.string(),
    planName: a.string(),
    renewalDate: a.string(),
  }),

  // Define invoice type
  InvoiceType: a.customType({
    id: a.string(),
    date: a.string(),
    amount: a.string(),
    currency: a.string(),
    status: a.string(),
    pdfUrl: a.string(),
  }),

  // Expose the 'getSubscription' function as a query
  getSubscription: a
    .query()
    .returns(a.ref('SubscriptionResponse').array())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(getSubscription)),

  PortalSessionResponse: a.customType({
    url: a.string(),
  }),

  createPortalSession: a
    .query()
    .returns(a.ref('PortalSessionResponse'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(createPortalSession)),

  // Expose the 'getBillingHistory' function as a query  
  getBillingHistory: a
    .query()
    .returns(a.ref('InvoiceType').array())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(getBillingHistory))
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
