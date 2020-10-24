/*
 *
 * Connection actions
 *
 */

import { CONNECTION_CONNECTED } from './constants';

export function connectionConnected() {
  return {
    type: CONNECTION_CONNECTED,
  };
}
