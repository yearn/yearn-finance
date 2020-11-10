/*
 *
 * Theme actions
 *
 */

import { TOGGLE_DARK_MODE, SET_THEME_MODE } from './constants';

export function toggleDarkMode() {
  return {
    type: TOGGLE_DARK_MODE,
  };
}

export function setThemeMode(mode) {
  return {
    type: SET_THEME_MODE,
    mode,
  };
}
