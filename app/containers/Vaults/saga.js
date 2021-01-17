import BigNumber from 'bignumber.js';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import { approveTxSpend } from 'utils/contracts';
import request from 'utils/request';
import { APP_INITIALIZED } from 'containers/App/constants';
import { ACCOUNT_UPDATED } from 'containers/ConnectionProvider/constants';
import { call, put, takeLatest, select, all, take } from 'redux-saga/effects';
import {
  selectSelectedAccount,
  selectVaults,
  selectTokenAllowance,
  selectContractData,
} from 'containers/App/selectors';
import { vaultsLoaded, userVaultStatisticsLoaded } from './actions';
import {
  VAULTS_LOADED,
  WITHDRAW_FROM_VAULT,
  DEPOSIT_TO_VAULT,
} from './constants';

function* fetchVaults() {
  try {
    const url = `https://api.yearn.tools/vaults?apy=true`;
    const vaults = yield call(request, url);
    yield put(vaultsLoaded(vaults));
  } catch (err) {
    console.log('Error reading vaults', err);
  }
}

function* fetchUserVaultStatistics() {
  try {
    const selectedAccount = yield select(selectSelectedAccount());
    const vaults = yield select(selectVaults());

    const userVaultStatisticsUrl = `https://api.yearn.tools/user/${selectedAccount}/vaults?statistics=true&apy=true`;
    const userVaultStatistics = yield call(request, userVaultStatisticsUrl);
    const vaultsWithUserStatistics = vaults.reduce((current, next) => {
      const userDepositedInNextVault = userVaultStatistics.find(
        userVaultStatistic => next.vaultAlias === userVaultStatistic.vaultAlias,
      );
      if (userDepositedInNextVault) {
        return current.concat({ ...next, ...userDepositedInNextVault });
      }
      return current.concat(next);
    }, []);
    // console.log(vaultsWithUserStatistics);
    yield put(userVaultStatisticsLoaded(vaultsWithUserStatistics));
  } catch (err) {
    console.log('Error reading vaults', err);
  }
}

function* withdrawFromVault(action) {
  const { vaultContract, withdrawalAmount } = action.payload;

  const account = yield select(selectAccount());

  const vaultContractData = yield select(
    selectContractData(vaultContract.address),
  );

  const pricePerShare = _.get(vaultContractData, 'getPricePerFullShare');

  const sharesForWithdrawal = new BigNumber(withdrawalAmount)
    .dividedBy(pricePerShare / 10 ** 18)
    .decimalPlaces(0);

  try {
    yield call(vaultContract.methods.withdraw.cacheSend, sharesForWithdrawal, {
      from: account,
    });
  } catch (error) {
    console.error(error);
  }
}

function* depositToVault(action) {
  const { vaultContract, tokenContract, depositAmount } = action.payload;

  const account = yield select(selectAccount());
  const tokenAllowance = yield select(
    selectTokenAllowance(tokenContract.address, vaultContract.address),
  );

  const vaultAllowedToSpendToken = tokenAllowance > 0;

  try {
    if (!vaultAllowedToSpendToken) {
      yield call(approveTxSpend, tokenContract, account, vaultContract.address);
    }

    yield call(vaultContract.methods.deposit.cacheSend, depositAmount, {
      from: account,
    });
  } catch (error) {
    console.error(error);
  }
}

export default function* initialize() {
  yield takeLatest([APP_INITIALIZED], fetchVaults);
  // Wait for these two to have already executed
  yield all([take(ACCOUNT_UPDATED), take(VAULTS_LOADED)]);
  yield fetchUserVaultStatistics();
  yield takeLatest(WITHDRAW_FROM_VAULT, withdrawFromVault);
  yield takeLatest(DEPOSIT_TO_VAULT, depositToVault);
}
