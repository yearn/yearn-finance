import { createSelector } from 'reselect';

const selectApp = state => state.app;
const selectRouter = state => state.router;

export const selectReady = () =>
  createSelector(
    selectApp,
    substate => substate && substate.ready,
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
