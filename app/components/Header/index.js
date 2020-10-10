import React from 'react';
import styled from 'styled-components';
import Account from 'containers/Account';
import ThemeToggle from 'containers/ThemeProvider/toggle';

const Wrapper = styled.div``;

export default function Header() {
  return (
    <Wrapper>
      <ThemeToggle />
      <Account />
    </Wrapper>
  );
}
