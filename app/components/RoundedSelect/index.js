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

const CustomSelectValue = ({ data, options }) => (
  <Line options={options}>
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
  valueContainer: (provided) => ({
    ...provided,
    height: '100%',
    paddingTop: 0,
    marginTop: -2,
    overflow: 'visible',
  }),
  control: (provided) => ({
    ...provided,
    color: 'black',
    // none of react-select's styles are passed to <Control />
    height: 46,
    minHeight: 46,
    flexWrap: 'nowrap',
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    paddingTop: 0,
  }),
  singleValue: (provided) => ({ ...provided }),
  menuPortal: (styles) => ({ ...styles, zIndex: 999 }),
};

export const RoundedSelect = React.forwardRef((props, ref) => {
  const { className, onChange, defaultValue, options, disabled } = props;

  return (
    <Wrapper className={className}>
      <Select
        styles={customStyles}
        options={options}
        isSearchable={false}
        ref={ref}
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
