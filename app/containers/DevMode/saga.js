import { takeLatest, select } from 'redux-saga/effects';
import { TOGGLE_DEV_MODE } from './constants';
import { selectDevMode } from './selectors';

export function* toggleDevMode() {
  const mode = JSON.parse(yield select(selectDevMode()));
  localStorage.setItem('devMode', mode);
}

export default function* watchers() {
  yield takeLatest(TOGGLE_DEV_MODE, toggleDevMode);
}
