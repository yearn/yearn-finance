import produce from 'immer';
import {
  CONNECTION_CONNECTED,
  ACCOUNT_UPDATED,
} from 'containers/ConnectionProvider/constants';
import { DRIZZLE_INITIALIZED } from 'containers/DrizzleProvider/constants';

// import { WEBSOCKET_CONNECTED } from 'middleware/websocket/constants';
import { VAULTS_LOADED } from './constants';
import { USER_VAULT_STATISTICS_LOADED } from '../Vaults/constants';

// The initial state of the App
export const initialState = {
  ready: false,
  watchedContractAddresses: {},
  loading: {
    vaults: true,
    web3: true,
    // websocket: true,
    drizzle: true,
    account: true,
  },
  vaults: [],
  tokens: [],
  localContracts: [],
};

/* eslint-disable default-case, no-param-reassign */
const appReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    // Utility functions
    const checkReadyState = () => {
      const { loading } = draft;
      const ready =
        !loading.vaults &&
        !loading.drizzle &&
        // !loading.websocket &&
        !loading.account &&
        !loading.web3;
      draft.ready = ready;
    };

    switch (action.type) {
      case USER_VAULT_STATISTICS_LOADED:
        draft.loading.vaults = false;
        draft.vaults = action.vaults;
        checkReadyState();
        break;
      case VAULTS_LOADED:
        draft.loading.vaults = false;
        draft.vaults = action.vaults;
        checkReadyState();
        break;
      case CONNECTION_CONNECTED:
        draft.loading.web3 = false;
        checkReadyState();
        break;
      case ACCOUNT_UPDATED:
        draft.loading.account = false;
        checkReadyState();
        break;
      case DRIZZLE_INITIALIZED:
        draft.loading.drizzle = false;
      // case WEBSOCKET_CONNECTED:
      //   draft.loading.websocket = false;
      //   checkReadyState();
      //   break;
    }
  });

export default appReducer;
