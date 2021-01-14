import React from 'react';
import styled from 'styled-components';

const Input = styled.input`
  background: #ffffff;
  border-radius: 5px;
  height: 47px;
  outline: none;
  border: 0px;
  background: #ffffff;
  border-radius: 5px;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 16px;
  letter-spacing: 0.529412px;
  color: #111111;
  padding: 0px 13px;
  width: 100%;
  padding-right: 40%;
  box-sizing: border-box;
  &:disabled {
    cursor: not-allowed;
  }
`;

const Wrapper = styled.div`
  position: relative;
  width: 330px;
`;

const Right = styled.div`
  position: absolute;
  right: 13px;
  height: 47px;
  display: flex;
  align-items: center;
  top: 0px;
`;

export const RoundedInput = React.forwardRef((props, ref) => {
  const { className, onChange, value, disabled, right } = props;
  return (
    <Wrapper className={className}>
      <Input
        type="text"
        value={value}
        disabled={disabled}
        onChange={onChange}
        ref={ref}
      />
      <Right>{right}</Right>
    </Wrapper>
  );
});

RoundedInput.whyDidYouRender = false;
export default RoundedInput;
