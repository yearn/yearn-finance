import React, { useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import styled from 'styled-components';
import TabbedNavigation from 'components/TabbedNavigation';
import BigNumber from 'bignumber.js';
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

const Button = props => {
  const { children, onClick } = props;
  return (
    <StyledButton type="button" onClick={onClick}>
      {children}
    </StyledButton>
  );
};

export default function CreamModal(props) {
  const { show, onHide, className, modalMetadata } = props;
  // const enable = () => {
  //   console.log('enable');
  // };

  const amountRef = useRef({ current: {} });
  const amountRefNormalized = useRef(null);
  // const allowed = _.get(modalMetadata, 'allowed', false);
  const symbol = _.get(modalMetadata, 'asset.symbol[0].value', false);
  const decimals = _.get(modalMetadata, 'asset.decimals[0].value', false);
  const balanceOf = _.get(modalMetadata, 'asset.balanceOf[0].value', false);
  const suppliedNormalized = _.get(modalMetadata, 'supplied', false);
  const balanceOfNormalized = new BigNumber(balanceOf)
    .dividedBy(10 ** decimals)
    .toFixed(4);
  const supply = () => {
    console.log('supply', amountRef.current.value);
  };

  const withdraw = () => {
    console.log('withdraw');
  };

  const setMax = () => {
    updateAmount(balanceOf);
  };

  const updateNormalizedAmount = val => {
    const amount = new BigNumber(val).times(10 ** decimals).toFixed();
    amountRef.current.value = amount;
  };

  const updateAmount = val => {
    amountRef.current.value = val;
    const normalizedAmount = new BigNumber(val)
      .dividedBy(10 ** decimals)
      .toFixed(4);
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
          onChange={evt => updateNormalizedAmount(evt.target.value)}
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

  const WithdrawPage = () => (
    <ColumnWrapper>
      <InputArea>
        <input
          ref={amountRefNormalized}
          onChange={evt => updateNormalizedAmount(evt.target.value)}
        />
      </InputArea>
      <Button onClick={withdraw}>Withdraw</Button>
      <Bottom>
        <div>Wallet balance</div>
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
