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
