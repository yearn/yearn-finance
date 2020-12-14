// import request from 'utils/request';
import comptrollerAbi from 'abi/creamComptroller.json';
import priceOracleAbi from 'abi/creamPriceOracle.json';
import { APP_READY } from 'containers/App/constants';
import {
  COMPTROLLER_ADDRESS,
  PRICE_ORACLE_ADDRESS,
} from 'containers/Cream/constants';

import { addContracts } from 'containers/DrizzleProvider/actions';
import { takeLatest, put } from 'redux-saga/effects';
// import { coverDataLoaded } from './actions';
// import { COVER_DATA_LOADED } from './constants';

// function* fetchCoverData() {
//   try {
//     const url = `https://api.coverprotocol.com/protocol_data/production`;
//     const response = yield call(request, url);
//     yield put(coverDataLoaded(response));
//   } catch (err) {
//     console.log('Error reading vaults', err);
//   }
// }

// function* fetchCreamData(action) {
//   const { payload } = action;
//   const claimTokens = {};
//   const collateralTokens = {};
//   const account = yield select(selectAccount());
//   const addTokens = protocol => {
//     const { claimAddress } = protocol.coverObjects[protocol.claimNonce].tokens;
//     const { collaterals } = protocol;
//     const setCollateral = collateralArr => {
//       const collateralAddress = collateralArr[0];
//       const collateralActive = collateralArr[1];
//       if (collateralActive) {
//         collateralTokens[collateralAddress] = true;
//       }
//     };
//     _.each(collaterals, setCollateral);
//     claimTokens[claimAddress] = true;
//   };
//   _.each(payload.protocols, addTokens);
//
//   const claimTokenAddresses = Object.keys(claimTokens);
//   const collateralTokenAddresses = Object.keys(collateralTokens);
//   const contracts = [
//     {
//       namespace: 'coverTokens',
//       abi: erc20Abi,
//       addresses: claimTokenAddresses,
//       metadata: { tokenType: 'CLAIM' },
//       readMethods: [
//         {
//           name: 'balanceOf',
//           args: [account],
//         },
//       ],
//     },
//     {
//       namespace: 'tokens',
//       abi: erc20Abi,
//       addresses: collateralTokenAddresses,
//       metadata: { tokenType: 'collateral' },
//       readMethods: [
//         {
//           name: 'balanceOf',
//           args: [account],
//         },
//       ],
//     },
//   ];
//
//   yield put(addContracts(contracts));
// }

function* fetchCreamMarketData() {
  const contracts = [
    {
      namespace: 'creamComptroller',
      abi: comptrollerAbi,
      addresses: [COMPTROLLER_ADDRESS],
      syncOnce: true,

      readMethods: [
        {
          name: 'getAllMarkets',
        },
      ],
    },
    {
      namespace: 'creamOracle',
      abi: priceOracleAbi,
      addresses: [PRICE_ORACLE_ADDRESS],
      readMethods: [
        {
          name: 'yVaults', // random method just for now
        },
      ],
    },
  ];

  yield put(addContracts(contracts));
}

function* processCreamMarketDataResponse(action) {
  const { payload } = action;
  console.log(payload);

  let creamMarkets;

  payload.forEach(batchResult => {
    if (batchResult.namespace === 'creamComptroller') {
      console.log(batchResult);
      creamMarkets = batchResult.getAllMarkets;
      console.log(creamMarkets);
    }

    if (batchResult.namespace === 'creamOracle') {
      // Not seeing this yet.... not sure why
      console.log(batchResult);
    }
  });

  // Need to add creamMarkets contract next....
}

export default function* watchers() {
  yield takeLatest(APP_READY, fetchCreamMarketData);
  yield takeLatest('BATCH_CALL_RESPONSE', processCreamMarketDataResponse);

  // yield takeLatest(COVER_DATA_LOADED, coverDataLoadedSaga);
}
