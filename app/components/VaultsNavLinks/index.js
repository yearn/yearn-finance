import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

const Wrapper = styled.div``;

const NavLinks = styled.nav`
  display: flex;
  justify-content: center;
`;

const StyledNavLink = styled(NavLink)`
  padding: 0px 15px;
  height: 100%;
  font-size: 24px;
  display: inline-flex;
  text-decoration: none;
  align-items: center;
  text-transform: uppercase;
  color: #777;
  &:hover {
    color: ${props => props.theme.text};
  }
  &.active {
    color: ${props => props.theme.text};
  }
`;

export default function VaultsNavLinks() {
  return (
    <Wrapper>
      <NavLinks>
        <StyledNavLink to="/vaults" exact>
          Production
        </StyledNavLink>
        <StyledNavLink to="/vaults/develop" exact>
          Experimental
        </StyledNavLink>
      </NavLinks>
    </Wrapper>
  );
}
