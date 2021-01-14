import ButtonFilled from 'components/ButtonFilled';
import RoundedInput from 'components/RoundedInput';
import { useContract } from 'containers/DrizzleProvider/hooks';
import { withdrawFromVault, depositToVault } from 'containers/Vaults/actions';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';

import { selectTokenAllowance } from 'containers/App/selectors';

const MaxWrapper = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  color: initial;
  position: relative;
  top: 2px;
`;

const StyledRoundedInput = styled(RoundedInput)`
  width: 100%;
`;

const ActionGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const ButtonGroup = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 262px 145px;
  grid-gap: 10px;
`;

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;
  grid-gap: 130px;
  padding-right: 10px;
`;

export default function VaultControls(props) {
  const { vault, vaultBalance, walletBalance } = props;
  const { address: vaultAddress, tokenAddress, decimals } = vault;

  const dispatch = useDispatch();
  const vaultContract = useContract(vaultAddress);
  const tokenContract = useContract(tokenAddress);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);

  const tokenContractAddress =
    (tokenContract && tokenContract.address) || '0x0';
  const vaultContractAddress =
    (vaultContract && vaultContract.address) || '0x0';
  const tokenAllowance = useSelector(
    selectTokenAllowance(tokenContractAddress, vaultContractAddress),
  );

  useEffect(() => {
    setDepositAmount(0);
    setWithdrawalAmount(0);
  }, [walletBalance, vaultBalance]);

  if (!vaultContract || !tokenContract) {
    return null;
  }

  const withdraw = () => {
    dispatch(
      withdrawFromVault({
        vaultContract,
        withdrawalAmount,
        decimals,
      }),
    );
  };

  const deposit = () => {
    dispatch(
      depositToVault({
        vaultContract,
        tokenContract,
        depositAmount,
        decimals,
      }),
    );
  };

  return (
    <Wrapper>
      <ActionGroup>
        <Balance amount={vaultBalance} prefix="Vault balance: " />
        <ButtonGroup>
          <AmountField
            amount={withdrawalAmount}
            amountSetter={setWithdrawalAmount}
            maxAmount={vaultBalance}
          />
          <ActionButton
            handler={withdraw}
            text="Withdraw"
            title="Withdraw from vault"
          />
        </ButtonGroup>
      </ActionGroup>
      <ActionGroup>
        <Balance amount={walletBalance} prefix="Your wallet: " />
        <ButtonGroup>
          <AmountField
            amount={depositAmount}
            amountSetter={setDepositAmount}
            maxAmount={walletBalance}
          />
          <ActionButton
            handler={deposit}
            text={tokenAllowance > 0 ? 'Deposit' : 'Approve'}
            title="Deposit into vault"
          />
        </ButtonGroup>
      </ActionGroup>
    </Wrapper>
  );
}

function Balance({ amount, prefix }) {
  return (
    <div>
      {prefix}
      {Number(amount).toFixed(2)}
    </div>
  );
}

function AmountField({ amount, amountSetter, maxAmount }) {
  return (
    <StyledRoundedInput
      value={amount}
      right={<MaxButton maxAmount={maxAmount} amountSetter={amountSetter} />}
      onChange={evt => amountSetter(evt.target.value)}
    />
  );
}

function MaxButton({ maxAmount, amountSetter }) {
  return (
    <MaxWrapper
      onClick={() => {
        amountSetter(maxAmount);
      }}
    >
      Max
    </MaxWrapper>
  );
}

function ActionButton({ handler, title, text }) {
  return (
    <ButtonFilled onClick={() => handler()} color="primary" title={title}>
      {text}
    </ButtonFilled>
  );
}
