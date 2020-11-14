export function getContractType(data) {
  const types = [
    {
      name: 'V2 Vault',
      fields: ['expectedReturn', 'emergencyShutdown'],
    },
    {
      name: 'V1 Vault',
      fields: ['min', 'max', 'balance'],
    },
    {
      name: 'Strategy',
      fields: ['profitFactor', 'maxReportDelay'],
    },
  ];

  const keys = _.keys(data);
  let contractType;
  const checkType = type => {
    const match = _.difference(type.fields, keys).length === 0;
    if (match) {
      contractType = type.name;
    }
  };
  _.each(types, checkType);

  return contractType;
}

export function getMethods(abi) {
  const findReadMethods = (acc, field) => {
    const { name, inputs, type, stateMutability } = field;
    const hasInputs = inputs && inputs.length;
    const isViewable = stateMutability === 'view';
    const isMethod = type === 'function';
    if (hasInputs || !isViewable || !isMethod) {
      return acc;
    }
    acc.push({ name });
    return acc;
  };

  const findWriteMethods = (acc, field) => {
    const { name, inputs, type, stateMutability } = field;
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

export function getWriteMethods(abi) {
  const methods = getMethods(abi);
  return methods.write;
}

export function getReadMethods(abi) {
  const methods = getMethods(abi);
  return methods.read;
}
