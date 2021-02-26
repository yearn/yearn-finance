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
import CreamProgressBar from 'components/CreamProgressBar';
import Icon from 'components/Icon';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  color: #000;
  border-radius: 5px;
`;

const IconContainer = styled.div`
  position: relative;
  width: 100%;
`;

const CloseIcon = styled(Icon)`
  position: absolute;
  top: 20px;
  right: 20px;
  height: 25px;
  cursor: pointer;
`;

const StyledSymbol = styled.div`
  font-size: 28px;
  font-weight: bold;
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${({ secondary }) =>
    secondary ? 'rgba(230, 230, 230, 0.5)' : '#fff'};
  padding: 24px 36px;
  width: 100%;
  border-radius: ${({ top, bottom }) =>
    `${top ? '5px' : '0px'} ${top ? '5px' : '0px'} ${bottom ? '5px' : '0px'} ${
      bottom ? '5px' : '0px'
    }`};
`;

const StyledTokenIcon = styled(TokenIcon)`
  width: 32px;
  margin-right: 10px;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const StyledInput = styled.input`
  font-size: 32px;
  font-weight: 500;
  text-align: center;
  background-color: transparent;
  outline: none;
  border: none;
  border-width: 0px;
  :focus {
    outline: none !important;
  }
`;

const MaxButton = styled.button`
  position: absolute;
  right: 16px;
  font-size: 16px;
  font-weight: 500;
  background-color: transparent;
  color: rgba(0, 0, 0, 0.4);
  padding: 5px;
  border-radius: 5px;
  :focus {
    outline: none !important;
  }
`;

const StyledRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 10px 0;
`;

const Button = styled.button`
  background-color: #0657f9;
  color: #fff;
  padding: 5px;
  border-radius: 5px;
  width: 50%;
  margin-top: 40px;
`;

const StyledHr = styled.hr`
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  width: 100%;
`;

const MAX_UINT256 = new BigNumber(2).pow(256).minus(1).toFixed(0);

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
        progress: borrowUtilizationRatio,
      };
    case 'withdraw':
      return {
        cta: creamWithdraw,
        maxAmount: maxWithdrawalAmount,
        buttonLabel: 'Withdraw',
        label1: 'Currently supplying',
        label2: 'Borrow limit used',
        field1: `${formatAmount(supplied, 5)} ${symbol}`,
        field2: `${formatAmount(borrowUtilizationRatio, 0)}%  →  ${formatAmount(
          withdrawProyectedRatio,
          0,
        )}%`,
        progress: withdrawProyectedRatio,
      };
    case 'borrow':
      return {
        cta: creamBorrow,
        maxAmount: tokenBorrowAllowance,
        buttonLabel: 'Borrow',
        label1: 'Currently borrowing',
        label2: 'Borrow limit used',
        field1: `${formatAmount(borrowed, 5)} ${symbol}`,
        field2: `${formatAmount(borrowUtilizationRatio, 0)}%  →  ${formatAmount(
          borrowProyectedRatio,
          0,
        )}%`,
        progress: borrowProyectedRatio,
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
  const { open, onClose, modalMetadata } = props;
  const [amount, setAmount] = useState(0);
  const dispatch = useDispatch();
  const tokenAddress = get(modalMetadata, 'address');

  // TODO: There could be a regression here. Might need to use token.address
  const tokenContract = useContract(tokenAddress);
  const creamCTokenAddress = get(modalMetadata, 'cAddress');
  const crTokenContract = useContract(creamCTokenAddress);
  const allowance = useSelector(
    selectTokenAllowance(tokenAddress, creamCTokenAddress),
  );

  useEffect(() => setAmount(0), [open]);

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
    .toFixed(10);
  const tokenBorrowAllowance = new BigNumber(borrowAllowance)
    .dividedBy(price)
    .toFixed(10);
  const collateralAmount = amount
    ? new BigNumber(amount).times(price).times(collateralFactor).toFixed(10)
    : '0';
  const withdrawProyectedRatio = new BigNumber(totalBorrowed)
    .dividedBy(new BigNumber(borrowLimit).minus(collateralAmount))
    .times(100)
    .toFixed(10);
  const borrowProyectedRatio = new BigNumber(totalBorrowed)
    .plus(new BigNumber(amount).times(price))
    .dividedBy(borrowLimit)
    .times(100)
    .toFixed(10);
  const maxWithdrawalAmount = new BigNumber(collateralAvailable)
    .dividedBy(price)
    .toFixed(10);

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

  let amountInWei = unitsToWei(amount, decimals);
  if (action === 'repay' && amount && borrowed) {
    const repayMax = new BigNumber(amount)
      .dividedBy(borrowed)
      .times(100)
      .gte(99);
    if (repayMax) {
      amountInWei = MAX_UINT256;
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <IconContainer>
        <CloseIcon type="close" onClick={onClose} />
      </IconContainer>
      <Wrapper>
        <StyledSection top>
          <Box display="flex" justifyContent="center" alignItems="center">
            <StyledTokenIcon address={address} />
            <StyledSymbol>{symbol}</StyledSymbol>
          </Box>
        </StyledSection>
        <StyledSection secondary>
          <InputContainer>
            <StyledInput
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <MaxButton onClick={() => setAmount(actionMeta.maxAmount)}>
              Max
            </MaxButton>
          </InputContainer>
        </StyledSection>
        <StyledSection bottom>
          <StyledRow>
            <div>{actionMeta.label1}</div>
            <div>{actionMeta.field1}</div>
          </StyledRow>
          {actionMeta.field2 && <StyledHr />}
          {actionMeta.field2 && (
            <StyledRow>
              <div>{actionMeta.label2}</div>
              <div>{actionMeta.field2}</div>
            </StyledRow>
          )}
          {actionMeta.progress && (
            <CreamProgressBar
              variant="determinate"
              value={Number(actionMeta.progress)}
            />
          )}
          <Button
            onClick={() => {
              try {
                dispatch(
                  actionMeta.cta({
                    crTokenContract,
                    amount: amountInWei,
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
