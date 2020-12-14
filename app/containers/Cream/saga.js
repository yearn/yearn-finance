import comptrollerAbi from 'abi/creamComptroller.json';
import priceOracleAbi from 'abi/creamPriceOracle.json';
import CErc20DelegatorAbi from 'abi/CErc20Delegator.json';
import { APP_READY } from 'containers/App/constants';
import {
  COMPTROLLER_ADDRESS,
  PRICE_ORACLE_ADDRESS,
} from 'containers/Cream/constants';

import { addContracts } from 'containers/DrizzleProvider/actions';
import { takeLatest, put, call, select } from 'redux-saga/effects';

function* subscribeToCreamData(action) {
  const account = yield select(selectAccount());
  const { web3, batchCall } = action;
  const creamComptroller = new web3.eth.Contract(
    comptrollerAbi,
    COMPTROLLER_ADDRESS,
  );
  const cTokenAddresses = yield call(
    creamComptroller.methods.getAllMarkets().call,
  );
  yield put(creamCTokensLoaded(cTokenAddresses));

  const underlyingTokensResponse = yield call(
    [batchCall, batchCall.execute],
    [
      {
        namespace: 'underlyingTokens',
        abi: CErc20DelegatorAbi,
        addresses: cTokenAddresses,
        readMethods: [{ name: 'underlying' }],
      },
    ],
  );

  const underlyingTokenAddresses = _.map(
    underlyingTokensResponse,
    item => item.underlying,
  );

  const subscriptions = [
    {
      namespace: 'creamCTokens',
      abi: CErc20DelegatorAbi,
      addresses: cTokenAddresses,
      readMethods: [
        { name: 'name' },
        { name: 'decimals' },
        { name: 'borrowRatePerBlock' },
        { name: 'getCash' },
        {
          name: 'balanceOf',
          args: [account],
        },
        { name: 'underlying' },
      ],
    },
    {
      namespace: 'creamUnderlyingTokens',
      abi: erc20Abi,
      addresses: underlyingTokenAddresses,
      readMethods: [
        { name: 'name' },
        { name: 'symbol' },
        { name: 'decimals' },
        { name: 'balanceOf', args: [account] },
      ],
    },
  ];

  yield put(addContracts(contracts));
}

function* addCreamCTokens(creamCTokenAddresses) {
  const contracts = [
    {
      namespace: 'creamCTokens',
      abi: CErc20DelegatorAbi,
      addresses: creamCTokenAddresses,

      readMethods: [
        {
          name: 'borrowRatePerBlock',
        },
      ],
    },
  ];

  yield put(addContracts(contracts));
}

function* processCreamMarketDataResponse(action) {
  const { payload } = action;

  const creamComptrollerResult = _.find(payload, [
    'namespace',
    'creamComptroller',
  ]);
  if (!_.isUndefined(creamComptrollerResult)) {
    const creamCTokenAddresses = creamComptrollerResult.getAllMarkets;
    yield addCreamCTokens(creamCTokenAddresses);
  }

  const creamOracleResult = _.find(payload, ['namespace', 'creamOracle']);

  if (!_.isUndefined(creamOracleResult)) {
    // Not seeing this yet.... not sure why
  }
}

export default function* watchers() {
  yield takeLatest(APP_READY, fetchCreamMarketData);
  yield takeLatest('BATCH_CALL_RESPONSE', processCreamMarketDataResponse);
  yield takeLatest('BATCH_CALL_RESPONSE', processCreamMarketDataResponse);

  // yield takeLatest(COVER_DATA_LOADED, coverDataLoadedSaga);
}
