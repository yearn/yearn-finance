import {
  select,
  delay,
  call,
  put,
  setContext,
  getContext,
  all,
  takeLatest,
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
// import * as s from '../selectors';
// import * as a from './actions';

function* addContract(
  contractAddress,
  abi,
  events,
  namespace,
  metadata,
  readMethods,
  writeMethods,
  allReadMethods,
  allWriteMethods,
) {
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

  newReadMethods = _.map(newReadMethods, method =>
    mergeAbiFieldData(method, allAbiReadMethods),
  );
  newWriteMethods = _.map(newWriteMethods, method =>
    mergeAbiFieldData(method, allAbiWriteMethods),
  );

  if (allReadMethods) {
    _.each(allAbiReadMethods, field => addField(field, newReadMethods));
  }
  if (allWriteMethods) {
    _.each(allAbiWriteMethods, field => addField(field, newWriteMethods));
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
    newReadMethods.reverse(),
    newWriteMethods.reverse(),
  );
  const drizzleContract = drizzle.contracts[contractAddress];

  if (!abi) {
    // TODO: Add ABI caching and remove delay
    // TODO: Increase delay to maximum of 200 ms (5 etherscan calls per second per IP)
    yield delay(0);
  }
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
    readMethods,
    writeMethods,
    allReadMethods,
    allWriteMethods,
  } = contractBatch;

  // Async
  yield all(
    _.map(addresses, address =>
      addContract(
        address,
        abi,
        events,
        namespace,
        metadata,
        readMethods,
        writeMethods,
        allReadMethods,
        allWriteMethods,
      ),
    ),
  );
}

export function* addContracts(action) {
  const { contracts: contractsBatch } = action;
  yield setContext(action);

  yield all(
    _.map(contractsBatch, contractBatch =>
      call(addContractsBatch, contractBatch),
    ),
  );

  const batchCallRequest = contractsBatch;
  yield put({ type: 'BATCH_CALL_REQUEST', request: batchCallRequest });
}

export default function* initialize() {
  yield takeLatest(DRIZZLE_ADD_CONTRACTS, addContracts);
  yield takeLatest(DELETE_CONTRACT, removeWatchedContract);
  yield takeLatest(ADD_WATCHED_CONTRACTS, addWatchedContracts);
}
