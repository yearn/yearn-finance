import { DRIZZLE_ADD_CONTRACTS } from './constants';

export function addContracts(contracts) {
  return {
    type: DRIZZLE_ADD_CONTRACTS,
    contracts,
  };
}
