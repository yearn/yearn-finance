import { put, call, takeLatest, take, select } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import vaultAbi from 'abi/yVault.json';
import vaultV2Abi from 'abi/v2Vault.json';
import erc20Abi from 'abi/erc20.json';
import { addContracts } from 'containers/DrizzleProvider/actions';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import { selectVaults } from 'containers/App/selectors';
import KonamiCode from 'konami-code-js';
import runMatrix from 'utils/matrix';
import { unlockDevMode } from 'containers/DevMode/actions';
import { setThemeMode } from 'containers/ThemeProvider/actions';
import { DARK_MODE } from 'containers/ThemeProvider/constants';
import { TX_BROADCASTED } from 'containers/DrizzleProvider/constants';
// import { websocketConnect } from 'middleware/websocket/actions';
import { APP_READY, APP_INITIALIZED } from './constants';

function* loadVaultContracts(clear) {
  const vaults = yield select(selectVaults());
  const v1Vaults = _.filter(vaults, vault => vault.type === 'v1');
  const v2Vaults = _.filter(vaults, vault => vault.type === 'v2');
  const v1VaultAddresses = _.map(v1Vaults, vault => vault.address);
  const v2VaultAddresses = _.map(v2Vaults, vault => vault.address);
  const account = yield select(selectAccount());
  const localContracts = JSON.parse(
    localStorage.getItem('watchedContracts'),
  ) || [
    '0x07dbC20B84fF63F3cc542F6A22E5a71cbA5670A4', // DAI iron bank
    '0x33Bd0F9618Cf38FeA8f7f01E1514AB63b9bDe64b', // Idle
    '0xFeD651936Af7e98F7F2A93c03B1E28a2DA7dfaD4', // DEV
    '0xdCD90C7f6324cfa40d7169ef80b12031770B4325', // steCRV
    '0x15a2B3CfaFd696e1C783FE99eed168b78a3A371e', // Lido st. eth
    '0xBFa4D8AA6d8a379aBFe7793399D3DdaCC5bBECBB', // DAI hard
    '0x6392e8fa0588CB2DCb7aF557FdC9D10FDe48A325', // Weth maker
  ];

  const vaultTokenAddresses = _.map(vaults, vault => vault.tokenAddress);
  const contracts = [
    {
      namespace: 'vaults',
      metadata: {
        version: '1',
      },
      abi: vaultAbi,
      allReadMethods: false,
      addresses: v1VaultAddresses,
      readMethods: [
        {
          name: 'name',
          constant: true,
        },
        { name: 'balance' },
        {
          name: 'balanceOf',
          args: [account],
        },
        { name: 'getPricePerFullShare' },
      ],
      writeMethods: [
        {
          name: 'withdraw',
        },
        {
          name: 'deposit',
        },
      ],
    },
    {
      namespace: 'vaults',
      metadata: {
        version: '2',
      },
      abi: vaultV2Abi,
      allReadMethods: false,
      addresses: v2VaultAddresses,
      readMethods: [
        {
          name: 'name',
          constant: true,
        },
        { name: 'totalAssets' },
        {
          name: 'balanceOf',
          args: [account],
        },
        { name: 'pricePerShare' },
      ],
      writeMethods: [
        {
          name: 'withdraw',
        },
        {
          name: 'deposit',
        },
      ],
    },
    {
      namespace: 'tokens',
      abi: erc20Abi,
      allReadMethods: false,
      syncOnce: true, // Additional syncs will be performed by watching logs
      addresses: vaultTokenAddresses,
      readMethods: [
        {
          name: 'balanceOf',
          args: [account],
        },
      ],
    },
    {
      namespace: 'localContracts',
      tags: ['localContracts'],
      addresses: localContracts,
      allWriteMethods: true,
      allReadMethods: true,
      readMethods: [
        {
          name: 'balanceOf',
          args: [account],
        },
      ],
    },
  ];

  const generateVaultTokenAllowanceSubscriptions = vault => {
    const vaultAddress = vault.address;
    const { tokenAddress } = vault;
    if (!tokenAddress) {
      console.log('vault', vault);
    }
    return {
      namespace: 'tokens',
      abi: erc20Abi,
      syncOnce: true,
      addresses: [tokenAddress],
      readMethods: [
        {
          name: 'allowance',
          args: [account, vaultAddress],
        },
      ],
    };
  };

  const vaultTokenAllowanceSubscriptions = _.map(
    vaults,
    generateVaultTokenAllowanceSubscriptions,
  );

  contracts.push(...vaultTokenAllowanceSubscriptions);
  yield put(addContracts(contracts, clear));
}

function konamiWatcher() {
  return eventChannel(emitter => {
    KonamiCode(() => emitter(0));
    return () => {};
  });
}

function* startKonamiWatcher() {
  const chan = yield call(konamiWatcher);
  while (true) {
    yield take(chan);
    yield put(unlockDevMode());
    yield put(setThemeMode(DARK_MODE));
    runMatrix();
  }
}

function* watchTransactions(action) {
  const { notify, txHash } = action;
  notify.hash(txHash);
}

// function* connectWebsocket() {
//   yield put(websocketConnect());
// }

function* accountUpdated() {
  const account = yield select(selectAccount());
  const oldAccount = localStorage.getItem('account');
  if (oldAccount && oldAccount !== account) {
    yield loadVaultContracts(true);
  }
  localStorage.setItem('account', account);
}

export default function* initialize() {
  yield takeLatest(APP_READY, loadVaultContracts);
  yield takeLatest(TX_BROADCASTED, watchTransactions);
  // yield takeLatest(APP_INITIALIZED, connectWebsocket);
  yield takeLatest('ACCOUNT_UPDATED', accountUpdated);
  yield takeLatest(APP_INITIALIZED, startKonamiWatcher);
}
