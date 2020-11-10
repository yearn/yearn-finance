import { TOGGLE_DEV_MODE, UNLOCK_DEV_MODE } from './constants';

export function toggleDevMode() {
  return {
    type: TOGGLE_DEV_MODE,
  };
}

export function unlockDevMode() {
  return {
    type: UNLOCK_DEV_MODE,
  };
}
