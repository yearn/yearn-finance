import balancerPoolAbi from 'abi/balancerPool.json';
import erc20Abi from 'abi/erc20.json';
import BigNumber from 'bignumber.js';
import { selectContractData } from 'containers/App/selectors';
import { ACCOUNT_UPDATED } from 'containers/ConnectionProvider/constants';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import { addContracts } from 'containers/DrizzleProvider/actions';
import { takeLatest, select, put, call } from 'redux-saga/effects';
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
} from './constants';

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
    claimTokens[claimAddress] = claimPool;
  };
  _.each(payload.protocols, addTokens);

  const claimTokenAddresses = Object.keys(claimTokens);
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

  const contracts = [
    {
      namespace: 'coverTokens',
      abi: erc20Abi,
      addresses: claimTokenAddresses,
      metadata: { tokenType: 'CLAIM' },
      readMethods: [
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
  ];

  yield put(addContracts(contracts));
}

function* approveTxSpend(contract, spenderAddress) {
  const account = yield select(selectAccount());
  yield call(contract.methods.approve.cacheSend, spenderAddress, MAX_UINT256, {
    from: account,
  });
}

function* executeCoverBuy(
  claimPoolContract,
  daiAmount,
  claimTokenAddress,
  claimTokenTokenAmount,
) {
  const account = yield select(selectAccount());
  const daiData = yield select(selectContractData(DAI_ADDRESS));
  const claimTokenData = yield select(selectContractData(claimTokenAddress));
  const daiAmountRaw = new BigNumber(daiAmount).times(10 ** daiData.decimals);
  const claimTokenAmountRaw = new BigNumber(claimTokenTokenAmount).times(
    10 ** claimTokenData.decimals,
  );

  yield call(
    claimPoolContract.methods.swapExactAmountOut.cacheSend,
    DAI_ADDRESS,
    daiAmountRaw,
    claimTokenAddress,
    claimTokenAmountRaw,
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

  const claimTokenAddress =
    protocol.coverObjects[protocol.claimNonce].tokens.claimAddress;

  try {
    if (!poolAllowedToSpendDai) {
      yield call(approveTxSpend, daiContract, claimPoolContract.address);
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

export default function* watchers() {
  yield takeLatest(ACCOUNT_UPDATED, fetchCoverData);
  yield takeLatest(INITIALIZE_COVER, fetchCoverData);
  yield takeLatest(COVER_DATA_LOADED, coverDataLoadedSaga);
  yield takeLatest(BUY_COVER, buyCover);
}
