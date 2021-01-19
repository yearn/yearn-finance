import produce from 'immer';

import { TOGGLE_DEV_MODE, UNLOCK_DEV_MODE } from './constants';

const defaultDevMode = true;
const localStorageDevModeStr = localStorage.getItem('devMode');
const localStorageDevMode = JSON.parse(localStorageDevModeStr);
const localStorageDevModeUnlockedStr = localStorage.getItem('devModeUnlocked');
const localStorageDevModeUnlocked = JSON.parse(localStorageDevModeUnlockedStr);
const modeNotSet = localStorageDevModeStr === null;

let devMode;
if (modeNotSet) {
  devMode = defaultDevMode;
} else {
  devMode = localStorageDevMode;
}

const unlocked = localStorageDevModeUnlocked || false;

export const initialState = {
  enabled: unlocked && devMode,
  unlocked,
};

/* eslint-disable default-case, no-param-reassign */
export default function reducer(state = initialState, action) {
  return produce(state, (draft) => {
    switch (action.type) {
      case TOGGLE_DEV_MODE:
        draft.enabled = draft.unlocked && !draft.enabled;
        break;
      case UNLOCK_DEV_MODE:
        draft.unlocked = true;
        draft.enabled = true;
    }
  });
}
