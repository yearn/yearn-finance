import { call, put, takeLatest } from 'redux-saga/effects';

// Initialization Functions
import { initializeWeb3 } from '../web3/web3Saga';

import { NETWORK_IDS, NETWORK_MISMATCH } from '../web3/constants';

export function* initializeDrizzle(action) {
  try {
    const { drizzle, options } = action;

    // Initialize web3 and get the current network ID.
    const web3 = yield call(initializeWeb3, options.web3);
    drizzle.web3 = web3;

    // Client may opt out of connecting their account to the dapp Guard against
    // further web3 interaction, and note web3 will be undefined
    //
    if (web3) {
      // const networkId = yield call(getNetworkId, { web3 });
      const networkId = 1;

      // Check whether network is allowed
      const { networkWhitelist } = options;
      if (
        networkWhitelist.length &&
        networkId !== NETWORK_IDS.ganache &&
        !networkWhitelist.includes(networkId)
      ) {
        yield put({ type: NETWORK_MISMATCH, networkId });
      } else {
        // Instantiate contracts passed through via options.
        for (let i = 0; i < options.contracts.length; i += 1) {
          const contractConfig = options.contracts[i];
          let events = [];
          const { contractName } = contractConfig;

          if (contractName in options.events) {
            events = options.events[contractName];
          }

          yield call([drizzle, drizzle.addContract], contractConfig, events);
        }

        const { syncAlways } = options;

        // Protect server-side environments by ensuring ethereum access is
        // guarded by isMetaMask which should only be in browser environment.
        //
        if (web3.currentProvider.isMetaMask && !window.ethereum) {
          // Using old MetaMask, attempt block polling.
          const interval = options.polls.blocks;
          yield put({
            type: 'BLOCKS_POLLING',
            drizzle,
            interval,
            web3,
            syncAlways,
          });
        } else {
          // Not using old MetaMask, attempt subscription block listening.
          yield put({ type: 'BLOCKS_LISTENING', drizzle, web3, syncAlways });
        }

        // Accounts Polling
        if ('accounts' in options.polls) {
          yield put({
            type: 'ACCOUNTS_POLLING',
            interval: options.polls.accounts,
            web3,
          });
        }
      }
    }
  } catch (error) {
    yield put({ type: 'DRIZZLE_FAILED', error });
    console.error('Error initializing Drizzle:');
    console.error(error);

    return;
  }

  yield put({ type: 'DRIZZLE_INITIALIZED' });
}

function* drizzleStatusSaga() {
  yield takeLatest('DRIZZLE_INITIALIZING', initializeDrizzle);
}

export default drizzleStatusSaga;
