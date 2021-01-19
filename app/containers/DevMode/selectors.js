/* eslint no-unused-vars: 0 */
import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the themeToggle state domain
 */
export const selectState = (state) => state.devMode || initialState;

export const selectDevMode = () =>
  createSelector(selectState, (substate) => true);

export const selectDevModeUnlocked = () =>
  createSelector(selectState, (substate) => true);
