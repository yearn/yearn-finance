import { takeLatest, select } from 'redux-saga/effects';
import { TOGGLE_DARK_MODE, SET_THEME_MODE } from './constants';
import { selectDarkMode } from './selectors';

export function* setDarkMode() {
  const mode = JSON.parse(yield select(selectDarkMode()));
  localStorage.setItem('darkMode', mode);
}

export default function* watchers() {
  yield takeLatest(TOGGLE_DARK_MODE, setDarkMode);
  yield takeLatest(SET_THEME_MODE, setDarkMode);
}
