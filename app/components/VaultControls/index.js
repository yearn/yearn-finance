import ButtonFilled from 'components/ButtonFilled';
import RoundedInput from 'components/RoundedInput';
import { useContract } from 'containers/DrizzleProvider/hooks';
import { withdrawFromVault, depositToVault } from 'containers/Vaults/actions';
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';

import { selectTokenAllowance } from 'containers/App/selectors';
import BackscratcherClaim from 'components/BackscratcherClaim';

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
  display: ${(props) => (props.hide ? 'none' : 'flex')};
  flex-direction: column;
`;

const ButtonGroup = styled.div`
  display: grid;
  align-items: center;
  display: ${(props) => (props.hide ? 'none' : 'inherit')};
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

const getNormalizedAmount = (amount, decimals) =>
  new BigNumber(amount).dividedBy(10 ** decimals).toFixed(2);

export default function VaultControls(props) {
  const { vault, vaultBalance, walletBalance, balanceOf, tokenBalance } = props;
  const {
    address: vaultAddress,
    totalAssets,
    tokenAddress,
    decimals,
    pureEthereum,
    depositLimit,
  } = vault;

  const v2Vault = vault.type === 'v2' || vault.apiVersion;
  const vaultIsBackscratcher =
    vault.address === '0xc5bDdf9843308380375a611c18B50Fb9341f502A';
  let vaultBalanceOf;
  if (v2Vault) {
    vaultBalanceOf = new BigNumber(balanceOf)
      .times(vault.pricePerShare / 10 ** decimals)
      .toFixed();
  } else {
    vaultBalanceOf = new BigNumber(balanceOf)
      .times(vault.getPricePerFullShare / 10 ** 18)
      .toFixed();
  }

  const dispatch = useDispatch();
  const vaultContract = useContract(vaultAddress);

  const tokenContract = useContract(tokenAddress);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawalGweiAmount, setWithdrawalGweiAmount] = useState(0);
  const [depositGweiAmount, setDepositGweiAmount] = useState(0);

  const tokenContractAddress =
    (tokenContract && tokenContract.address) || '0x0';
  const vaultContractAddress =
    (vaultContract && vaultContract.address) || '0x0';
  const tokenAllowance = useSelector(
    selectTokenAllowance(tokenContractAddress, vaultContractAddress),
  );

  const depositLimitBN = useMemo(() => new BigNumber(depositLimit), [
    depositLimit,
  ]);

  const totalAssetsBN = useMemo(() => new BigNumber(totalAssets), [
    totalAssets,
  ]);

  const depositsDisabled = useMemo(() => {
    if (vault.type === 'v2') {
      return totalAssetsBN.plus(depositGweiAmount).gte(depositLimitBN);
    }
    return false;
  }, [depositAmount, totalAssets, depositLimit]);

  useEffect(() => {
    setDepositAmount(0);
    setWithdrawalAmount(0);
    setDepositGweiAmount(0);
    setWithdrawalGweiAmount(0);
  }, [walletBalance, vaultBalance]);

  const withdraw = () => {
    console.log(`Withdrawing:`, withdrawalGweiAmount);
    dispatch(
      withdrawFromVault({
        vaultContract,
        withdrawalAmount: withdrawalGweiAmount,
        decimals,
        pureEthereum,
      }),
    );
  };

  const deposit = () => {
    console.log(`Depositing:`, depositGweiAmount);
    dispatch(
      depositToVault({
        vaultContract,
        tokenContract,
        depositAmount: depositGweiAmount,
        decimals,
        pureEthereum,
      }),
    );
  };

  return (
    <Wrapper>
      <ActionGroup hide={vaultIsBackscratcher}>
        <Balance amount={vaultBalance} prefix="Vault balance: " />
        <ButtonGroup>
          <AmountField
            amount={withdrawalAmount}
            amountSetter={setWithdrawalAmount}
            gweiAmountSetter={setWithdrawalGweiAmount}
            maxAmount={vaultBalanceOf}
            decimals={decimals}
          />
          <ActionButton
            disabled={!vaultContract || !tokenContract}
            handler={withdraw}
            text="Withdraw"
            title="Withdraw from vault"
            showTooltip
            tooltipText="Connect your wallet to withdraw from vault"
          />
        </ButtonGroup>
      </ActionGroup>
      <ActionGroup>
        <Balance amount={walletBalance} prefix="Your wallet: " />
        <ButtonGroup>
          <AmountField
            amount={depositAmount}
            amountSetter={setDepositAmount}
            gweiAmountSetter={setDepositGweiAmount}
            maxAmount={tokenBalance}
            decimals={decimals}
          />
          <ActionButton
            disabled={!vaultContract || !tokenContract || depositsDisabled}
            handler={deposit}
            text={tokenAllowance || pureEthereum > 0 ? 'Deposit' : 'Approve'}
            title="Deposit into vault"
            showTooltip
            tooltipText={
              depositsDisabled
                ? 'Vault deposit limit reached.'
                : 'Connect your wallet to deposit into vault'
            }
          />
          {vaultIsBackscratcher && (
            <BackscratcherClaim vaultAddress={vaultAddress} />
          )}
        </ButtonGroup>
      </ActionGroup>
    </Wrapper>
  );
}

function AmountField({
  amount,
  amountSetter,
  gweiAmountSetter,
  maxAmount,
  decimals,
}) {
  return (
    <StyledRoundedInput
      value={amount}
      right={
        <MaxButton
          maxAmount={maxAmount}
          amountSetter={amountSetter}
          gweiAmountSetter={gweiAmountSetter}
          decimals={decimals}
        />
      }
      onChange={(evt) => {
        amountSetter(evt.target.value);

        if (evt.target.value) {
          const gweiAmount = new BigNumber(evt.target.value)
            .multipliedBy(10 ** decimals)
            .toFixed(0);

          gweiAmountSetter(gweiAmount);
        } else {
          gweiAmountSetter(0);
        }
      }}
      maxValue={getNormalizedAmount(maxAmount, decimals)}
    />
  );
}

function MaxButton({ maxAmount, amountSetter, gweiAmountSetter, decimals }) {
  return (
    <MaxWrapper
      onClick={() => {
        const normalizedAmount = new BigNumber(maxAmount)
          .dividedBy(10 ** decimals)
          .toFixed(2);

        amountSetter(normalizedAmount);
        gweiAmountSetter(maxAmount);
      }}
    >
      Max
    </MaxWrapper>
  );
}

function Balance({ amount, prefix }) {
  return (
    <div>
      {prefix}
      {new BigNumber(amount).toFixed(2)}
    </div>
  );
}

function ActionButton({
  disabled,
  handler,
  title,
  text,
  tooltipText,
  showTooltip,
}) {
  return (
    <ButtonFilled
      disabled={disabled}
      onClick={() => handler()}
      color="primary"
      title={title}
      tooltipText={tooltipText}
      showTooltip={showTooltip}
    >
      {text}
    </ButtonFilled>
  );
}
