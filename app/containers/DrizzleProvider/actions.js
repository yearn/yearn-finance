import { ADD_CONTRACTS } from './constants';

export function addContracts(contracts) {
  return {
    type: ADD_CONTRACTS,
    contracts,
  };
}
