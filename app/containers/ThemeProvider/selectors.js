import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the themeToggle state domain
 */
const selectTheme = (state) => state.theme || initialState;

const selectDarkMode = () =>
  createSelector(selectTheme, (substate) => substate.darkMode);

export { selectTheme, selectDarkMode };
