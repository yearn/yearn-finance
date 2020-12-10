import request from 'utils/request';
import { takeLatest, select, put, call } from 'redux-saga/effects';
import erc20Abi from 'abi/erc20.json';
import { addContracts } from 'containers/DrizzleProvider/actions';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import { coverDataLoaded } from './actions';
import { COVER_DATA_FETCH, COVER_DATA_LOADED } from './constants';

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
  const claimTokens = [];
  // const noClaimTokens = [];
  const account = yield select(selectAccount());
  const addTokens = protocol => {
    // const { claimAddress, noClaimAddress } = protocol.coverObjects[
    const { claimAddress } = protocol.coverObjects[protocol.claimNonce].tokens;
    claimTokens.push(claimAddress);
    // noClaimTokens.push(noClaimAddress);
  };
  _.each(payload.protocols, addTokens);

  const contracts = [
    {
      namespace: 'coverTokens',
      abi: erc20Abi,
      addresses: claimTokens,
      metadata: { tokenType: 'CLAIM' },
      readMethods: [
        {
          name: 'balanceOf',
          args: [account],
        },
      ],
    },
    // {
    //   namespace: 'coverTokens',
    //   abi: erc20Abi,
    //   addresses: claimTokens,
    //   metadata: { tokenType: 'NOCLAIM' },
    //   readMethods: [
    //     {
    //       name: 'balanceOf',
    //       args: [account],
    //     },
    //   ],
    // },
  ];

  yield put(addContracts(contracts));
}

export default function* watchers() {
  yield takeLatest(COVER_DATA_FETCH, fetchCoverData);
  yield takeLatest(COVER_DATA_LOADED, coverDataLoadedSaga);
}
