import { createSelector } from 'reselect';

const selectApp = state => state.app;

const selectReady = () =>
  createSelector(
    selectApp,
    substate => substate && substate.ready,
  );

export { selectReady };
