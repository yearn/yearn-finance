import produce from 'immer';
import { ADDRESS_UPDATED } from 'containers/ConnectionProvider/constants';

// The initial state of the App
export const initialState = {};

/* eslint-disable default-case, no-param-reassign */
const appReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case ADDRESS_UPDATED:
        draft.address = action.address;
        break;
    }
  });

export default appReducer;
