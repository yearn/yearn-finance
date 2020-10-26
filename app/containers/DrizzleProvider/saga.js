import * as r from 'redux-saga/effects';
import * as a from './actions';
import { DRIZZLE_ADD_CONTRACTS } from './constants';
// import * as s from '../selectors';

// function* callCache(contract, field) {}

function* addContract(contractAddress, abi, events, fields) {
  const web3 = yield r.getContext('web3');
  const drizzle = yield r.getContext('drizzle');
  const contract = new web3.eth.Contract(abi, contractAddress);
  const contractConfig = {
    contractName: contractAddress,
    web3Contract: contract,
  };
  yield drizzle.addContract(contractConfig, events);
  const drizzleContract = drizzle.contracts[contractAddress];

  const callCache = method => {
    if (method.args) {
      drizzleContract.methods[method.name].cacheCall(method.args);
    } else {
      drizzleContract.methods[method.name].cacheCall();
    }
  };
  _.each(fields, callCache);
}

function* addContractBatch(contractBatch) {
  const { abi, addresses, events, methods } = contractBatch;
  yield r.all(
    _.map(addresses, address => addContract(address, abi, events, methods)),
  );
}

export function* addContracts(action) {
  const { web3, drizzle, contracts } = action;
  yield r.setContext(action);
  yield r.all(
    _.map(contracts, contractBatch => r.call(addContractBatch, contractBatch)),
  );
}

export default function* initialize() {
  yield r.takeLatest(DRIZZLE_ADD_CONTRACTS, addContracts);
}
