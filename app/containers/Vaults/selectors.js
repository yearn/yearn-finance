import { createSelector } from 'reselect';

const selectApp = state => state.vaults;

export const selectVaults = () =>
  createSelector(
    selectApp,
    substate => substate.data,
  );
