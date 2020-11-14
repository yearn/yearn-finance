import request from 'utils/request';
import {
  select,
  delay,
  call,
  put,
  setContext,
  getContext,
  takeLatest,
} from 'redux-saga/effects';
import { getReadMethods } from 'utils/contracts';
import { selectAddress } from 'containers/ConnectionProvider/selectors';
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
  fields,
  contractType,
  metadata,
  allFields,
) {
  const web3 = yield getContext('web3');
  const drizzle = yield getContext('drizzle');
  let newAbi = abi;
  if (!abi) {
    newAbi = yield fetchAbi(contractAddress);
  }

  const viewableAbiFields = getReadMethods(newAbi);
  const newFields = _.clone(fields) || [];
  const addField = field => {
    const existingField = _.find(newFields, { name: field.name });
    if (!existingField) {
      newFields.push(field);
    }
  };
  if (allFields) {
    _.each(viewableAbiFields, addField);
  }

  const contract = new web3.eth.Contract(newAbi, contractAddress);

  const contractConfig = {
    contractName: contractAddress,
    web3Contract: contract,
  };
  yield drizzle.addContract(contractConfig, events, contractType, metadata);
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
  _.each(newFields, cacheCall);
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
  const account = yield select(selectAddress());
  const addressesToAdd = _.difference(contractAddresses, watchedContracts);
  const contracts = [
    {
      contractType: 'localContracts',
      addresses: addressesToAdd,
      allFields: true,
      methods: [
        {
          name: 'balanceOf',
          args: account,
        },
      ],
    },
  ];
  yield put(addContractsAction(contracts));
  watchedContracts.push(...addressesToAdd);
  localStorage.setItem('watchedContracts', JSON.stringify(watchedContracts));
}

function* removeWatchedContract(action) {
  const { contractName } = action;
  let localContracts = JSON.parse(
    localStorage.getItem('watchedContracts') || '[]',
  );
  localContracts = _.pull(localContracts, contractName);
  localStorage.setItem('watchedContracts', JSON.stringify(localContracts));
}

function* addContractsBatch(contractBatch) {
  const {
    abi,
    addresses,
    events,
    methods,
    contractType,
    metadata,
    allFields,
  } = contractBatch;

  // Async
  // yield all(
  //   _.map(addresses, address =>
  //     addContract(
  //       address,
  //       abi,
  //       events,
  //       methods,
  //       contractType,
  //       metadata,
  //       allFields,
  //     ),
  //   ),
  // );

  // TODO: Refactor to use async once we implement multi-call
  // Sync
  // eslint-disable-next-line no-restricted-syntax
  for (const address of addresses) {
    yield addContract(
      address,
      abi,
      events,
      methods,
      contractType,
      metadata,
      allFields,
    );
  }
}

export function* addContracts(action) {
  const { contracts } = action;
  yield setContext(action);
  // Async
  // yield all(
  //   _.map(contracts, contractBatch => call(addContractsBatch, contractBatch)),
  // );

  // TODO: Refactor to use async once we implement multi-call
  // Sync
  // eslint-disable-next-line no-restricted-syntax
  for (const contract of contracts) {
    yield addContractsBatch(contract);
  }
}

export default function* initialize() {
  yield takeLatest(DRIZZLE_ADD_CONTRACTS, addContracts);
  yield takeLatest(DELETE_CONTRACT, removeWatchedContract);
  yield takeLatest(ADD_WATCHED_CONTRACTS, addWatchedContracts);
}
