export function transformContractData(contractData) {
  const getContractData = (acc, val, key) => {
    const valKeys = _.keys(val);
    let newVal = '';
    if (
      valKeys.length &&
      key !== 'address' &&
      key !== 'metadata' &&
      key !== 'tags' &&
      key !== 'readMethods' &&
      key !== 'writeMethods'
    ) {
      newVal = val[valKeys[0]];
      acc[key] = _.get(newVal, 'value', '');
    }
    return acc;
  };

  const transformedContractData = _.reduce(contractData, getContractData, {});
  return transformedContractData;
}
