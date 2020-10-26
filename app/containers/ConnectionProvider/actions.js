/*
 *
 * Connection actions
 *
 */

import { CONNECTION_CONNECTED, ADDRESS_UPDATED } from './constants';

export function connectionConnected() {
  return {
    type: CONNECTION_CONNECTED,
  };
}

export function addressUpdated(address) {
  return {
    type: ADDRESS_UPDATED,
    address,
  };
}
