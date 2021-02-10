const INITIALIZING_CONTRACT = 'INITIALIZING_CONTRACT';

export function initializingContract(results) {
  return {
    type: INITIALIZING_CONTRACT,
    payload: results,
  };
}

const INITIALIZED_CONTRACT = 'INITIALIZED_CONTRACT';

export function initializedContract(results) {
  return {
    type: INITIALIZED_CONTRACT,
    payload: results,
  };
}

const GETTING_CONTRACT_VAR = 'GETTING_CONTRACT_VAR';

export function gettingContractVar(results) {
  return {
    type: GETTING_CONTRACT_VAR,
    payload: results,
  };
}

const GOT_CONTRACT_VAR = 'GOT_CONTRACT_VAR';

export function gotContractVar(results) {
  return {
    type: GOT_CONTRACT_VAR,
    payload: results,
  };
}

const DELETE_CONTRACT = 'DELETE_CONTRACT';

export function deleteContract(contractName) {
  return {
    type: DELETE_CONTRACT,
    contractName,
  };
}

const PROCESS_ADDRESSES_TO_UPDATE = 'PROCESS_ADDRESSES_TO_UPDATE';

export function processAdressesToUpdate(contractAddress) {
  return {
    type: PROCESS_ADDRESSES_TO_UPDATE,
    contractAddress,
  };
}
