export function createPermitMessageData(
  owner,
  spender,
  value,
  deadline,
  token,
) {
  const nonce = 0;
  const message = {
    owner,
    spender,
    value,
    nonce,
    deadline,
  };

  const typedData = {
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
      name: 'USD Coin',
      version: '2',
      chainId: 1,
      verifyingContract: token,
    },
    primaryType: 'Permit',
    message,
  };

  return JSON.stringify({
    ...typedData,
    message,
  });
}
