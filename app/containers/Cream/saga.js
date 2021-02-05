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
  CREAM_ENTER_MARKETS,
  CREAM_SUPPLY,
  CREAM_BORROW,
  CREAM_REPAY,
  CREAM_WITHDRAW,
  CREAM_APPROVE,
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
import { approveTxSpend } from 'utils/contracts';

// const MAX_UINT256 = new BigNumber(2).pow(256).minus(1).toFixed(0);

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
      writeMethods: [
        {
          name: 'enterMarkets',
        },
        {
          name: 'mint',
        },
        {
          name: 'borrow',
        },
        {
          name: 'repayBorrow',
        },
        {
          name: 'redeem',
        },
      ],
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
      writeMethods: [
        {
          name: 'approve',
        },
      ],
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
        // {
        //   name: 'allowance',
        //   args: [account, cTokenAddresses],
        // },
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

function* supply({ crTokenContract, amount }) {
  const account = yield select(selectAccount());
  try {
    yield call(crTokenContract.methods.mint.cacheSend, amount, {
      from: account,
    });
  } catch (err) {
    console.error(err);
  }
}

function* borrow({ crTokenContract, amount }) {
  const account = yield select(selectAccount());
  try {
    yield call(crTokenContract.methods.borrow.cacheSend, amount, {
      from: account,
    });
  } catch (err) {
    console.error(err);
  }
}

function* repay({ crTokenContract, amount }) {
  const account = yield select(selectAccount());
  try {
    yield call(crTokenContract.methods.repayBorrow.cacheSend, amount, {
      from: account,
    });
  } catch (err) {
    console.error(err);
  }
}

function* withdraw({ crTokenContract, amount }) {
  const account = yield select(selectAccount());
  try {
    yield call(crTokenContract.methods.redeemUnderlying.cacheSend, amount, {
      from: account,
    });
  } catch (err) {
    console.error(err);
  }
}

function* executeEnterMarkets({
  creamCTokenAddress,
  creamComptrollerContract,
}) {
  const account = yield select(selectAccount());
  try {
    yield call(
      creamComptrollerContract.methods.enterMarkets.cacheSend,
      [creamCTokenAddress],
      { from: account },
    );
  } catch (error) {
    console.error(error);
  }
}

function* approve({ tokenContract, creamCTokenAddress }) {
  const account = yield select(selectAccount());
  try {
    yield call(approveTxSpend, tokenContract, account, creamCTokenAddress);
  } catch (error) {
    console.error(error);
  }
}

export default function* watchers() {
  yield takeLatest(APP_READY, subscribeToCreamData);
  yield takeLatest(INITIALIZE_CREAM, subscribeToCreamData);
  yield takeLatest(CREAM_ENTER_MARKETS, executeEnterMarkets);
  yield takeLatest(CREAM_SUPPLY, supply);
  yield takeLatest(CREAM_BORROW, borrow);
  yield takeLatest(CREAM_REPAY, repay);
  yield takeLatest(CREAM_WITHDRAW, withdraw);
  yield takeLatest(CREAM_APPROVE, approve);
}
