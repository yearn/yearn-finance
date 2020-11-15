/*
 *
 * Connection actions
 *
 */

import { CONNECTION_CONNECTED, ACCOUNT_UPDATED } from './constants';

export function connectionConnected() {
  return {
    type: CONNECTION_CONNECTED,
  };
}

export function accountUpdated(account) {
  return {
    type: ACCOUNT_UPDATED,
    account,
  };
}
