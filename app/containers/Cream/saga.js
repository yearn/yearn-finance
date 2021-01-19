import comptrollerAbi from 'abi/creamComptroller.json';
import priceOracleAbi from 'abi/creamPriceOracle.json';
import CErc20DelegatorAbi from 'abi/CErc20Delegator.json';
import erc20Abi from 'abi/erc20.json';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import { selectReady } from 'containers/App/selectors';
import { APP_READY } from 'containers/App/constants';
import {
  COMPTROLLER_ADDRESS,
  PRICE_ORACLE_ADDRESS,
  INITIALIZE_CREAM,
} from 'containers/Cream/constants';

import { addContracts } from 'containers/DrizzleProvider/actions';
import {
  takeLatest,
  put,
  call,
  select,
  setContext,
  getContext,
} from 'redux-saga/effects';

function* subscribeToCreamData(action) {
  const initialized = yield getContext('initialized');
  const appReady = yield select(selectReady());
  const web3 = _.get(action, 'web3');
  const batchCall = _.get(action, 'batchCall');
  if (initialized || !appReady || !web3) {
    return;
  }
  yield setContext({ initialized: true });
  const account = yield select(selectAccount());
  const creamComptroller = new web3.eth.Contract(
    comptrollerAbi,
    COMPTROLLER_ADDRESS,
  );
  const cTokenAddresses = yield call(
    creamComptroller.methods.getAllMarkets().call,
  );

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
    (item) => item.underlying[0].value,
  );

  const underlyingTokenMap = {};
  const addCyToken = (underlyingAddress, idx) => {
    underlyingTokenMap[underlyingAddress] = cTokenAddresses[idx];
  };
  _.each(underlyingTokenAddresses, addCyToken);

  const generateTokenSubscription = (
    cyTokenAddress,
    underlyingTokenAddress,
  ) => ({
    namespace: 'tokens',
    abi: erc20Abi,
    syncOnce: true,
    tags: ['creamUnderlyingTokens'],
    addresses: [underlyingTokenAddress],
    readMethods: [
      { name: 'name' },
      { name: 'symbol' },
      { name: 'decimals' },
      {
        name: 'balanceOf',
        args: [account],
      },
      {
        name: 'allowance',
        args: [account, cyTokenAddress],
      },
    ],
  });

  const tokenSubscriptions = _.map(
    underlyingTokenMap,
    generateTokenSubscription,
  );

  const subscriptions = [
    {
      namespace: 'creamComptroller',
      abi: comptrollerAbi,
      addresses: [COMPTROLLER_ADDRESS],
      readMethods: _.concat(
        [
          {
            name: 'getAssetsIn',
            args: [account],
          },
        ],
        _.map(cTokenAddresses, (cTokenAddress) => ({
          name: 'markets',
          args: [cTokenAddress],
        })),
      ),
    },
    {
      tags: ['creamCTokens'],
      abi: CErc20DelegatorAbi,
      addresses: cTokenAddresses,
      readMethods: [
        { name: 'name' },
        { name: 'symbol' },
        { name: 'decimals' },
        { name: 'borrowRatePerBlock' },
        { name: 'supplyRatePerBlock' },
        { name: 'exchangeRateStored' },
        { name: 'getCash' },
        {
          name: 'balanceOf',
          args: [account],
        },
        {
          name: 'borrowBalanceStored',
          args: [account],
        },
        { name: 'underlying' },
      ],
    },
    {
      namespace: 'creamOracle',
      addresses: [PRICE_ORACLE_ADDRESS],
      abi: priceOracleAbi,
      readMethods: _.map(cTokenAddresses, (cTokenAddress) => ({
        name: 'getUnderlyingPrice',
        args: [cTokenAddress],
      })),
    },
    ...tokenSubscriptions,
  ];

  yield put(addContracts(subscriptions));
}

export default function* watchers() {
  yield takeLatest(APP_READY, subscribeToCreamData);
  yield takeLatest(INITIALIZE_CREAM, subscribeToCreamData);
}
