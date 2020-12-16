import { createSelector } from 'reselect';

const selectCream = state => state.cream;

export const selectCTokenAddresses = () =>
  createSelector(
    selectCream,
    // Having to fall back to [] as undefined is returned when state not ready yet
    // thought this would have been taken care of by initialStare in reducer.js but its not...
    substate => (substate && substate.cTokenAddresses) || [],
  );
