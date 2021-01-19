import React from 'react';
import styled from 'styled-components';
import Icon from 'components/Icon';

const Wrapper = styled.button`
  background-color: ${(props) => props.theme.buttonBackground};
  color: ${(props) => props.theme.buttonColor};
  align-items: center;
  border-radius: 4px;
  height: 40px;
  line-height: 40px;
  padding: 0 12px;
  font-weight: 500;
  cursor: pointer;
  font-size: 14px;
`;

const StyledIcon = styled(Icon)`
  height: 1.1em;
  width: 1.1em;
  margin-right: 4px;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export default function Button(props) {
  const { onClick, disabled, className, iconType } = props;
  return (
    <Wrapper
      className={className}
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      <IconWrapper>
        <StyledIcon type={iconType} />
        <div>{props.children}</div>
      </IconWrapper>
    </Wrapper>
  );
}
