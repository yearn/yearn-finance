import { createSelector } from 'reselect';

const selectStatus = state => state.app;

export const selectReady = () =>
  createSelector(
    selectStatus,
    substate => substate && substate.ready,
  );
