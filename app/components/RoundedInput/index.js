import React from 'react';
import styled from 'styled-components';
import { toNumber } from 'lodash';

const Input = styled.input`
  background: #ffffff;
  border-radius: 5px;
  height: 46px;
  outline: none;
  background: #ffffff;
  border-radius: 5px;
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
  border: ${(props) => (props.invalid ? '2px solid red' : '0px')};

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
  height: 46px;
  display: flex;
  align-items: center;
  top: 0px;
`;
const Left = styled.div`
  position: absolute;
  left: 13px;
  height: 46px;
  display: flex;
  align-items: center;
  color: black;
  top: 0px;
`;
const isValidValue = (value, maxValue = Number.MAX_SAFE_INTEGER) =>
  !value || toNumber(value) <= toNumber(maxValue) || value === '.';

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`);

export const RoundedInput = React.forwardRef((props, ref) => {
  const {
    className,
    onChange,
    value,
    disabled,
    right,
    maxValue,
    placeholder,
    disabledStyle,
    left,
  } = props;
  const invalid = !isValidValue(value, maxValue);
  let padding = {};
  let leftBox = null;
  if (left && left.length > 0) {
    padding = { paddingLeft: 50 + 9 * (left.length - 3) };
    leftBox = (
      <Left>
        <span>{left}</span>
      </Left>
    );
  }

  return (
    <Wrapper className={className}>
      {leftBox}
      <Input
        type="text"
        inputmode="decimal"
        pattern="^[0-9]*[.,]?[0-9]*$"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        value={value}
        disabled={disabled}
        style={{ ...disabledStyle, ...padding }}
        placeholder={placeholder}
        onChange={(event) => {
          const input = event.target.value;
          if (input === '' || inputRegex.test(escapeRegExp(input))) {
            onChange(event);
          }
        }}
        invalid={invalid}
        ref={ref}
      />
      <Right>{right}</Right>
    </Wrapper>
  );
});

RoundedInput.whyDidYouRender = false;
export default RoundedInput;
