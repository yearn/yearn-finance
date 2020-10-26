import { put, takeLatest, select } from 'redux-saga/effects';
import minimumVaultAbi from 'abi/yVault.json';
import { addContracts } from 'containers/DrizzleProvider/actions';
import { selectAddress } from 'containers/ConnectionProvider/selectors';
import { selectVaults } from 'containers/Vaults/selectors';
import { APP_READY } from './constants';

function* loadVaultContracts() {
  const vaults = yield select(selectVaults());
  const vaultAddresses = _.map(vaults, vault => vault.address);
  const address = yield select(selectAddress());
  const contracts = [
    {
      abi: minimumVaultAbi,
      addresses: vaultAddresses,
      methods: [
        { name: 'balance' },
        {
          name: 'balanceOf',
          args: address,
        },
      ],
    },
  ];

  yield put(addContracts(contracts));
}

export default function* initialize() {
  yield takeLatest(APP_READY, loadVaultContracts);
}
