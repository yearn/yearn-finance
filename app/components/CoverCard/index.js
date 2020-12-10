import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.button`
  margin: 7px 0px;
  padding: 5px;
  background-color: transparent;
  text-transform: uppercase;
  border-radius: 13px;
  padding: 10px 10px;
  border: 2px solid #2f80ed;
  color: #2f80ed;
  white-space: nowrap;
  &:focus {
    outline: 0 !important;
  }
  &:not(:disabled):hover {
    background-color: #2f80ed;
    color: #fff;
  }
  font-size: 17px;
  &:disabled {
    opacity: 0.5;
  }
  width: 200px;
`;

export default function Button(props) {
  const { onClick, disabled, className } = props;
  return (
    <Wrapper
      className={className}
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      {props.children}
    </Wrapper>
  );
}
