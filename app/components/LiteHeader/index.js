import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

const Wrapper = styled.div`
  padding-top: 30px;
  padding-bottom: 50px;
`;

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
    color: ${(props) => props.theme.text};
  }
  &.active {
    color: ${(props) => props.theme.text};
  }
`;

export default function VaultsNavLinks() {
  return (
    <Wrapper>
      <NavLinks>
        <StyledNavLink to="/earn" exact>
          Earn
        </StyledNavLink>
        <StyledNavLink to="/borrow" exact>
          Borrow
        </StyledNavLink>
        <StyledNavLink to="/insure" exact>
          Insure
        </StyledNavLink>
      </NavLinks>
    </Wrapper>
  );
}
