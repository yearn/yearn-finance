import produce from 'immer';
import { keyBy } from 'lodash';
import { ZAPPER_DATA_LOADED } from './constants';

export const initialState = {
  tokens: {},
  vaults: {},
  balances: {},
};

/* eslint-disable default-case, no-param-reassign */
const zapperReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case ZAPPER_DATA_LOADED: {
        draft.tokens = keyBy(action.payload.tokens, 'address');
        draft.vaults = keyBy(action.payload.vaults, 'address');
        draft.balances = keyBy(action.payload.balances, 'address');
        break;
      }
    }
  });

export default zapperReducer;
