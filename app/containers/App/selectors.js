import { createSelector } from 'reselect';

const selectApp = state => state.app;
const selectRouter = state => state.router;
const selectContractsData = state => state.contracts;

export const selectReady = () =>
  createSelector(
    selectApp,
    substate => substate && substate.ready,
  );

export const selectVaults = () =>
  createSelector(
    selectApp,
    substate => substate.vaults,
  );

export const selectWatchedContractAddresses = () =>
  createSelector(
    selectApp,
    substate => substate.watchedContractAddresses,
  );

export const selectLocation = () =>
  createSelector(
    selectRouter,
    routerState => routerState.location,
  );

export const selectContracts = group =>
  createSelector(
    selectApp,
    substate => substate[group],
  );

export const selectContractData = contractAddress =>
  createSelector(
    selectContractsData,
    substate => substate[contractAddress] || {},
  );
