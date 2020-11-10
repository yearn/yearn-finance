import { createSelector } from 'reselect';

// TODO: Remove
const selectContracts = state => state.contracts;

// TODO: Remove
export const selectContract = address =>
  createSelector(
    selectContracts,
    substate => substate[address],
  );
