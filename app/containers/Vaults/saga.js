import request from 'utils/request';
import { DELETE_CONTRACT } from 'containers/DrizzleProvider/constants';
import { APP_INITIALIZED } from 'containers/App/constants';
import * as r from 'redux-saga/effects';
import * as a from './actions';

function* fetchVaults() {
  try {
    const url = `https://api.yearn.tools/vaults?apy=true`;
    const vaults = yield r.call(request, url);
    yield r.put(a.vaultsLoaded(vaults));
  } catch (err) {
    console.log('Error reading vaults', err);
  }
}

function* removeVault(action) {
  const { contractName } = action;
  let localVaults = JSON.parse(localStorage.getItem('watchedVaults') || '[]');
  localVaults = _.pull(localVaults, contractName);
  localStorage.setItem('watchedVaults', JSON.stringify(localVaults));
}

export default function* initialize() {
  yield r.takeLatest(APP_INITIALIZED, fetchVaults);
  yield r.takeLatest(DELETE_CONTRACT, removeVault);
}
