import React from 'react';
import styled from 'styled-components';

const Select = styled.select`
  background: #ffffff;
  border-radius: 5px;
  height: 46px;
  outline: none;
  background: #ffffff;
  border-radius: 5px;
  font-family: ${(props) => props.theme.fontFamily};
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 16px;
  letter-spacing: 0.529412px;
  color: #111111;
  padding: 0px 13px;
  width: 100%;
  box-sizing: border-box;
  border: ${(props) => (props.invalid ? '2px solid red' : '0px')};
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }
`;

const Wrapper = styled.div`
  position: relative;
  width: 330px;
`;

export const RoundedSelect = React.forwardRef((props) => {
  const { className, onChange, value, options, disabled } = props;

  return (
    <Wrapper className={className}>
      <Select
        value={value}
        disabled={disabled}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.text}
          </option>
        ))}
      </Select>
    </Wrapper>
  );
});

RoundedSelect.whyDidYouRender = false;
export default RoundedSelect;
