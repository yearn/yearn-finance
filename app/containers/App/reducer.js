import produce from 'immer';
import {
  CONNECTION_CONNECTED,
  ACCOUNT_UPDATED,
} from 'containers/ConnectionProvider/constants';
import {
  DRIZZLE_INITIALIZED,
  ETH_BALANCE_UPDATED,
} from 'containers/DrizzleProvider/constants';

// import { WEBSOCKET_CONNECTED } from 'middleware/websocket/constants';
import { VAULTS_LOADED, ROUTE_CHANGED } from './constants';
import {
  USER_VAULT_STATISTICS_LOADED,
  AMPLIFY_VAULTS_ADDRESSES,
  BACKSCRATCHER_ADDRESS,
  YVBOOST_ADDRESS,
} from '../Vaults/constants';

const backscratcherAddress = '0xc5bDdf9843308380375a611c18B50Fb9341f502A';

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
  amplifyVaults: [],
  // TODO Remove this
  backscratcher: null,
  tokens: [],
  localContracts: [],
  user: {
    currentRoute: null,
    previousRoute: null,
  },
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

    const mapSpecialVaults = (vault) => {
      const vaultIsBackscratcher = vault.address === BACKSCRATCHER_ADDRESS;
      const vaultIsYvBoost = vault.address === YVBOOST_ADDRESS;
      if (vaultIsBackscratcher) {
        vault.displayName = 'yveCRV';
        vault.token.icon = `https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/multichain-tokens/1/${BACKSCRATCHER_ADDRESS}/logo-128.png`;
      } else if (vaultIsYvBoost) {
        vault.displayName = 'yvBOOST';
        vault.token.icon = `https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/multichain-tokens/1/${YVBOOST_ADDRESS}/logo-128.png`;
      }
      return vault;
    };

    switch (action.type) {
      case USER_VAULT_STATISTICS_LOADED:
        draft.loading.vaults = false;
        draft.vaults = action.vaults;
        checkReadyState();
        break;
      case VAULTS_LOADED: {
        draft.loading.vaults = false;

        // TODO remove this
        draft.backscratcher = action.vaults.find(
          (vault) => vault.address === backscratcherAddress,
        );

        draft.amplifyVaults = action.vaults.filter((vault) =>
          isAmplifyVault(vault),
        );
        draft.vaults = action.vaults
          .map(mapSpecialVaults)
          .filter((vault) => !isAmplifyVault(vault));
        checkReadyState();
        break;
      }
      case CONNECTION_CONNECTED:
        draft.loading.web3 = false;
        checkReadyState();
        break;
      case ACCOUNT_UPDATED:
        draft.loading.account = false;
        checkReadyState();
        break;
      case ETH_BALANCE_UPDATED:
        draft.ethBalance = action.ethBalance;
        break;
      case DRIZZLE_INITIALIZED:
        draft.loading.drizzle = false;
        break;
      // case WEBSOCKET_CONNECTED:
      //   draft.loading.websocket = false;
      //   checkReadyState();
      //   break;
      case ROUTE_CHANGED:
        draft.user = {
          previousRoute: draft.user.currentRoute,
          currentRoute: action.route,
        };
        break;
    }
  });

function isAmplifyVault(vault) {
  const found = AMPLIFY_VAULTS_ADDRESSES.find(
    (address) => vault.address === address,
  );
  return !!found;
}

export default appReducer;
