import produce from 'immer';

import { TOGGLE_DEV_MODE } from './constants';

const defaultDevMode = true;
const localStorageDevModeStr = localStorage.getItem('devMode');
const localStorageDevMode = JSON.parse(localStorageDevModeStr);
const modeNotSet = localStorageDevModeStr === null;

let devMode;
if (modeNotSet) {
  devMode = defaultDevMode;
} else {
  devMode = localStorageDevMode;
}

export const initialState = {
  enabled: devMode,
};

/* eslint-disable default-case, no-param-reassign */
export default function reducer(state = initialState, action) {
  return produce(state, draft => {
    switch (action.type) {
      case TOGGLE_DEV_MODE:
        draft.enabled = !draft.enabled;
        break;
    }
  });
}
