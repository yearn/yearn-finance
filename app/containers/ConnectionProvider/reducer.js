/*
 *
 * Connection reducer
 *
 */
import produce from 'immer';

import { CONNECTION_CONNECTED } from './constants';

export const initialState = {
  connected: false,
};

/* eslint-disable default-case, no-param-reassign */
const connectionProviderReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case CONNECTION_CONNECTED:
        draft.connected = true;
        break;
    }
  });

export default connectionProviderReducer;
