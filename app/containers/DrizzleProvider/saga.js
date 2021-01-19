import {
  select,
  call,
  put,
  setContext,
  getContext,
  all,
  takeEvery,
} from 'redux-saga/effects';
import { getReadMethods, getWriteMethods } from 'utils/contracts';
import { getCachedAbi } from 'utils/abiStorage';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import { addContracts as addContractsAction } from './actions';
import {
  DELETE_CONTRACT,
  ADD_WATCHED_CONTRACTS,
  DRIZZLE_ADD_CONTRACTS,
} from './constants';

function* addContract(
  contractAddress,
  abi,
  events,
  namespace,
  metadata,
  tags,
  readMethods,
  writeMethods,
  allReadMethods,
  allWriteMethods,
) {
  // console.log('add contract', contractAddress, readMethods);
  const web3 = yield getContext('web3');
  const drizzle = yield getContext('drizzle');
  let newAbi = abi;
  if (!abi) {
    newAbi = yield getCachedAbi(contractAddress);
  }

  const allAbiReadMethods = getReadMethods(newAbi);
  const allAbiWriteMethods = getWriteMethods(newAbi);
  let newReadMethods = _.clone(readMethods) || [];
  let newWriteMethods = _.clone(writeMethods) || [];

  const addField = (field, originalFields) => {
    const existingField = _.find(originalFields, { name: field.name });
    if (!existingField) {
      originalFields.push(field);
    }
  };

  const mergeAbiFieldData = (method, abiFields) => {
    const { name } = method;
    let newMethod = method;
    const abiField = _.find(abiFields, { name });
    if (abiField) {
      newMethod = _.extend(method, abiField);
    }
    return newMethod;
  };

  newReadMethods = _.map(newReadMethods, (method) =>
    mergeAbiFieldData(method, allAbiReadMethods),
  );
  newWriteMethods = _.map(newWriteMethods, (method) =>
    mergeAbiFieldData(method, allAbiWriteMethods),
  );

  if (allReadMethods) {
    _.each(allAbiReadMethods, (field) => addField(field, newReadMethods));
  }
  if (allWriteMethods) {
    _.each(allAbiWriteMethods, (field) => addField(field, newWriteMethods));
  }

  const contract = new web3.eth.Contract(newAbi, contractAddress);

  const contractConfig = {
    contractName: contractAddress,
    web3Contract: contract,
  };

  yield drizzle.addContract(
    contractConfig,
    events,
    namespace,
    metadata,
    tags,
    newReadMethods.reverse(),
    newWriteMethods.reverse(),
  );
  // const drizzleContract = drizzle.contracts[contractAddress];
}

function* addWatchedContracts(action) {
  const addressesWithoutSpaces = action.addresses.replace(' ', '');
  const contractAddresses = addressesWithoutSpaces.split(',');
  const watchedContracts = JSON.parse(
    localStorage.getItem('watchedContracts') || '[]',
  );
  const account = yield select(selectAccount());
  const addressesToAdd = _.difference(contractAddresses, watchedContracts);
  const contracts = [
    {
      namespace: 'localContracts',
      tags: ['localContracts'],
      addresses: addressesToAdd,
      allReadMethods: true,
      allWriteMethods: true,
      readMethods: [
        {
          name: 'balanceOf',
          args: [account],
        },
      ],
    },
  ];
  yield put(addContractsAction(contracts));
  watchedContracts.push(...addressesToAdd);
  localStorage.setItem('watchedContracts', JSON.stringify(watchedContracts));
}

function* removeWatchedContract(action) {
  const { contractName: address } = action;
  let localContracts = JSON.parse(
    localStorage.getItem('watchedContracts') || '[]',
  );
  localContracts = _.pull(localContracts, address);
  localStorage.setItem('watchedContracts', JSON.stringify(localContracts));
}

function* addContractsBatch(contractBatch) {
  const {
    abi,
    addresses,
    events,
    namespace,
    metadata,
    tags,
    readMethods,
    writeMethods,
    allReadMethods,
    allWriteMethods,
  } = contractBatch;

  if (abi) {
    // Async
    yield all(
      _.map(addresses, (address) =>
        addContract(
          address,
          abi,
          events,
          namespace,
          metadata,
          tags,
          readMethods,
          writeMethods,
          allReadMethods,
          allWriteMethods,
        ),
      ),
    );
  } else {
    // Sync
    // eslint-disable-next-line no-restricted-syntax
    for (const address of addresses) {
      yield addContract(
        address,
        abi,
        events,
        namespace,
        metadata,
        tags,
        readMethods,
        writeMethods,
        allReadMethods,
        allWriteMethods,
      );
    }
  }
}

export function* addContracts(action) {
  // const { contracts: contractsBatch, websocket } = action;
  const { contracts: contractsBatch } = action;
  yield setContext(action);

  yield all(
    _.map(contractsBatch, (contractBatch) =>
      call(addContractsBatch, contractBatch),
    ),
  );

  // const subscriptions = [];
  // const buildSubscriptions = subscriptionData => {
  //   const { addresses, readMethods } = subscriptionData;
  //   const buildCurrentSubscription = address => {
  //     const buildReadMethods = method => {
  //       const subscription = {
  //         args: method.args,
  //         method: method.name,
  //         address,
  //       };
  //       if (!method.args) {
  //         delete subscription.args;
  //       }
  //       return subscription;
  //     };
  //     const subscription = _.map(readMethods, buildReadMethods);
  //     subscriptions.push(...subscription);
  //   };
  //   _.each(addresses, buildCurrentSubscription);
  // };
  // _.each(contractsBatch, buildSubscriptions);

  // const subscriptionMessage = {
  //   action: 'subscribe',
  //   topic: 'contractState',
  //   data: subscriptions,
  // };

  // websocket.connection.send(JSON.stringify(subscriptionMessage));
  // // Split up contract calls into batches (1 contract type per batch... vaults/tokens/localContracts) rather than call them all in the same RPC message
  // // eslint-disable-next-line no-restricted-syntax
  // for (const contractBatch of contractsBatch) {
  //   yield put({ type: 'BATCH_CALL_REQUEST', request: [contractBatch] });
  // }
  yield put({ type: 'BATCH_CALL_REQUEST', request: contractsBatch });
}

export default function* initialize() {
  yield takeEvery(DRIZZLE_ADD_CONTRACTS, addContracts);
  yield takeEvery(DELETE_CONTRACT, removeWatchedContract);
  yield takeEvery(ADD_WATCHED_CONTRACTS, addWatchedContracts);
}
