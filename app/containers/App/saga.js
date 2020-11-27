import { put, call, takeLatest, take, select } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import vaultAbi from 'abi/yVault.json';
import minimalErc20Abi from 'abi/minimalErc20.json';
import { addContracts } from 'containers/DrizzleProvider/actions';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import { selectVaults } from 'containers/App/selectors';
import KonamiCode from 'konami-code-js';
import runMatrix from 'utils/matrix';
import { unlockDevMode } from 'containers/DevMode/actions';
import { setThemeMode } from 'containers/ThemeProvider/actions';
import { DARK_MODE } from 'containers/ThemeProvider/constants';
import { TX_BROADCASTED } from 'containers/DrizzleProvider/constants';
import { APP_READY, APP_INITIALIZED } from './constants';

function* loadVaultContracts() {
  const vaults = yield select(selectVaults());
  const vaultAddresses = _.map(vaults, vault => vault.address);
  const account = yield select(selectAccount());
  const localContracts = JSON.parse(
    localStorage.getItem('watchedContracts') || '[]',
  );

  const vaultTokenAddresses = _.map(vaults, vault => vault.tokenAddress);
  const contracts = [
    {
      namespace: 'vaults',
      metadata: {
        version: '1',
      },
      abi: vaultAbi,
      allReadMethods: false,
      addresses: vaultAddresses,
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
      abi: minimalErc20Abi,
      allReadMethods: false,
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
  yield put(addContracts(contracts));
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

export default function* initialize() {
  yield takeLatest(APP_READY, loadVaultContracts);
  yield takeLatest(TX_BROADCASTED, watchTransactions);
  yield takeLatest(APP_INITIALIZED, startKonamiWatcher);
}
