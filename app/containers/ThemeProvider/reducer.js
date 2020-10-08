/*
 *
 * Theme reducer
 *
 */
import produce from 'immer';

import { CHANGE_THEME } from './constants';

const defaultTheme = 'dark';

const initialTheme = localStorage.getItem('theme') || defaultTheme;

export const initialState = {
  selected: initialTheme,
};

/* eslint-disable default-case, no-param-reassign */
const languageProviderReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case CHANGE_THEME:
        draft.selected = action.theme;
        break;
    }
  });

export default languageProviderReducer;
