import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { get } from 'lodash';
import BigNumber from 'bignumber.js';
import Box from '@material-ui/core/Box';
import { useContract } from 'containers/DrizzleProvider/hooks';
import { selectTokenAllowance } from 'containers/App/selectors';
import {
  creamSupply,
  creamWithdraw,
  creamBorrow,
  creamRepay,
  creamApprove,
} from 'containers/Cream/actions';
import Modal from 'components/Modal';
import TokenIcon from 'components/TokenIcon';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  color: #000;
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${({ secondary }) => (secondary ? '#e5e5e5' : '#fff')};
  padding: 25px;
  width: 100%;
`;

const StyledTokenIcon = styled(TokenIcon)`
  width: 30px;
  margin-right: 20px;
`;

const StyledInput = styled.input``;

const StyledRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const Button = styled.button`
  background-color: blue;
  color: white;
  padding: 5px;
  border-radius: 5px;
`;

const unitsToWei = (amount, decimals) =>
  new BigNumber(amount).times(10 ** decimals).toString();

const getActionMeta = ({
  action,
  symbol,
  //   amount,
  balance,
  allowance,
  supplied,
  borrowed,
  //   borrowLimit,
  borrowUtilizationRatio,
  tokenBorrowAllowance,
  withdrawProyectedRatio,
  borrowProyectedRatio,
  maxWithdrawalAmount,
}) => {
  switch (action) {
    case 'supply':
      return {
        cta: allowance > 0 ? creamSupply : creamApprove,
        maxAmount: balance,
        buttonLabel: allowance > 0 ? 'Supply' : 'Approve',
        label1: 'Wallet balance',
        label2: 'Borrow limit used',
        field1: `${formatAmount(balance, 5)} ${symbol}`,
        field2: `${formatAmount(borrowUtilizationRatio, 0)}%`,
      };
    case 'withdraw':
      return {
        cta: creamWithdraw,
        maxAmount: maxWithdrawalAmount,
        buttonLabel: 'Withdraw',
        label1: 'Currently supplying',
        label2: 'Borrow limit used',
        field1: `${formatAmount(supplied, 5)} ${symbol}`,
        field2: `${formatAmount(borrowUtilizationRatio, 0)}% -> ${formatAmount(
          withdrawProyectedRatio,
          0,
        )}%`,
      };
    case 'borrow':
      return {
        cta: creamBorrow,
        maxAmount: tokenBorrowAllowance,
        buttonLabel: 'Borrow',
        label1: 'Currently borrowing',
        label2: 'Borrow limit used',
        field1: `${formatAmount(borrowed, 5)} ${symbol}`,
        field2: `${formatAmount(borrowUtilizationRatio, 0)}% -> ${formatAmount(
          borrowProyectedRatio,
          0,
        )}%`,
      };
    case 'repay':
      return {
        cta: creamRepay,
        maxAmount: borrowed,
        buttonLabel: 'Repay',
        label1: 'Wallet balance',
        field1: `${formatAmount(balance, 5)} ${symbol}`,
      };
    default:
      return {};
  }
};

const formatAmount = (amount, decimals) =>
  `${Number(amount, 10).toFixed(decimals)}`;

export default function CreamModal(props) {
  const { show, onHide, modalMetadata } = props;
  const [amount, setAmount] = useState(0);
  const dispatch = useDispatch();
  const tokenAddress = get(modalMetadata, 'address');
  const tokenContract = useContract(tokenAddress);
  const creamCTokenAddress = get(modalMetadata, 'cAddress');
  const crTokenContract = useContract(creamCTokenAddress);
  const allowance = useSelector(
    selectTokenAllowance(tokenAddress, creamCTokenAddress),
  );

  useEffect(() => setAmount(0), [show]);

  if (!crTokenContract) {
    return null;
  }

  const action = get(modalMetadata, 'action');
  const address = get(modalMetadata, 'address');
  const symbol = get(modalMetadata, 'symbol');
  const decimals = get(modalMetadata, 'decimals');
  const balance = get(modalMetadata, 'balance');
  const supplied = get(modalMetadata, 'supplied');
  const borrowed = get(modalMetadata, 'borrowed');
  const price = get(modalMetadata, 'price');
  const collateralFactor = get(modalMetadata, 'collateralFactor');
  const totalBorrowed = get(modalMetadata, 'totalBorrowed');
  const borrowLimit = get(modalMetadata, 'borrowLimit');
  const borrowAllowance = get(modalMetadata, 'borrowAllowance');
  const collateralAvailable = get(modalMetadata, 'collateralAvailable');
  const borrowUtilizationRatio = new BigNumber(
    get(modalMetadata, 'borrowUtilizationRatio'),
  )
    .times(100)
    .toString();
  const tokenBorrowAllowance = new BigNumber(borrowAllowance)
    .dividedBy(price)
    .toString();
  const collateralAmount = amount
    ? new BigNumber(amount).times(price).times(collateralFactor).toString()
    : '0';
  const withdrawProyectedRatio = new BigNumber(totalBorrowed)
    .dividedBy(new BigNumber(borrowLimit).minus(collateralAmount))
    .times(100)
    .toString();
  const borrowProyectedRatio = new BigNumber(totalBorrowed)
    .plus(new BigNumber(amount).times(price))
    .dividedBy(borrowLimit)
    .times(100)
    .toString();
  const maxWithdrawalAmount = new BigNumber(collateralAvailable)
    .dividedBy(price)
    .toString();

  const actionMeta = getActionMeta({
    action,
    symbol,
    amount,
    balance,
    allowance,
    supplied,
    borrowed,
    borrowLimit,
    borrowUtilizationRatio,
    tokenBorrowAllowance,
    withdrawProyectedRatio,
    borrowProyectedRatio,
    maxWithdrawalAmount,
  });

  return (
    <Modal show={show} onHide={onHide}>
      <Wrapper>
        <StyledSection>
          <Box display="flex" justifyContent="center" alignItems="center">
            <StyledTokenIcon address={address} />
            <span>{symbol}</span>
          </Box>
        </StyledSection>
        <StyledSection secondary>
          <Box display="flex" justifyContent="center" alignItems="center">
            <StyledInput
              placeholder="amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <Button onClick={() => setAmount(actionMeta.maxAmount)}>Max</Button>
          </Box>
        </StyledSection>
        <StyledSection>
          <StyledRow>
            <div>{actionMeta.label1}</div>
            <div>{actionMeta.field1}</div>
          </StyledRow>
          <StyledRow>
            <div>{actionMeta.label2}</div>
            <div>{actionMeta.field2}</div>
          </StyledRow>
          <Button
            onClick={() => {
              try {
                dispatch(
                  actionMeta.cta({
                    crTokenContract,
                    amount: unitsToWei(amount, decimals),
                    tokenContract,
                    creamCTokenAddress,
                  }),
                );
              } catch (err) {
                console.error(err);
              }
            }}
          >
            {actionMeta.buttonLabel}
          </Button>
        </StyledSection>
      </Wrapper>
    </Modal>
  );
}
