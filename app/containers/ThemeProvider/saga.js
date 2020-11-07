import { takeLatest, select } from 'redux-saga/effects';
import { TOGGLE_DARK_MODE } from './constants';
import { selectDarkMode } from './selectors';

export function* toggleDarkMode() {
  const mode = JSON.parse(yield select(selectDarkMode()));
  localStorage.setItem('darkMode', mode);
}

export default function* watchers() {
  yield takeLatest(TOGGLE_DARK_MODE, toggleDarkMode);
}
