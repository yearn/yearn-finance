import { takeLatest } from 'redux-saga/effects';
import { TOGGLE_DEV_MODE, UNLOCK_DEV_MODE } from './constants';
// import { selectDevMode } from './selectors';

function* toggleDevMode() {
  const mode = JSON.parse(true);
  localStorage.setItem('devMode', mode);
}

function* unlockDevMode() {
  console.log('Welcome dev ;)');
  localStorage.setItem('devModeUnlocked', 'true');
}

export default function* watchers() {
  yield takeLatest(TOGGLE_DEV_MODE, toggleDevMode);
  yield takeLatest(UNLOCK_DEV_MODE, unlockDevMode);
}
