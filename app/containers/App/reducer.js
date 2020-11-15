import produce from 'immer';
import {
  CONNECTION_CONNECTED,
  ACCOUNT_UPDATED,
} from 'containers/ConnectionProvider/constants';
import {
  DRIZZLE_INITIALIZED,
  DRIZZLE_ADD_CONTRACTS,
  GOT_CONTRACT_VAR,
  CONTRACT_INITIALIZED,
} from 'containers/DrizzleProvider/constants';
import { VAULTS_LOADED } from './constants';

// The initial state of the App
export const initialState = {
  ready: false,
  watchedContractAddresses: {},
  loading: {
    vaults: true,
    web3: true,
    drizzle: true,
    account: true,
  },
  vaults: [],
  tokens: [],
  localContracts: [],
};

const loadContractData = (state, draft, action) => {
  const newDraft = draft;
  switch (action.type) {
    case CONTRACT_INITIALIZED: {
      const {
        name: address,
        group,
        metadata,
        readMethods,
        writeMethods,
      } = action;
      const item = _.find(draft[group], { address });
      let newItem = item;
      if (!item) {
        newItem = { address };
        draft[group].push(newItem);
      }
      newItem.metadata = metadata;
      newItem.writeMethods = writeMethods;
      newItem.readMethods = readMethods;
      newItem.group = group;
      newDraft[group] = _.clone(draft[group]);
      break;
    }
    case GOT_CONTRACT_VAR: {
      const { name: address, variable: field, group, value } = action;
      const item = _.find(draft[group], { address });
      let newItem = item;
      if (!item) {
        newItem = { address };
        draft[group].push(newItem);
      }
      newItem[field] = value;
      newDraft[group] = _.clone(draft[group]);
      break;
    }
    default:
      break;
  }
};

/* eslint-disable default-case, no-param-reassign */
const appReducer = (state = initialState, action) =>
  produce(state, draft => {
    loadContractData(state, draft, action);

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
      case DRIZZLE_ADD_CONTRACTS: {
        const { contracts } = action;
        const watchedContractAddresses = {};
        const addContracts = contract => {
          const { group, addresses } = contract;
          if (group) {
            watchedContractAddresses[group] = addresses;
          }
        };
        _.each(contracts, addContracts);
        draft.watchedContractAddresses = watchedContractAddresses;
        break;
      }
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
        checkReadyState();
        break;
    }
  });

export default appReducer;
