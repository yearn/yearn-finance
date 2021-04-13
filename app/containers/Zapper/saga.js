import { takeLatest, select, put, call } from 'redux-saga/effects';
import BigNumber from 'bignumber.js';
import request from 'utils/request';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import { selectContractData } from 'containers/App/selectors';
import { zapperDataLoaded, zapInError, zapOutError } from './actions';
import { INIT_ZAPPER, ZAP_IN, ETH_ADDRESS, ZAP_OUT } from './constants';

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

function* zapOut(action) {
  const {
    web3,
    slippagePercentage,
    vaultContract,
    withdrawalAmount,
    decimals,
    selectedWithdrawToken,
  } = action.payload;

  const ownerAddress = yield select(selectAccount());
  const vaultContractData = yield select(
    selectContractData(vaultContract.address),
  );

  const v2Vault = _.get(vaultContractData, 'pricePerShare');
  let sharesForWithdrawal;
  if (v2Vault) {
    const sharePrice = _.get(vaultContractData, 'pricePerShare');
    sharesForWithdrawal = new BigNumber(withdrawalAmount)
      .dividedBy(sharePrice / 10 ** decimals)
      .decimalPlaces(0)
      .toFixed(0);
  } else {
    const sharePrice = _.get(vaultContractData, 'getPricePerFullShare');
    sharesForWithdrawal = new BigNumber(withdrawalAmount)
      .dividedBy(sharePrice / 10 ** 18)
      .decimalPlaces(0)
      .toFixed(0);
  }

  try {
    const gasPrices = yield call(
      request,
      getZapperApi('/gas-price', {
        sellTokenAddress: vaultContract.address.toLowerCase(),
        ownerAddress,
      }),
    );
    const gasPrice = new BigNumber(gasPrices.fast).times(10 ** 9);

    const approvalState = yield call(
      request,
      getZapperApi('/zap-out/yearn/approval-state', {
        sellTokenAddress: vaultContract.address.toLowerCase(),
        ownerAddress,
      }),
    );

    if (!approvalState.isApproved) {
      const approvalTransaction = yield call(
        request,
        getZapperApi('/zap-out/yearn/approval-transaction', {
          gasPrice,
          sellTokenAddress: vaultContract.address.toLowerCase(),
          ownerAddress,
        }),
      );
      yield call(web3.eth.sendTransaction, approvalTransaction);
    }

    const zapOutTransaction = yield call(
      request,
      getZapperApi('/zap-out/yearn/transaction', {
        slippagePercentage,
        gasPrice,
        poolAddress: vaultContract.address.toLowerCase(),
        toTokenAddress: selectedWithdrawToken.address.toLowerCase(),
        sellAmount: sharesForWithdrawal,
        ownerAddress,
      }),
    );
    yield call(web3.eth.sendTransaction, zapOutTransaction);
  } catch (error) {
    console.log('Zap Failed', error);
    yield put(
      zapOutError({ message: `Zap Failed. ${error.message}`, vaultContract }),
    );
  }
}

export default function* rootSaga() {
  yield takeLatest(INIT_ZAPPER, initializeZapper);
  yield takeLatest(ZAP_IN, zapIn);
  yield takeLatest(ZAP_OUT, zapOut);
}
