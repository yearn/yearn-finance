import produce from 'immer';
import { ACCOUNT_UPDATED } from 'containers/ConnectionProvider/constants';

// The initial state of the App
export const initialState = {};

/* eslint-disable default-case, no-param-reassign */
const appReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case ACCOUNT_UPDATED:
        draft.account = action.account;
        break;
    }
  });

export default appReducer;
