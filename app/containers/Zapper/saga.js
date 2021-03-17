import { takeLatest, select, put, call } from 'redux-saga/effects';
import BigNumber from 'bignumber.js';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import request from 'utils/request';
import { zapperDataLoaded, zapInError } from './actions';
import { INIT_ZAPPER, ZAP_IN, ETH_ADDRESS } from './constants';

const ZAPPER_API = 'https://api.zapper.fi/v1';
const { ZAPPER_APIKEY } = process.env;

const isEth = (address) => address === ETH_ADDRESS;

const encodeParams = (params) =>
  Object.entries(params)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}[]=${value.join(',')}`;
      }

      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');

const getZapperApi = (endpoint, params) =>
  `${ZAPPER_API}${endpoint}?api_key=${ZAPPER_APIKEY}${
    params ? `&${encodeParams(params)}` : ''
  }`;

function* initializeZapper() {
  const account = yield select(selectAccount());

  try {
    const tokens = yield call(request, getZapperApi('/prices'));
    const vaults = yield call(request, getZapperApi('/vault-stats/yearn'));
    const balances = yield call(
      request,
      getZapperApi('/balances/tokens', {
        addresses: [account],
      }),
    );

    yield put(
      zapperDataLoaded({ tokens, vaults, balances: balances[account] }),
    );
  } catch (err) {
    console.log(err);
  }
}

function* zapIn(action) {
  const {
    web3,
    poolAddress,
    sellTokenAddress,
    sellAmount,
    slippagePercentage,
  } = action.payload;

  const ownerAddress = yield select(selectAccount());
  const isSellTokenEth = isEth(sellTokenAddress);

  try {
    const gasPrices = yield call(
      request,
      getZapperApi('/gas-price', {
        sellTokenAddress,
        ownerAddress,
      }),
    );
    const gasPrice = new BigNumber(gasPrices.fast).times(10 ** 9);

    if (!isSellTokenEth) {
      const approvalState = yield call(
        request,
        getZapperApi('/zap-in/yearn/approval-state', {
          sellTokenAddress,
          ownerAddress,
        }),
      );

      if (!approvalState.isApproved) {
        const approvalTransaction = yield call(
          request,
          getZapperApi('/zap-in/yearn/approval-transaction', {
            gasPrice,
            sellTokenAddress,
            ownerAddress,
          }),
        );
        yield call(web3.eth.sendTransaction, approvalTransaction);
      }
    }

    const zapInTransaction = yield call(
      request,
      getZapperApi('/zap-in/yearn/transaction', {
        slippagePercentage,
        gasPrice,
        poolAddress,
        sellTokenAddress,
        sellAmount,
        ownerAddress,
      }),
    );
    yield call(web3.eth.sendTransaction, zapInTransaction);
  } catch (error) {
    console.log('Zap Failed', error);
    yield put(
      zapInError({ message: `Zap Failed. ${error.message}`, poolAddress }),
    );
  }
}

export default function* rootSaga() {
  yield takeLatest(INIT_ZAPPER, initializeZapper);
  yield takeLatest(ZAP_IN, zapIn);
}
