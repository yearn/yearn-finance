import React from 'react';
import styled from 'styled-components';
import ButtonFilled from 'components/ButtonFilled';
import { useSelector } from 'react-redux';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import { useModal } from 'containers/ModalProvider/hooks';
import BigNumber from 'bignumber.js';
import { useContract } from 'containers/DrizzleProvider/hooks';

const Wrapper = styled.div`
  display: grid;
  justify-content: center;
  grid-template-columns: repeat(5, 1fr);
  width: 100%;
  grid-gap: 0px 20px;
  direction: rtl;
`;

export default function VaultButtons(props) {
  const { vault, token } = props;
  const { address, writeMethods, decimals } = vault;
  const account = useSelector(selectAccount());
  const contract = useContract(address);
  const tokenBalanceOf = token.balanceOf;
  const MAX_UINT256 = new BigNumber(2)
    .pow(256)
    .minus(1)
    .toFixed(0);

  const tokenMetadata = {
    displayFields: [{ name: 'Token balance', value: tokenBalanceOf, decimals }],
  };

  const vaultMetadata = {
    displayFields: [
      { name: 'Vault balance', value: vault.balanceOf, decimals },
    ],
  };

  const argConfig = {
    approve: {
      _spender: {
        defaultValue: account,
      },
      _value: {
        defaultValue: MAX_UINT256,
        configurable: true,
      },
    },
    deposit: {
      metadata: tokenMetadata,
      _amount: {
        defaultValue: tokenBalanceOf,
        max: tokenBalanceOf,
        decimals,
      },
    },
    withdraw: {
      metadata: vaultMetadata,
      _shares: {
        max: vault.balanceOf,
        defaultValue: vault.balanceOf,
        decimals,
      },
    },
  };

  const { openModal } = useModal();
  const openTransactionModal = method => {
    const { inputs, name: methodName } = method;
    const inputArgs = _.get(argConfig, methodName);
    const modalArgs = {
      methodName,
      inputs,
      inputArgs,
      address,
      contract,
      contractData: vault,
    };
    openModal('transaction', modalArgs);
  };
  const renderButton = (method, key) => {
    const methodAlias = method.alias || method.name;
    return (
      <ButtonFilled
        key={key}
        onClick={() => openTransactionModal(method)}
        color="primary"
        title={methodAlias}
      >
        {methodAlias}
      </ButtonFilled>
    );
  };

  const vaultButtons = _.map(writeMethods, renderButton);
  // <TransactionModal show={true} onHide={closeModal} />
  return <Wrapper>{vaultButtons}</Wrapper>;
}
