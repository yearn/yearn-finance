import produce from 'immer';
import { CREAM_CTOKENS_LOADED } from './constants';

export const initialState = {
  cTokenAddresses: [],
};

/* eslint-disable default-case, no-param-reassign */
const creamReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case CREAM_CTOKENS_LOADED: {
        draft.cTokenAddresses = action.payload;
        break;
      }
    }
  });

export default creamReducer;
