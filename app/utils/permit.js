export function createPermitMessageData(
  owner,
  spender,
  value,
  nonce,
  deadline,
  domainName,
  verifyingContract,
) {
  const permitData = {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    },
    domain: {
      name: domainName,
      version: '2',
      chainId: 1,
      verifyingContract,
    },
    primaryType: 'Permit',
    message: {
      owner,
      spender,
      value,
      nonce,
      deadline,
    },
  };

  return JSON.stringify(permitData);
}
