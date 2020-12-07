import React from 'react';
import styled from 'styled-components';
import ButtonFilled from 'components/ButtonFilled';
import { useModal } from 'containers/ModalProvider/hooks';
import BigNumber from 'bignumber.js';
import { useContract, useDrizzle } from 'containers/DrizzleProvider/hooks';
import { useWeb3 } from 'containers/ConnectionProvider/hooks';
import { useSelector } from 'react-redux';
import ButtonFilledRed from 'components/ButtonFilledRed';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import { createPermitMessageData } from 'utils/permit';

const Wrapper = styled.div`
  display: grid;
  justify-content: center;
  grid-template-columns: repeat(5, 1fr);
  width: 100%;
  grid-gap: 0px 20px;
  direction: rtl;
`;

const RemoveWrapper = styled.div`
  width: 100%;
  display: flex;
  margin-top: 30px;
  display: ${props => (props.showDevVaults ? 'inherit' : 'none')};
  justify-content: end;
`;

const ApproveButton = styled.div`
  max-width: 198px;
`;

export default function VaultButtons(props) {
  const { vault, token, showDevVaults } = props;
  const {
    address,
    decimals,
    tokenAddress,
    token: tokenAddressAlt,
    usdc,
  } = vault;

  const web3 = useWeb3();
  const contract = useContract(address);
  const tokenBalanceOf = token.balanceOf;
  const drizzle = useDrizzle();
  const account = useSelector(selectAccount());

  const writeMethods = _.get(drizzle, `contracts.${address}.writeMethods`, []);
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

  const removeVault = () => {
    drizzle.deleteContract(address);
  };

  const findDepositWithPermit = method => {
    const { name: methodName, inputs } = method;
    if (methodName === 'deposit') {
      const findPermitInput = input => input.name === 'permit';
      const foundPermitInput = !!_.find(inputs, findPermitInput);
      return foundPermitInput;
    }
    return false;
  };

  const openTokenTransactionModal = method => {
    const { inputs, name: methodName } = method;
    const inputArgs = {
      _value: {
        defaultValue: MAX_UINT256,
        configurable: true,
      },
      _spender: {
        defaultValue: address,
      },
    };
    const modalArgs = {
      methodName,
      inputs,
      inputArgs,
      address: tokenContractAddress,
      contract: tokenContract,
      contractData: vault,
    };
    openModal('transaction', modalArgs);
  };

  const approveToken = () => {
    const approveMethod = _.find(tokenContract.abi, { name: 'approve' });
    openTokenTransactionModal(approveMethod);
  };

  const permitApproveToken = () => {
    const value = new BigNumber(1000).times(10 ** 6).toFixed();
    const msgParams = createPermitMessageData(
      account,
      address,
      value,
      MAX_UINT256,
      token || usdc,
    );
    const params = [account, msgParams];
    const method = 'eth_signTypedData_v4';

    web3.currentProvider.sendAsync(
      {
        method,
        params,
        from: account,
      },
      (err, result) => {
        if (err) return console.dir(err);
        if (result.error) {
          alert(result.error.message);
        }
        if (result.error) return console.error('ERROR', result);

        const signature = result.result.substring(2);
        const r = `0x${signature.substring(0, 64)}`;
        const s = `0x${signature.substring(64, 128)}`;
        const v = parseInt(signature.substring(128, 130), 16);
        return { r, s, v };
      },
    );
  };

  let approveTokenButton;

  const supportsPermit = _.find(writeMethods, findDepositWithPermit);
  if (supportsPermit || token) {
    approveTokenButton = (
      <ApproveButton>
        <ButtonFilled
          variant="contained"
          color="primary"
          onClick={supportsPermit ? permitApproveToken : approveToken}
        >
          Approve Token
        </ButtonFilled>
      </ApproveButton>
    );
  }

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

  const tokenContractAddress = tokenAddress || tokenAddressAlt;
  const tokenContract =
    tokenContractAddress && drizzle.findContractByAddress(tokenContractAddress);

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
  return (
    <React.Fragment>
      <Wrapper>{vaultButtons}</Wrapper>{' '}
      <RemoveWrapper showDevVaults={showDevVaults}>
        {approveTokenButton}
        <ButtonFilledRed
          variant="contained"
          color="secondary"
          onClick={removeVault}
        >
          Remove Contract
        </ButtonFilledRed>
      </RemoveWrapper>
    </React.Fragment>
  );
}
