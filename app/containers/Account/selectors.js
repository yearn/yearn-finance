import { initialState } from './reducer';
import { createSelector } from 'reselect';

/**
 * Direct selector to the themeToggle state domain
 */
const selectAccount = state => state.account || initialState;

const makeSelectAddress = () =>
  createSelector(
    selectAccount,
    substate => substate.address,
  );

const makeSelectBalance = () =>
  createSelector(
    selectAccount,
    substate => substate.balance,
  );

export { selectAccount, makeSelectBalance, makeSelectAddress };
