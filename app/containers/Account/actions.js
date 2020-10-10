/*
 *
 * Theme actions
 *
 */

import { SET_WEB3, SET_ACCOUNT } from './constants';

export function setWeb3(web3) {
  return {
    type: SET_WEB3,
    web3,
  };
}

export function setAccount(account) {
  return {
    type: SET_ACCOUNT,
    account,
  };
}
