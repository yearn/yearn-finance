import comptrollerAbi from 'abi/creamComptroller.json';
import CErc20DelegatorAbi from 'abi/CErc20Delegator.json';
import erc20Abi from 'abi/erc20.json';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import { APP_READY } from 'containers/App/constants';
import { COMPTROLLER_ADDRESS } from 'containers/Cream/constants';

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

  yield put(addContracts(subscriptions));
}

export default function* watchers() {
  yield takeLatest(APP_READY, subscribeToCreamData);
}
