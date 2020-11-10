import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the themeToggle state domain
 */
export const selectState = state => state.devMode || initialState;

export const selectDevMode = () =>
  createSelector(
    selectState,
    substate => substate.enabled,
  );

export const selectDevModeUnlocked = () =>
  createSelector(
    selectState,
    substate => substate.unlocked,
  );
