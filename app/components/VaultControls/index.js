import ButtonFilled from 'components/ButtonFilled';
import RoundedInput from 'components/RoundedInput';
import { useContract } from 'containers/DrizzleProvider/hooks';
import { withdrawFromVault, depositToVault } from 'containers/Vaults/actions';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';

const MaxWrapper = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
`;

export default function VaultControls(props) {
  const { vault, vaultBalance, walletBalance } = props;
  const { address: vaultAddress, tokenAddress, decimals } = vault;

  const dispatch = useDispatch();
  const vaultContract = useContract(vaultAddress);
  const tokenContract = useContract(tokenAddress);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);

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
    <>
      <>
        <Balance amount={walletBalance} prefix="Your wallet: " />
        <AmountField
          amount={depositAmount}
          amountSetter={setDepositAmount}
          maxAmount={walletBalance}
        />
        <ActionButton
          handler={deposit}
          text="Deposit"
          title="Deposit into vault"
        />
      </>

      <>
        <Balance amount={vaultBalance} prefix="Vault balance: " />
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
      </>
    </>
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
    <RoundedInput
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
