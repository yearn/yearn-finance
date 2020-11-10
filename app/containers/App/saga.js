import { put, call, takeLatest, take, select } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import minimalVaultAbi from 'abi/yVault.json';
import minimalErc20Abi from 'abi/minimalErc20.json';
import { addContracts } from 'containers/DrizzleProvider/actions';
import { selectAddress } from 'containers/ConnectionProvider/selectors';
import { selectVaults } from 'containers/Vaults/selectors';
import KonamiCode from 'konami-code-js';
import runMatrix from 'utils/matrix';
import { unlockDevMode } from 'containers/DevMode/actions';
import { setThemeMode } from 'containers/ThemeProvider/actions';
import { DARK_MODE } from 'containers/ThemeProvider/constants';
import { APP_READY, APP_INITIALIZED } from './constants';

function* loadVaultContracts() {
  const vaults = yield select(selectVaults());
  const vaultAddresses = _.map(vaults, vault => vault.address);
  const address = yield select(selectAddress());
  const localVaults = JSON.parse(localStorage.getItem('watchedVaults') || '[]');

  const vaultTokenAddresses = _.map(vaults, vault => vault.tokenAddress);

  const contracts = [
    {
      contractType: 'vaults',
      metadata: {
        version: '1',
      },
      abi: minimalVaultAbi,
      addresses: vaultAddresses,
      methods: [
        { name: 'name' },
        { name: 'balance' },
        {
          name: 'balanceOf',
          args: address,
        },
      ],
    },
    {
      contractType: 'tokens',
      abi: minimalErc20Abi,
      addresses: vaultTokenAddresses,
      allFields: true,
      methods: [
        {
          name: 'balanceOf',
          args: address,
        },
      ],
    },
    {
      contractType: 'localVaults',
      addresses: localVaults,
      allFields: true,
      methods: [
        {
          name: 'balanceOf',
          args: address,
        },
      ],
    },
  ];
  yield put(addContracts(contracts));
}

// function* addVault(action) {
//   const vaultAddress = action.address;
//   const localVaults = JSON.parse(localStorage.getItem('watchedVaults') || '[]');
//   const account = yield select(selectAddress());
//   const alreadyWatching = _.includes(localVaults, vaultAddress);
//   if (alreadyWatching) {
//     return;
//   }
//   const contracts = [
//     {
//       type: 'localVaults',
//       addresses: [vaultAddress],
//       allFields: true,
//       methods: [
//         {
//           name: 'balanceOf',
//           args: account,
//         },
//       ],
//     },
//   ];
//   yield put(addContracts(contracts));
//   localVaults.push(vaultAddress);
//   localStorage.setItem('watchedVaults', JSON.stringify(localVaults));
// }

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

export default function* initialize() {
  yield takeLatest(APP_READY, loadVaultContracts);
  yield takeLatest(APP_INITIALIZED, startKonamiWatcher);
}
