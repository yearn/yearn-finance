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
import { VAULTS_LOADED } from './constants';
import { USER_VAULT_STATISTICS_LOADED } from '../Vaults/constants';

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
  backscratcher: null,
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
      case VAULTS_LOADED: {
        draft.loading.vaults = false;

        draft.backscratcher = action.vaults.find(
          (vault) => vault.address === backscratcherAddress,
        );

        draft.vaults = action.vaults.filter(
          (vault) => vault.address !== backscratcherAddress,
        );
        const usdnVault = _.find(action.vaults, { displayName: 'crvUSDN' });
        let { baseApy } = usdnVault.apy.data;
        baseApy *= 0.5;
        usdnVault.apy.data = {
          ...usdnVault.apy.data,
          baseApy,
          boostedApy: baseApy * usdnVault.apy.data.currentBoost,
          totalApy:
            baseApy * usdnVault.apy.data.currentBoost +
            usdnVault.apy.data.poolApy,
        };
        usdnVault.apy.recommended = usdnVault.apy.data.totalApy;
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
      // case WEBSOCKET_CONNECTED:
      //   draft.loading.websocket = false;
      //   checkReadyState();
      //   break;
    }
  });

export default appReducer;
