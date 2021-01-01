import React, { useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import styled from 'styled-components';
import TabbedNavigation from 'components/TabbedNavigation';
import BigNumber from 'bignumber.js';
import { useContract } from 'containers/DrizzleProvider/hooks';
import { useDispatch } from 'react-redux';
import {
  creamSupply,
  creamBorrow,
  creamRepay,
  creamWithdraw,
} from 'containers/Cream/actions';
const StyledButton = styled.button`
  width: 80px;
  height: 50px;
  background-color: blue;
  color: white !important;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.div``;

const InputArea = styled.div``;

// const Input = styled.input``;

// const ButtonArea = styled.div``;

const Bottom = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

const ColumnWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MaxButton = styled.button``;

const Button = (props) => {
  const { children, onClick } = props;
  return (
    <StyledButton type="button" onClick={onClick}>
      {children}
    </StyledButton>
  );
};

export default function CreamModal(props) {
  const { show, onHide, className, modalMetadata } = props;
  const dispatch = useDispatch();
  const amountRef = useRef({ current: {} });
  const amountRefNormalized = useRef(null);

  const symbol = _.get(modalMetadata, 'asset.symbol[0].value', false);
  const decimals = _.get(modalMetadata, 'asset.decimals[0].value', false);
  const balanceOf = _.get(modalMetadata, 'asset.balanceOf[0].value', false);
  const supplied = _.get(modalMetadata, 'supplied', false);
  const borrowed = _.get(modalMetadata, 'cTokenBalanceOf', false);
  const cTokenDecimals = _.get(modalMetadata, 'cTokenDecimals', false);
  const borrowLimit = _.get(modalMetadata, 'borrowLimit', false);
  const creamCTokenAddress = _.get(modalMetadata, 'creamCTokenAddress');

  const crTokenContract = useContract(creamCTokenAddress);

  const borrowAllowance = new BigNumber(borrowLimit).minus(
    new BigNumber(borrowed),
  );
  const borrowAllowanceNormalized = borrowAllowance
    .dividedBy(10 ** cTokenDecimals)
    .toFixed(5);
  const borrowedNormalized = new BigNumber(borrowed)
    .dividedBy(10 ** cTokenDecimals)
    .toFixed(5);
  const suppliedNormalized = new BigNumber(supplied)
    .dividedBy(10 ** decimals)
    .toFixed(5);
  const balanceOfNormalized = new BigNumber(balanceOf)
    .dividedBy(10 ** decimals)
    .toFixed(4);
  if (!crTokenContract) {
    return null;
  }

  const supply = async () => {
    try {
      dispatch(
        creamSupply({ crTokenContract, amount: amountRef.current.value }),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const borrow = async () => {
    try {
      dispatch(
        creamBorrow({ crTokenContract, amount: amountRef.current.value }),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const repay = async () => {
    try {
      dispatch(
        creamRepay({ crTokenContract, amount: amountRef.current.value }),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const withdraw = async () => {
    try {
      dispatch(
        creamWithdraw({ crTokenContract, amount: amountRef.current.value }),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const setMax = () => {
    updateAmount(balanceOf);
  };

  const setMaxBorrow = () => {
    updateAmount(borrowAllowance);
  };

  const setMaxRepay = () => {
    updateAmount(borrowed);
  };

  const setMaxWithdraw = () => {
    updateAmount(supplied);
  };

  const updateNormalizedAmount = (val) => {
    const amount = new BigNumber(val).times(10 ** decimals).toFixed();
    amountRef.current.value = amount;
  };

  const updateAmount = (val) => {
    amountRef.current.value = val;
    const normalizedAmount = new BigNumber(val)
      .dividedBy(10 ** decimals)
      .toFixed(5);
    amountRefNormalized.current.value = normalizedAmount;
  };

  // console.log(modalMetadata);

  const SupplyPage = () => (
    <ColumnWrapper>
      <InputArea>
        <input
          ref={amountRefNormalized}
          max={balanceOfNormalized}
          type="number"
          onChange={(evt) => updateNormalizedAmount(evt.target.value)}
        />
        <MaxButton onClick={setMax}>max</MaxButton>
      </InputArea>
      <Button onClick={supply}>Supply</Button>
      <Bottom>
        <div>Wallet balance</div>
        <div>
          {balanceOfNormalized} {symbol}
        </div>
      </Bottom>
    </ColumnWrapper>
  );

  const BorrowPage = () => (
    <ColumnWrapper>
      <InputArea>
        <input
          ref={amountRefNormalized}
          max={borrowAllowance}
          type="number"
          onChange={(evt) => updateNormalizedAmount(evt.target.value)}
        />
        <MaxButton onClick={setMaxBorrow}>max</MaxButton>
      </InputArea>
      <Button onClick={borrow}>Borrow</Button>
      <Bottom>
        <div>Borrow allowance</div>
        <div>
          {borrowAllowanceNormalized} {symbol}
        </div>
      </Bottom>
    </ColumnWrapper>
  );

  const RepayPage = () => (
    <ColumnWrapper>
      <InputArea>
        <input
          ref={amountRefNormalized}
          max={borrowed}
          onChange={(evt) => updateNormalizedAmount(evt.target.value)}
        />
        <MaxButton onClick={setMaxRepay}>max</MaxButton>
      </InputArea>
      <Button onClick={repay}>Repay</Button>
      <Bottom>
        <div>Wallet balance</div>
        <div>
          {borrowedNormalized} {symbol}
        </div>
      </Bottom>
    </ColumnWrapper>
  );

  const WithdrawPage = () => (
    <ColumnWrapper>
      <InputArea>
        <input
          max={supplied}
          ref={amountRefNormalized}
          onChange={(evt) => updateNormalizedAmount(evt.target.value)}
        />
        <MaxButton onClick={setMaxWithdraw}>max</MaxButton>
      </InputArea>
      <Button onClick={withdraw}>Withdraw</Button>
      <Bottom>
        <div>Supplied balance</div>
        <div>
          {suppliedNormalized} {symbol}
        </div>
      </Bottom>
    </ColumnWrapper>
  );

  // const modalOpened = () => {
  //   if (show) {
  //   }
  // };
  // useEffect(modalOpened, [show]);

  const pages = [
    {
      name: 'Supply',
      element: SupplyPage,
    },
    {
      name: 'Borrow',
      element: BorrowPage,
    },
    {
      name: 'Repay',
      element: RepayPage,
    },
    {
      name: 'Withdraw',
      element: WithdrawPage,
    },
  ];

  return (
    <Modal
      dialogClassName={className}
      show={show}
      onHide={onHide}
      centered
      animation={false}
    >
      <Modal.Body>
        <Wrapper>
          <Title>{symbol}</Title>
          <TabbedNavigation pages={pages} />
        </Wrapper>
      </Modal.Body>
    </Modal>
  );
}
