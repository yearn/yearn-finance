import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { useDispatch } from 'react-redux';
import Input from 'components/Input';

const Wrapper = styled.form`
  margin: 0 auto;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 50px;
  opacity: ${props => (props.devVaults ? 1 : 0)};
  transition: opacity 100ms ease-in, margin-top 100ms ease-out;
  margin-top: 10px;
  ${props =>
    props.devVaults &&
    css`
      margin-top: 30px;
      color: black;
      transition: opacity 100ms ease-in, margin-top 100ms ease-out;
    `}
`;

export default function AddVault(props) {
  const { devVaults } = props;
  const [address, setAddress] = useState('');
  const dispatch = useDispatch();
  const addVault = evt => {
    evt.preventDefault();
    dispatch({ type: 'ADD_VAULT', address });
    setAddress('');
  };

  return (
    <Wrapper devVaults={devVaults} onSubmit={addVault}>
      <Input
        type="text"
        placeholder="Add contract: 0x..."
        value={address}
        pattern="0[xX][0-9a-fA-F]+"
        minLength="42"
        maxLength="42"
        required
        onChange={evt => setAddress(evt.target.value)}
      />
    </Wrapper>
  );
}
