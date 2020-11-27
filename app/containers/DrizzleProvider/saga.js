import request from 'utils/request';

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
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import { addContracts as addContractsAction } from './actions';
import {
  DELETE_CONTRACT,
  ADD_WATCHED_CONTRACTS,
  DRIZZLE_ADD_CONTRACTS,
} from './constants';
const apiKey = 'GEQXZDY67RZ4QHNU1A57QVPNDV3RP1RYH4';
// import * as s from '../selectors';
// import * as a from './actions';

function* fetchAbi(address) {
  const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${apiKey}`;
  const resp = yield call(request, url);
  console.log('Fetch ABI:', address);
  const abi = JSON.parse(resp.result);
  return abi;
}

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
    newAbi = yield fetchAbi(contractAddress);
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

  const cacheCall = method => {
    const methodExists = _.find(newAbi, { name: method.name });
    if (!methodExists) {
      // Attempted to add method args that dont exist
      return;
    }
    if (method.args) {
      drizzleContract.methods[method.name].cacheCall(method.args);
    } else {
      drizzleContract.methods[method.name].cacheCall();
    }
  };

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
  const { contracts, web3 } = action;
  yield setContext(action);

  const batchCallRequest = contracts;
  yield put({ type: 'BATCH_CALL_REQUEST', request: batchCallRequest });
  // const initialContractsState = yield batchCall.execute(contracts);

  // yield put({ type: 'CONTRACTS_SYNCED', contracts: initialContractsState });
  // Async;
  yield all(
    _.map(contracts, contractBatch => call(addContractsBatch, contractBatch)),
  );
}

export default function* initialize() {
  yield takeLatest(DRIZZLE_ADD_CONTRACTS, addContracts);
  yield takeLatest(DELETE_CONTRACT, removeWatchedContract);
  yield takeLatest(ADD_WATCHED_CONTRACTS, addWatchedContracts);
}
