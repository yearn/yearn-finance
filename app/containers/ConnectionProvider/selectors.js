import { createSelector } from 'reselect';

const selectConnection = state => state.connection;

export const selectAddress = () =>
  createSelector(
    selectConnection,
    substate => substate.address,
  );
