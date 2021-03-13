import React from 'react';
import styled from 'styled-components';
import Select, { components } from 'react-select';

const { Option } = components;

const Wrapper = styled.div`
  position: relative;
  height: 100%;
`;

const InlineIcon = styled.img`
  height: 16px;
  width: 16px;
  margin-right: 8px;
`;

const Line = styled.div`
  display: flex;
  align-items: center;
`;

const CustomSelectOption = ({ data, ...rest }) => (
  <Option {...rest}>
    <Line>
      <InlineIcon src={data.icon} alt={data.label} />
      <span>{data.label}</span>
    </Line>
  </Option>
);

const CustomSelectValue = ({ data, ...rest }) => (
  <Line {...rest}>
    <InlineIcon src={data.icon} alt={data.label} />
    <span>{data.label}</span>
  </Line>
);

const customStyles = {
  option: (provided) => ({
    ...provided,
    color: 'black',
    padding: 10,
    height: 46,
    minHeight: 46,
  }),
  control: (provided) => ({
    ...provided,
    color: 'black',
    // none of react-select's styles are passed to <Control />
    height: 46,
    minHeight: 46,
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    paddingTop: 0,
  }),
  singleValue: (provided) => ({ ...provided }),
  menuPortal: (styles) => ({ ...styles, zIndex: 999 }),
};

export const RoundedSelect = React.forwardRef((props) => {
  const { className, onChange, defaultValue, options, disabled } = props;

  return (
    <Wrapper className={className}>
      <Select
        styles={customStyles}
        options={options}
        isSearchable={false}
        defaultValue={defaultValue}
        onChange={onChange}
        disabled={disabled}
        components={{
          Option: CustomSelectOption,
          SingleValue: CustomSelectValue,
        }}
        menuPortalTarget={document.body}
      />
    </Wrapper>
  );
});

RoundedSelect.whyDidYouRender = false;
export default RoundedSelect;
