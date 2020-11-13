import produce from 'immer';
import {
  CONNECTION_CONNECTED,
  ADDRESS_UPDATED,
} from 'containers/ConnectionProvider/constants';
import {
  DRIZZLE_INITIALIZED,
  DRIZZLE_ADD_CONTRACTS,
  GOT_CONTRACT_VAR,
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
  localVaults: [],
};

const loadContractData = (state, draft, action) => {
  const newDraft = draft;
  switch (action.type) {
    case GOT_CONTRACT_VAR: {
      const {
        name: address,
        variable: field,
        contractType,
        metadata,
        value,
      } = action;
      const item = _.find(draft[contractType], { address });
      if (!item) {
        const newItem = { address };
        draft[contractType].push(newItem);
        newItem[field] = _.clone(value);
        newItem.metadata = metadata;
        break;
      }
      item[field] = value;
      item.metadata = metadata;
      newDraft[contractType] = _.clone(draft[contractType]);
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
          const { contractType, addresses } = contract;
          if (contractType) {
            watchedContractAddresses[contractType] = addresses;
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
