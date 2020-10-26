import request from 'utils/request';
import { CONNECTION_CONNECTED } from 'containers/ConnectionProvider/constants';
import * as r from 'redux-saga/effects';
import * as a from './actions';
// import * as s from '../selectors';

export function* fetchVaults() {
  try {
    const url = `https://api.yearn.tools/vaults`;
    const vaults = yield r.call(request, url);
    yield r.put(a.vaultsLoaded(vaults));
  } catch (err) {
    console.log('Error reading vaults', err);
  }
}

export default function* initialize() {
  yield r.takeLatest(CONNECTION_CONNECTED, fetchVaults);
}
