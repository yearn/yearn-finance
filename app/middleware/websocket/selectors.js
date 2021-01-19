import { createSelector } from 'reselect';

const selectApp = (state) => state.websocket;

export const selectTransactions = () =>
  createSelector(selectApp, (substate) => substate.transactions);

export const selectContractsState = () =>
  createSelector(selectApp, (substate) => substate.contractsState);
