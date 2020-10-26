import produce from 'immer';
import {
  CONNECTION_CONNECTED,
  ADDRESS_UPDATED,
} from 'containers/ConnectionProvider/constants';
import { DRIZZLE_INITIALIZED } from 'containers/DrizzleProvider/constants';
import { VAULTS_LOADED } from './constants';

// The initial state of the App
export const initialState = {
  ready: false,
  loading: {
    vaults: true,
    web3: true,
    drizzle: true,
    account: true,
  },
};

/* eslint-disable default-case, no-param-reassign */
const appReducer = (state = initialState, action) =>
  produce(state, draft => {
    // Utility functions
    const checkReadyState = () => {
      const { loading } = draft;
      const ready =
        !loading.vaults &&
        !loading.drizzle &&
        !loading.account &&
        !loading.web3;
      draft.ready = ready;
    };

    switch (action.type) {
      case VAULTS_LOADED:
        draft.loading.vaults = false;
        checkReadyState();
        break;
      case CONNECTION_CONNECTED:
        draft.loading.web3 = false;
        checkReadyState();
        break;
      case ADDRESS_UPDATED:
        draft.loading.account = false;
        checkReadyState();
        break;
      case DRIZZLE_INITIALIZED:
        draft.loading.drizzle = false;
        checkReadyState();
        break;
    }
  });

export default appReducer;
