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
  } = props;
  const invalid = !isValidValue(value, maxValue);

  return (
    <Wrapper className={className}>
      <Input
        type="text"
        inputmode="decimal"
        pattern="^[0-9]*[.,]?[0-9]*$"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        value={value}
        disabled={disabled}
        style={disabledStyle}
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
