import { createSelector } from 'reselect';

const selectStatus = state => state.app;

export const selectReady = () =>
  createSelector(
    selectStatus,
    substate => substate && substate.ready,
  );

export const selectDevMode = () =>
  createSelector(
    selectStatus,
    substate => substate && substate.devMode,
  );
