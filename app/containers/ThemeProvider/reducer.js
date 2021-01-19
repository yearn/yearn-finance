/*
 *
 * Theme reducer
 *
 */
import produce from 'immer';

import { TOGGLE_DARK_MODE, SET_THEME_MODE, DARK_MODE } from './constants';

const defaultMode = DARK_MODE;
const localStorageDarkModeStr = localStorage.getItem('darkMode');
const localStorageDarkMode = JSON.parse(localStorageDarkModeStr);
const modeNotSet = localStorageDarkModeStr === null;

let darkMode;
if (modeNotSet) {
  darkMode = defaultMode === DARK_MODE;
} else {
  darkMode = localStorageDarkMode;
}

export const initialState = {
  darkMode,
};

/* eslint-disable default-case, no-param-reassign */
const languageProviderReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case TOGGLE_DARK_MODE:
        draft.darkMode = !draft.darkMode;
        break;
      case SET_THEME_MODE:
        draft.darkMode = action.mode === DARK_MODE;
        break;
    }
  });

export default languageProviderReducer;
