import { createSelector } from 'reselect';

const selectContracts = (state) => state.subscriptions;

export const selectContractsSubscriptions = () =>
  createSelector(selectContracts, (substate) => substate);
