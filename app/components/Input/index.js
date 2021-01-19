import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.input`
  height: 30px;
  font-size: 14px;
  padding: 0px 7px;
  width: 350px;
  border: 2px solid ${(props) => props.theme.inputBorder};
  border-radius: 23.5px;
  background-color: transparent;
  outline: none;
  color: ${(props) => props.theme.text};
  &:focus {
    border-color: ${(props) => props.theme.yearnBlue};
    box-shadow: 0 0 25pt 5pt ${(props) => props.theme.inputOutline};
  }
  &:invalid:not(:focus) {
    box-shadow: none;
  }
  padding: 0px 13px;
`;

export default function Input(props) {
  const { children, ...restProps } = props;
  return (
    <Wrapper {...restProps} type="text">
      {props.children}
    </Wrapper>
  );
}
