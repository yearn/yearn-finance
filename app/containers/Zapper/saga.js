import { takeLatest, take, select, put, call } from 'redux-saga/effects';
import { channel } from 'redux-saga';
import BigNumber from 'bignumber.js';
import { first, get } from 'lodash';
import request from 'utils/request';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import { selectContractData } from 'containers/App/selectors';
import { MAX_UINT256 } from 'containers/Cover/constants';
import {
  YVBOOST_ETH_PJAR,
  PICKLEJAR_ADDRESS,
} from 'containers/Vaults/constants';
import { ACCOUNT_UPDATED } from 'containers/ConnectionProvider/constants';
import { zapperDataLoaded, zapInError, zapOutError } from './actions';
import {
  INIT_ZAPPER,
  ZAP_IN,
  ETH_ADDRESS,
  ZAP_OUT,
  MIGRATE_PICKLE_GAUGE,
  DEFAULT_SLIPPAGE,
  ZAPPER_AFFILIATE_ADDRESS,
} from './constants';
const ZAPPER_API = 'https://api.zapper.fi/v1';
const { ZAPPER_APIKEY } = process.env;

const transactionChannel = channel();

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
    const yvaults = yield call(
      request,
      getZapperApi('/protocols/yearn/token-market-data', { type: 'vault' }),
    );
    const pickleVaults = yield call(
      request,
      getZapperApi('/protocols/pickle/token-market-data', {
        addresses: [account],
        type: 'vault',
      }),
    );
    const vaults = yvaults.concat(pickleVaults);
    const balancesResponse = yield call(
      request,
      getZapperApi('/protocols/tokens/balances', {
        addresses: [account],
      }),
    );
    const balances = get(
      first(
        balancesResponse[account.toLowerCase()].products.filter(
          ({ label }) => label === 'Tokens',
        ),
      ),
      'assets',
    );

    yield put(
      zapperDataLoaded({
        tokens,
        vaults,
        balances,
        pickleVaults,
      }),
    );
  } catch (err) {
    console.log(err);
  }
}
function* migratePickleGauge(action) {
  const {
    pickleDepositAmount,
    zapPickleMigrateContract,
    tokenContract,
    allowance,
  } = action.payload;
  const account = yield select(selectAccount());

  // https://api.zapper.fi/v1/vault-stats/pickle?api_key=5d1237c2-3840-4733-8e92-c5a58fe81b88
  let lpyveCRVVaultv2 = {};
  let lpyveCRVDAO = {};
  try {
    // yield call(oldPickleGaugeContract.methods.exit().send, { from: account });
    if (allowance === 0 || allowance === '0' || !allowance) {
      yield call(
        tokenContract.methods.approve(
          // eslint-disable-next-line no-underscore-dangle
          zapPickleMigrateContract._address,
          MAX_UINT256,
        ).send,
        { from: account },
      );
    }
    const picklePrices = yield call(
      request,
      getZapperApi('/protocols/pickle/token-market-data', {
        addresses: [account],
        type: 'vault',
      }),
    );
    //    incomingLP={quantity of pSUSHI ETH / yveCRV-DAO tokens sent by user}
    // minPTokens={(quantity of pSUSHI ETH / yveCRV-DAO tokens sent by user * pSUSHI ETH / yveCRV-DAO pricePerToken) /
    //  pSUSHI yveCRV Vault (v2) / ETH pricePerToken}
    picklePrices.map((pp) => {
      // PICKLEJAR_ADDRESS
      if (pp.address.toLowerCase() === YVBOOST_ETH_PJAR.toLocaleLowerCase()) {
        lpyveCRVVaultv2 = pp;
      } else if (
        pp.address.toLowerCase() === PICKLEJAR_ADDRESS.toLocaleLowerCase()
      ) {
        lpyveCRVDAO = pp;
      }
      return pp;
    });
    const minPTokens =
      (new BigNumber(pickleDepositAmount).dividedBy(10 ** 18) *
        lpyveCRVDAO.price) /
      lpyveCRVVaultv2.price;
    console.log('minPTokens', minPTokens);
    console.log('minPTokens depositamout', pickleDepositAmount);
    const minPTokensFinal = new BigNumber(minPTokens)
      .times(10 ** 18)
      .dividedBy(10);
    yield call(
      zapPickleMigrateContract.methods.Migrate(
        pickleDepositAmount,
        minPTokensFinal,
      ).send,
      { from: account },
    );
  } catch (error) {
    console.error('failed exit', error);
  }
}

function* zapIn(action) {
  const {
    web3,
    poolAddress,
    sellTokenAddress,
    sellAmount,
    protocol,
  } = action.payload;

  const zapProtocol = protocol || 'yearn';

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
        getZapperApi(`/zap-in/${zapProtocol}/approval-state`, {
          sellTokenAddress,
          ownerAddress,
        }),
      );

      if (!approvalState.isApproved || approvalState.allowance === '0') {
        const approvalTransaction = yield call(
          request,
          getZapperApi(`/zap-in/${zapProtocol}/approval-transaction`, {
            gasPrice,
            sellTokenAddress,
            ownerAddress,
          }),
        );
        const broadcastTransaction = (err, transactionHash) => {
          if (err) {
            return;
          }
          transactionChannel.put({
            transactionHash,
            contractAddress: approvalTransaction.to,
          });
        };
        yield call(sendTx, web3, approvalTransaction, broadcastTransaction);
      }
    }

    const zapInTransaction = yield call(
      request,
      getZapperApi(`/zap-in/${zapProtocol}/transaction`, {
        slippagePercentage: DEFAULT_SLIPPAGE,
        gasPrice,
        poolAddress,
        sellTokenAddress,
        sellAmount,
        ownerAddress,
        affiliateAddress: ZAPPER_AFFILIATE_ADDRESS,
      }),
    );
    const broadcastTransaction = (err, transactionHash) => {
      if (err) {
        return;
      }
      transactionChannel.put({
        transactionHash,
        contractAddress: poolAddress,
      });
    };
    yield call(sendTx, web3, zapInTransaction, broadcastTransaction);
  } catch (error) {
    let errorMessage = '';
    if (error && error.message) {
      errorMessage = error.message;
    } else {
      errorMessage =
        'This means there is not enough liquidity for this token or Zapper may be down. Try with DAI, ETH, USDC or USDT as they offer the more liquidity. ';
    }
    yield put(
      zapInError({ message: `Zap Failed. ${errorMessage}`, poolAddress }),
    );
  }
}

export function* watchForTransactions() {
  while (true) {
    const action = yield take(transactionChannel);
    const { transactionHash, contractAddress } = action;
    yield put({
      type: 'TX_BROADCASTED',
      txHash: transactionHash,
      contractAddress,
    });
  }
}

function* zapOut(action) {
  const {
    web3,
    vaultContract,
    withdrawalAmount,
    decimals,
    selectedWithdrawToken,
    protocol,
  } = action.payload;

  const zapProtocol = protocol || 'yearn';

  const ownerAddress = yield select(selectAccount());
  const vaultContractData = yield select(
    selectContractData(vaultContract.address),
  );

  const poolAddress = vaultContract.address.toLowerCase();

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
      getZapperApi(`/zap-out/${zapProtocol}/approval-state`, {
        sellTokenAddress: vaultContract.address.toLowerCase(),
        ownerAddress,
      }),
    );

    if (!approvalState.isApproved || approvalState.allowance === '0') {
      const approvalTransaction = yield call(
        request,
        getZapperApi(`/zap-out/${zapProtocol}/approval-transaction`, {
          gasPrice,
          sellTokenAddress: vaultContract.address.toLowerCase(),
          ownerAddress,
        }),
      );

      const broadcastTransaction = (err, transactionHash) => {
        if (err) {
          return;
        }
        transactionChannel.put({
          transactionHash,
          contractAddress: poolAddress,
        });
      };
      yield call(sendTx, web3, approvalTransaction, broadcastTransaction);
    }

    const zapOutTransaction = yield call(
      request,
      getZapperApi(`/zap-out/${zapProtocol}/transaction`, {
        slippagePercentage: DEFAULT_SLIPPAGE,
        gasPrice,
        poolAddress,
        toTokenAddress: selectedWithdrawToken.address.toLowerCase(),
        sellAmount: sharesForWithdrawal,
        ownerAddress,
        affiliateAddress: ZAPPER_AFFILIATE_ADDRESS,
      }),
    );

    const broadcastTransaction = (err, transactionHash) => {
      if (err) {
        return;
      }
      transactionChannel.put({
        transactionHash,
        contractAddress: poolAddress,
      });
    };
    yield call(sendTx, web3, zapOutTransaction, broadcastTransaction);
  } catch (error) {
    console.log('Zap Failed', error);
    let errorMessage = '';
    if (error && error.message) {
      errorMessage = error.message;
    } else {
      errorMessage =
        'This means there is not enough liquidity for this token or Zapper may be down.';
    }
    yield put(
      zapOutError({ message: `Zap Failed. ${errorMessage}`, poolAddress }),
    );
  }
}

const sendTx = async (web3, transactionObject, callback) => {
  const txObj = transactionObject;
  const GASPRICES_API = 'https://api.blocknative.com/gasprices/blockprices';
  const HEADERS = {
    Authorization: process.env.BLOCKNATIVE_DAPP_ID,
  };
  const DEFAULT_CONFIDENCE_LEVEL = 95;

  const gasPrice = await web3.eth.getGasPrice();
  let estimatedPrice;
  try {
    const response = await request(GASPRICES_API, { headers: HEADERS });
    estimatedPrice = _.first(response.blockPrices).estimatedPrices.find(
      ({ confidence }) => confidence === DEFAULT_CONFIDENCE_LEVEL,
    );
  } catch (error) {
    console.log(error);
  }

  if (estimatedPrice) {
    delete txObj.gasPrice;
    txObj.maxPriorityFeePerGas = web3.utils.toWei(
      estimatedPrice.maxPriorityFeePerGas.toString(),
      'gwei',
    );
    txObj.maxFeePerGas = web3.utils.toWei(
      estimatedPrice.maxFeePerGas.toString(),
      'gwei',
    );
  }

  return web3.eth.sendTransaction(txObj, callback).catch((error) => {
    // Retry as a legacy tx, for specific error in metamask v10 + ledger transactions
    // Metamask RPC Error: Invalid transaction params: params specify an EIP-1559 transaction but the current network does not support EIP-1559
    if (error.code === -32602) {
      delete txObj.maxPriorityFeePerGas;
      delete txObj.maxFeePerGas;
      txObj.gasPrice = estimatedPrice
        ? web3.utils.toWei(estimatedPrice.price.toString(), 'gwei')
        : gasPrice;
      return web3.eth.sendTransaction(txObj, callback);
    }

    return Promise.reject(error);
  });
};

export default function* rootSaga() {
  yield takeLatest(INIT_ZAPPER, initializeZapper);
  yield takeLatest(INIT_ZAPPER, watchForTransactions);
  yield takeLatest(ACCOUNT_UPDATED, initializeZapper);
  yield takeLatest(ZAP_IN, zapIn);
  yield takeLatest(ZAP_OUT, zapOut);
  yield takeLatest(MIGRATE_PICKLE_GAUGE, migratePickleGauge);
}
