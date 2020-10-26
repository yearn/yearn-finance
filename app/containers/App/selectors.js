import { createSelector } from 'reselect';

const selectStatus = state => state.status;

export const selectReady = () =>
  createSelector(
    selectStatus,
    substate => substate && substate.ready,
  );
