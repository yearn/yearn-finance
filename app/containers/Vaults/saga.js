import request from 'utils/request';
import { APP_INITIALIZED } from 'containers/App/constants';
import { call, put, takeLatest } from 'redux-saga/effects';
import { vaultsLoaded } from './actions';

function* fetchVaults() {
  try {
    const url = `https://api.yearn.tools/vaults?apy=true`;
    const vaults = yield call(request, url);
    yield put(vaultsLoaded(vaults));
  } catch (err) {
    console.log('Error reading vaults', err);
  }
}

export default function* initialize() {
  yield takeLatest(APP_INITIALIZED, fetchVaults);
}
