import * as r from 'redux-saga/effects';
import minimumVaultAbi from 'abi/minimumVault.json';
import { addContracts } from 'containers/DrizzleProvider/actions';
import { selectVaults } from '../selectors';
import { APP_READY } from '../constants';

function* loadContracts(action) {
  const { web3 } = action;
  const vaults = yield r.select(selectVaults());

  const generateVaultContract = vault => {
    const { address } = vault;
    const contract = new web3.eth.Contract(minimumVaultAbi, address);
    return {
      contractName: address,
      web3Contract: contract,
    };
  };
  const vaultContracts = _.map(vaults, generateVaultContract);
  yield r.put(addContracts(vaultContracts));
}

export default function* initialize() {
  yield r.takeLatest(APP_READY, loadContracts);
}
