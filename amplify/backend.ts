import { defineBackend } from '@aws-amplify/backend';
import { data } from './data/resource';
import { auth } from './auth/resource';
import { getSubscription } from './functions/get-subscription/resource';
import { createPortalSession } from './functions/create-portal-session/resource';

defineBackend({
  auth,
  data,
  getSubscription,
  createPortalSession
});
