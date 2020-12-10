import request from 'utils/request';
import { takeLatest, put, call } from 'redux-saga/effects';
import { coverDataLoaded } from './actions';
import { COVER_DATA_FETCH } from './constants';

function* fetchCoverData() {
  try {
    const url = `https://api.coverprotocol.com/protocol_data/production`;
    const response = yield call(request, url);
    yield put(coverDataLoaded(response));
  } catch (err) {
    console.log('Error reading vaults', err);
  }
}

export default function* watchers() {
  yield takeLatest(COVER_DATA_FETCH, fetchCoverData);
}
