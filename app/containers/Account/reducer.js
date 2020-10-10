import produce from 'immer';
import { SET_ACCOUNT } from './constants';

/* eslint-disable default-case, no-param-reassign */
export const initialState = {};

const accountReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case SET_ACCOUNT:
        draft.onboard = action.account;
        draft.address = action.account.address;
        draft.balance = action.account.balance;
        break;
    }
  });

export default accountReducer;
