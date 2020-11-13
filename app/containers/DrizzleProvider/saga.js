import request from 'utils/request';
import {
  select,
  call,
  put,
  all,
  setContext,
  getContext,
  takeLatest,
} from 'redux-saga/effects';
import { selectAddress } from 'containers/ConnectionProvider/selectors';

import {
  DELETE_CONTRACT,
  ADD_CONTRACT,
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

  const readAbiField = (acc, field) => {
    const hasInputs = _.get(field, 'inputs', []).length;
    const viewable = field.stateMutability === 'view';
    if (hasInputs || !viewable) {
      return acc;
    }
    acc.push({ name: field.name });
    return acc;
  };
  const viewableAbiFields = _.reduce(newAbi, readAbiField, []);
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
    if (method.args) {
      drizzleContract.methods[method.name].cacheCall(method.args);
    } else {
      drizzleContract.methods[method.name].cacheCall();
    }
  };
  _.each(newFields, cacheCall);
}

function* addWatchedContract(action) {
  const vaultAddress = action.address;
  const localVaults = JSON.parse(
    localStorage.getItem('watchedContracts') || '[]',
  );
  const account = yield select(selectAddress());
  const alreadyWatching = _.includes(localVaults, vaultAddress);
  if (alreadyWatching) {
    return;
  }
  const contracts = [
    {
      contractType: 'localVaults',
      addresses: [vaultAddress],
      allFields: true,
      methods: [
        {
          name: 'balanceOf',
          args: account,
        },
      ],
    },
  ];
  yield put(addContracts(contracts));
  localVaults.push(vaultAddress);
  localStorage.setItem('watchedContracts', JSON.stringify(localVaults));
}

function* removeWatchedContract(action) {
  const { contractName } = action;
  let localVaults = JSON.parse(
    localStorage.getItem('watchedContracts') || '[]',
  );
  localVaults = _.pull(localVaults, contractName);
  localStorage.setItem('watchedContracts', JSON.stringify(localVaults));
}

function* addContractBatch(contractBatch) {
  const {
    abi,
    addresses,
    events,
    methods,
    contractType,
    metadata,
    allFields,
  } = contractBatch;
  yield all(
    _.map(addresses, address =>
      addContract(
        address,
        abi,
        events,
        methods,
        contractType,
        metadata,
        allFields,
      ),
    ),
  );
}

export function* addContracts(action) {
  const { contracts } = action;
  yield setContext(action);
  yield all(
    _.map(contracts, contractBatch => call(addContractBatch, contractBatch)),
  );
}

export default function* initialize() {
  yield takeLatest(DRIZZLE_ADD_CONTRACTS, addContracts);
  yield takeLatest(DELETE_CONTRACT, removeWatchedContract);
  yield takeLatest(ADD_CONTRACT, addWatchedContract);
}
