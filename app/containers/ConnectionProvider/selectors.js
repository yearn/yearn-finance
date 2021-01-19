import { createSelector } from 'reselect';

const selectConnection = (state) => state.connection;

export const selectAccount = () =>
  createSelector(selectConnection, (substate) => substate && substate.account);
