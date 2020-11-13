import { DRIZZLE_ADD_CONTRACTS, ADD_WATCHED_CONTRACTS } from './constants';

export function addContracts(contracts) {
  return {
    type: DRIZZLE_ADD_CONTRACTS,
    contracts,
  };
}

export function addWatchedContracts(addresses) {
  return {
    type: ADD_WATCHED_CONTRACTS,
    addresses,
  };
}
