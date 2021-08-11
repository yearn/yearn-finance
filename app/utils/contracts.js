import { MAX_UINT256 } from 'containers/LiteCover/constants';

export function getContractType(data) {
  const types = [
    {
      name: 'V2 Vault',
      type: 'vault',
      fields: ['expectedReturn', 'emergencyShutdown'],
    },
    {
      name: 'V1 Vault',
      type: 'vault',
      fields: ['min', 'max', 'balance'],
    },
    {
      name: 'V2 Strategy',
      type: 'strategy',
      fields: ['apiVersion', 'strategist'],
    },
    {
      name: 'V1 Strategy',
      type: 'strategy',
      fields: ['strategist'],
    },
    {
      name: 'Token',
      type: 'token',
      fields: ['decimals', 'symbol', 'balanceOf'],
    },
    {
      name: 'Guest List',
      type: 'guestList',
      fields: ['bribe_cost'],
    },
  ];

  const keys = _.keys(data);
  const checkType = (type) => _.difference(type.fields, keys).length === 0;
  const contractType = _.find(types, checkType);

  return contractType ? contractType.name : 'Unknown';
}

export function flattenData(data) {
  const flattenedData = {};
  const setFlattenedData = (val, key) => {
    if (_.isArray(val)) {
      flattenedData[key] = _.first(val).value;
    } else {
      flattenedData[key] = val;
    }
  };
  _.each(data, setFlattenedData);
  return flattenedData;
}

export function getMethods(abi) {
  const findReadMethods = (acc, field) => {
    const { name, inputs, type, outputs, stateMutability } = field;
    const hasInputs = inputs && inputs.length;
    const isViewable = stateMutability === 'view' || stateMutability === 'pure';
    const isMethod = type === 'function';
    if (hasInputs || !isViewable || !isMethod) {
      return acc;
    }
    acc.push({ name, outputs });
    return acc;
  };

  const findWriteMethods = (acc, field) => {
    const { name, inputs, type, stateMutability } = field;
    const v2Vault = _.find(abi, { name: 'apiVersion' });
    if (v2Vault) {
      if (name === 'deposit') {
        if (_.size(inputs) !== 1) {
          return acc;
        }
      }
      if (name === 'withdraw') {
        if (_.size(inputs) !== 1) {
          return acc;
        }
      }
    }

    const isViewable = stateMutability === 'view';
    const isPure = stateMutability === 'pure';
    const isMethod = type === 'function';
    if (isViewable || !isMethod || isPure) {
      return acc;
    }
    acc.push({ name, inputs });
    return acc;
  };
  const read = _.reduce(abi, findReadMethods, []);
  const write = _.reduce(abi, findWriteMethods, []);
  return {
    read,
    write,
  };
}

export function getReadMethodsWithNoInputs(abi) {
  const methods = getMethods(abi);
  return methods.read;
}

export function getNumericReadMethodsWithNoInputs(abi) {
  const methods = getMethods(abi);
  const readMethods = methods.read;
  const filterNumericInputs = (method) => {
    const { outputs } = method;
    const outputType = _.get(outputs, '[0].type');
    const typeIsReadable = outputType === 'uint256' || outputType === 'uint';
    return typeIsReadable;
  };
  const filteredReadMethods = _.filter(readMethods, filterNumericInputs);
  return filteredReadMethods;
}

export function getWriteMethods(abi) {
  const methods = getMethods(abi);
  return methods.write;
}

export function getReadMethods(abi) {
  const methods = getMethods(abi);
  return methods.read;
}

export function approveTxSpend(contract, ownerAddress, spenderAddress) {
  return contract.methods.approve.cacheSend(spenderAddress, MAX_UINT256, {
    from: ownerAddress,
  });
}
