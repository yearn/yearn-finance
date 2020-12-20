import request from 'utils/request';
import { takeLatest, select, put, call } from 'redux-saga/effects';
import erc20Abi from 'abi/erc20.json';
import { addContracts } from 'containers/DrizzleProvider/actions';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import { ACCOUNT_UPDATED } from 'containers/ConnectionProvider/constants';
import { coverDataLoaded } from './actions';
import { COVER_DATA_LOADED, INITIALIZE_COVER } from './constants';

function* fetchCoverData() {
  try {
    const url = `https://api.coverprotocol.com/protocol_data/production`;
    const response = yield call(request, url);
    yield put(coverDataLoaded(response));
  } catch (err) {
    console.log('Error reading vaults', err);
  }
}

function* coverDataLoadedSaga(action) {
  const { payload } = action;
  const claimTokens = {};
  const collateralTokens = {};
  const account = yield select(selectAccount());
  const addTokens = protocol => {
    const { claimAddress } = protocol.coverObjects[protocol.claimNonce].tokens;
    const { collaterals } = protocol;
    const setCollateral = collateralArr => {
      const collateralAddress = collateralArr[0];
      const collateralActive = collateralArr[1];
      if (collateralActive) {
        collateralTokens[collateralAddress] = true;
      }
    };
    _.each(collaterals, setCollateral);
    claimTokens[claimAddress] = true;
  };
  _.each(payload.protocols, addTokens);

  const claimTokenAddresses = Object.keys(claimTokens);

  const collateralTokenAddresses = Object.keys(collateralTokens);

  const contracts = [
    {
      namespace: 'coverTokens',
      abi: erc20Abi,
      addresses: claimTokenAddresses,
      metadata: { tokenType: 'CLAIM' },
      readMethods: [
        {
          name: 'balanceOf',
          args: [account],
        },
      ],
    },
    {
      namespace: 'tokens',
      abi: erc20Abi,
      addresses: collateralTokenAddresses,
      metadata: { tokenType: 'collateral' },
      syncOnce: true,
      readMethods: [
        {
          name: 'name',
        },
        {
          name: 'decimals',
        },
        {
          name: 'balanceOf',
          args: [account],
        },
      ],
    },
  ];

  yield put(addContracts(contracts));
}

export default function* watchers() {
  yield takeLatest(ACCOUNT_UPDATED, fetchCoverData);
  yield takeLatest(INITIALIZE_COVER, fetchCoverData);
  yield takeLatest(COVER_DATA_LOADED, coverDataLoadedSaga);
}
