import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { getSubscription } from '../functions/get-subscription/resource'; 
import { createPortalSession } from '../functions/create-portal-session/resource';

const schema = a.schema({

  SubscriptionResponse: a.customType({
    status: a.string(),
    planName: a.string(),
    renewalDate: a.string(),
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
    .handler(a.handler.function(createPortalSession))
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
