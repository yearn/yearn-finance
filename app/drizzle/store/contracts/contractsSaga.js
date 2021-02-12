import { END, eventChannel } from 'redux-saga';
import { call, put, select, take, takeEvery, all } from 'redux-saga/effects';
import erc20Abi from 'abi/erc20.json';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import { addContracts } from 'containers/DrizzleProvider/actions';
import * as EventActions from './constants';
import {
  selectRelevantAdressesByContract,
  selectSubscriptionsByAddresses,
} from '../../../containers/App/selectors';
import { initializeCover } from '../../../containers/Cover/actions';
import { initializeCream } from '../../../containers/Cream/actions';

/*
 * Events
 */

export function createContractEventChannel({
  contract,
  eventName,
  eventOptions,
}) {
  const name = contract.contractName;

  return eventChannel((emit) => {
    const eventListener = contract.events[eventName](eventOptions)
      .on('data', (event) => {
        emit({ type: EventActions.EVENT_FIRED, name, event });
      })
      .on('changed', (event) => {
        emit({ type: EventActions.EVENT_CHANGED, name, event });
      })
      .on('error', (error) => {
        emit({ type: EventActions.EVENT_ERROR, name, error });
        emit(END);
      });

    const unsubscribe = () => {
      eventListener.removeListener(eventName);
    };

    return unsubscribe;
  });
}

function* callListenForContractEvent({ contract, eventName, eventOptions }) {
  const contractEventChannel = yield call(createContractEventChannel, {
    contract,
    eventName,
    eventOptions,
  });

  while (true) {
    const event = yield take(contractEventChannel);
    yield put(event);
  }
}

/*
 * Send and Cache
 */

// function createTxChannel({
//   txObject,
//   stackId,
//   sendArgs = {},
//   contractName,
//   stackTempKey,
// }) {
//   let persistTxHash;

//   return eventChannel(emit => {
//     const txPromiEvent = txObject
//       .send(sendArgs)
//       .on('transactionHash', txHash => {
//         persistTxHash = txHash;

//         emit({ type: 'TX_BROADCASTED', txHash, stackId });
//         emit({ type: 'CONTRACT_SYNC_IND', contractName });
//       })
//       .on('confirmation', (confirmationNumber, receipt) => {
//         emit({
//           type: 'TX_CONFIRMAITON',
//           confirmationReceipt: receipt,
//           txHash: persistTxHash,
//         });
//       })
//       .on('receipt', receipt => {
//         emit({
//           type: 'TX_SUCCESSFUL',
//           receipt,
//           txHash: persistTxHash,
//         });
//         emit(END);
//       })
//       .on('error', (error, receipt) => {
//         console.error(error);
//         console.error(receipt);

//         emit({ type: 'TX_ERROR', error, stackTempKey });
//         emit(END);
//       });

//     const unsubscribe = () => {
//       txPromiEvent.off();
//     };

//     return unsubscribe;
//   });
// }

// function isSendOrCallOptions(options) {
//   if ('from' in options) return true;
//   if ('gas' in options) return true;
//   if ('gasPrice' in options) return true;
//   if ('value' in options) return true;

//   return false;
// }

function* executeBatchCall(action) {
  const { request, batchCall } = action;
  const requestNotEmpty = _.size(request);
  if (requestNotEmpty) {
    const response = yield batchCall.execute(request);
    yield put({ type: 'BATCH_CALL_RESPONSE', payload: response });
  }
}

function* processResponse(action) {
  const { payload, drizzle } = action;
  const account = yield select(selectAccount());
  const responseItemsWithTokens = _.filter(payload, (item) => item.token);
  const findNewTokens = (acc, responseItem) => {
    const { address } = responseItem;
    const token = _.get(responseItem, 'token[0].value');
    const tokenContract = drizzle.findContractByAddress(token.toLowerCase());
    if (!tokenContract) {
      acc.push({ address, token });
    }
    return acc;
  };
  const newTokenContracts = _.reduce(
    responseItemsWithTokens,
    findNewTokens,
    [],
  );

  const generateSubscription = (contract) => {
    const { address: vaultAddress, token } = contract;
    return {
      namespace: 'tokens',
      abi: erc20Abi,
      syncOnce: true,
      addresses: [token],
      readMethods: [
        {
          name: 'balanceOf',
          args: [account],
        },
        {
          name: 'allowance',
          args: [account, vaultAddress],
        },
      ],
    };
  };
  const tokenSubscriptions = _.map(newTokenContracts, generateSubscription);
  if (tokenSubscriptions.length) {
    yield put(addContracts(tokenSubscriptions));
  }
}

function* processAdressesToUpdate(action) {
  const { contractAddress } = action;

  const { type, relevantAddresses } = yield select(
    selectRelevantAdressesByContract(contractAddress),
  );

  if (type === 'cover') {
    yield put(initializeCover());
  } else if (type === 'cream') {
    yield put(initializeCream());
  } else {
    const subscriptions = yield select(
      selectSubscriptionsByAddresses(relevantAddresses),
    );
    yield all([
      put({ type: 'UPDATE_ETH_BALANCE' }),
      put({ type: 'BATCH_CALL_REQUEST', request: subscriptions }),
    ]);
  }
}

function* contractsSaga() {
  yield takeEvery('BATCH_CALL_REQUEST', executeBatchCall);
  yield takeEvery('BATCH_CALL_RESPONSE', processResponse);
  yield takeEvery('LISTEN_FOR_EVENT', callListenForContractEvent);
  yield takeEvery('PROCESS_ADDRESSES_TO_UPDATE', processAdressesToUpdate);
  yield takeEvery('TX_SUCCESSFUL', processAdressesToUpdate);
}

export default contractsSaga;
