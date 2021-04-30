import { createSelector } from 'reselect';

const selectZapper = (state) => state.zapper;

export const selectZapperTokens = () =>
  createSelector(selectZapper, (substate) => substate.tokens);

export const selectZapperVaults = () =>
  createSelector(selectZapper, (substate) => substate.vaults);

export const selectZapperPickleVaults = () =>
  createSelector(selectZapper, (substate) => substate.pickleVaults);

export const selectZapperBalances = () =>
  createSelector(selectZapper, (substate) => substate.balances);

export const selectZapperError = () =>
  createSelector(selectZapper, (substate) => substate.error);
