import React from 'react';
import styled from 'styled-components';
import tw from 'twin.macro';

import { NavLink } from 'react-router-dom';

const Wrapper = styled.div``;

const NavLinks = styled.nav`
  display: flex;
  justify-content: center;
`;

const StyledNavLink = styled(NavLink)`
  height: 100%;
  @media (min-width: 768px) {
    font-size: 24px;
    padding: 0px 15px;
  }
  display: inline-flex;
  text-decoration: none;
  align-items: center;
  text-transform: uppercase;
  color: #777;
  ${tw`text-xl px-4`};

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
