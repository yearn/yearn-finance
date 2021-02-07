/**
 * Placeholders for API data loading
 */
// import { CREAM_DATA_LOADED } from './constants';
// export function creamDataLoaded(payload) {
//   return {
//     type: CREAM_DATA_LOADED,
//     payload,
//   };
// }

import {
  CREAM_ENTER_MARKETS,
  INITIALIZE_CREAM,
  CREAM_SUPPLY,
  CREAM_BORROW,
  CREAM_REPAY,
  CREAM_WITHDRAW,
  CREAM_APPROVE,
} from './constants';

export function initializeCream() {
  return {
    type: INITIALIZE_CREAM,
  };
}

export function creamEnterMarkets({
  creamCTokenAddress,
  creamComptrollerContract,
}) {
  return {
    type: CREAM_ENTER_MARKETS,
    creamCTokenAddress,
    creamComptrollerContract,
  };
}

export function creamSupply({ crTokenContract, amount }) {
  return {
    type: CREAM_SUPPLY,
    crTokenContract,
    amount,
  };
}

export function creamBorrow({ crTokenContract, amount }) {
  return {
    type: CREAM_BORROW,
    crTokenContract,
    amount,
  };
}

export function creamRepay({ crTokenContract, amount }) {
  return {
    type: CREAM_REPAY,
    crTokenContract,
    amount,
  };
}

export function creamWithdraw({ crTokenContract, amount }) {
  return {
    type: CREAM_WITHDRAW,
    crTokenContract,
    amount,
  };
}

export function creamApprove({ tokenContract, creamCTokenAddress }) {
  return {
    type: CREAM_APPROVE,
    tokenContract,
    creamCTokenAddress,
  };
}
