import { createSelector } from 'reselect';

const selectCover = state => state.cover;

export const selectProtocols = () =>
  createSelector(
    selectCover,
    substate => substate && substate.protocols,
  );
