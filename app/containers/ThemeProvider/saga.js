import { takeLatest, select } from 'redux-saga/effects';
import { TOGGLE_DARK_MODE } from './constants';
import { makeSelectDarkMode } from './selectors';

export function* toggleDarkMode() {
  const mode = JSON.parse(yield select(makeSelectDarkMode()));
  localStorage.setItem('darkMode', mode);
}

export default function* watchers() {
  yield takeLatest(TOGGLE_DARK_MODE, toggleDarkMode);
}
