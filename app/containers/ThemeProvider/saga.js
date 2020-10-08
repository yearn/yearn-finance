import { takeLatest } from 'redux-saga/effects';
import { CHANGE_THEME } from './constants';

export function* changeTheme(action) {
  const { theme } = action;
  localStorage.setItem('theme', theme);
}

export default function* watchers() {
  yield takeLatest(CHANGE_THEME, changeTheme);
}
