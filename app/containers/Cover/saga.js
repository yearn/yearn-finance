import balancerPoolAbi from 'abi/balancerPool.json';
import erc20Abi from 'abi/erc20.json';
import BigNumber from 'bignumber.js';
import { selectContractData } from 'containers/App/selectors';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import { addContracts } from 'containers/DrizzleProvider/actions';
import { takeLatest, select, put, call } from 'redux-saga/effects';
import { approveTxSpend } from 'utils/contracts';
import { getClaimPool } from 'utils/cover';
import request from 'utils/request';
import Web3 from 'web3';
import { coverDataLoaded } from './actions';
import {
  COVER_DATA_LOADED,
  INITIALIZE_COVER,
  BUY_COVER,
  DAI_ADDRESS,
  MAX_UINT256,
  SELL_COVER,
} from './constants';

function* fetchCoverData(action) {
  const web3 = _.get(action, 'web3');
  if (!web3) {
    return;
  }
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

  const filteredProtocols = _.filter(payload.protocols, (protocol) => {
    const claimAddress = _.get(
      protocol,
      `coverObjects[${protocol.claimNonce}].tokens`,
    );
    return claimAddress;
  });

  const claimTokens = {};
  const collateralTokens = {};
  const account = yield select(selectAccount());
  const addTokens = (protocol) => {
    const { claimAddress } = protocol.coverObjects[protocol.claimNonce].tokens;
    const { collaterals } = protocol;
    const setCollateral = (collateralArr) => {
      const collateralAddress = collateralArr[0];
      const collateralActive = collateralArr[1];
      if (collateralActive) {
        collateralTokens[collateralAddress] = true;
      }
    };
    _.each(collaterals, setCollateral);
    const claimPool = getClaimPool(payload.poolData, claimAddress);
    if (claimPool.noData) {
      console.error(
        `No Claim Pool Available for ${protocol.protocolName} - ${claimAddress}`,
      );
    } else {
      claimTokens[claimAddress] = claimPool;
    }
  };
  _.each(filteredProtocols, addTokens);

  const claimPools = Object.values(claimTokens);

  const extractAddress = (pool) => Web3.utils.toChecksumAddress(pool.address);
  const claimPoolAddresses = _.map(claimPools, extractAddress);

  const collateralTokenAddresses = Object.keys(collateralTokens);

  const generateClaimPoolAllowanceReadMethods = (address) => ({
    name: 'allowance',
    args: [account, address],
  });

  const claimPoolAllowanceReadMethods = _.map(
    claimPoolAddresses,
    generateClaimPoolAllowanceReadMethods,
  );

  // Every cover token subscription needs to track the allowance of its claim
  // pool too spend users cover tokens. So need to generate dynamically.
  const coverTokenSubscriptions = _.map(
    claimTokens,
    (claimPool, claimTokenAddress) => {
      const claimPoolAddress = Web3.utils.toChecksumAddress(claimPool.address);
      return {
        namespace: 'coverTokens',
        abi: erc20Abi,
        addresses: [claimTokenAddress],
        metadata: { tokenType: 'CLAIM' },
        readMethods: [
          {
            name: 'decimals',
          },
          {
            name: 'balanceOf',
            args: [account],
          },
          {
            name: 'allowance',
            args: [account, claimPoolAddress],
          },
        ],
      };
    },
  );

  const contracts = _.concat(coverTokenSubscriptions, [
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
    {
      namespace: 'tokens',
      abi: erc20Abi,
      addresses: [DAI_ADDRESS],
      syncOnce: true,
      readMethods: claimPoolAllowanceReadMethods,
    },
    {
      // No methods to read for pools, these are only added so we can access the
      // balancer claim pool contracts as drizzle contracts later to enable
      // access to cacheSend method so user can see tx notifications.
      namespace: 'coverClaimPools',
      abi: balancerPoolAbi,
      addresses: claimPoolAddresses,
    },
  ]);
  yield put(addContracts(contracts));
}

function* executeCoverBuy(
  claimPoolContract,
  daiAmount,
  claimTokenAddress,
  amount,
) {
  const account = yield select(selectAccount());
  const daiData = yield select(selectContractData(DAI_ADDRESS));
  const daiAmountRaw = new BigNumber(daiAmount)
    .times(10 ** daiData.decimals)
    .toFixed(0);

  yield call(
    claimPoolContract.methods.swapExactAmountOut.cacheSend,
    DAI_ADDRESS,
    daiAmountRaw,
    claimTokenAddress,
    amount,
    MAX_UINT256,
    {
      from: account,
    },
  );
}

function* buyCover(action) {
  const {
    poolAllowedToSpendDai,
    protocol,
    claimPoolContract,
    daiContract,
    amount: claimTokenTokenAmount,
    equivalentTo: daiAmount,
  } = action.payload;

  const account = yield select(selectAccount());

  const claimTokenAddress =
    protocol.coverObjects[protocol.claimNonce].tokens.claimAddress;

  try {
    if (!poolAllowedToSpendDai) {
      yield call(
        approveTxSpend,
        daiContract,
        account,
        claimPoolContract.address,
      );
    }

    yield call(
      executeCoverBuy,
      claimPoolContract,
      daiAmount,
      claimTokenAddress,
      claimTokenTokenAmount,
    );
  } catch (error) {
    console.error(error);
  }
}

function* executeCoverSell(claimPoolContract, claimTokenContract, amount) {
  const account = yield select(selectAccount());

  yield call(
    claimPoolContract.methods.swapExactAmountIn.cacheSend,
    claimTokenContract.address,
    amount,
    DAI_ADDRESS,
    0,
    MAX_UINT256,
    {
      from: account,
    },
  );
}

function* sellCover(action) {
  const {
    poolAllowedToSpendCoverToken,
    claimPoolContract,
    claimTokenContract,
    amount,
  } = action.payload;

  const account = yield select(selectAccount());

  try {
    if (!poolAllowedToSpendCoverToken) {
      yield call(
        approveTxSpend,
        claimTokenContract,
        account,
        claimPoolContract.address,
      );
    }

    yield call(executeCoverSell, claimPoolContract, claimTokenContract, amount);
  } catch (error) {
    console.error(error);
  }
}

export default function* watchers() {
  yield takeLatest('APP_READY', fetchCoverData);
  yield takeLatest(INITIALIZE_COVER, fetchCoverData);
  yield takeLatest(COVER_DATA_LOADED, coverDataLoadedSaga);
  yield takeLatest(BUY_COVER, buyCover);
  yield takeLatest(SELL_COVER, sellCover);
}
