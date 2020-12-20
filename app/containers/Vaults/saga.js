import request from 'utils/request';
import { APP_INITIALIZED } from 'containers/App/constants';
import { call, put, takeLatest, select } from 'redux-saga/effects';
import { selectSelectedAccount } from 'containers/App/selectors';
import { vaultsLoaded } from './actions';

function* fetchVaults() {
  try {
    const selectedAccount = yield select(selectSelectedAccount);

    const userVaultStatisticsUrl = `https://api.yearn.tools/user/${selectedAccount}/vaults?statistics=true&apy=true`;
    const url = `https://api.yearn.tools/vaults?apy=true`;
    const userVaultStatistics = yield call(request, userVaultStatisticsUrl);
    const vaults = yield call(request, url);
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
    yield put(vaultsLoaded(vaultsWithUserStatistics));
  } catch (err) {
    console.log('Error reading vaults', err);
  }
}

export default function* initialize() {
  yield takeLatest(APP_INITIALIZED, fetchVaults);
}
