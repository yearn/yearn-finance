import React, { memo } from 'react';
import { compose } from 'redux';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Icon from 'components/Icon';

const Wrapper = styled.div`
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 16px;
  letter-spacing: 0.529412px;
  color: #ffffff;
`;

const StyledLink = styled(Link)`
  margin-left: 2px;
  text-decoration: none;
  display: flex;
  align-items: center;
`;

function BackLink(props) {
  const { to, children, className } = props;
  return (
    <Wrapper className={className}>
      <StyledLink to={to}>
        <Icon type="chevronLeft" />
        {children}
      </StyledLink>
    </Wrapper>
  );
}

BackLink.whyDidYouRender = true;
export default compose(memo)(BackLink);
