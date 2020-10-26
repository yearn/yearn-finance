import produce from 'immer';
import { VAULTS_LOADED } from './constants';

// The initial state of the App
export const initialState = {};

/* eslint-disable default-case, no-param-reassign */
const appReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case VAULTS_LOADED:
        draft.data = action.vaults;
        break;
    }
  });

export default appReducer;
