import React from 'react';
import styled from 'styled-components';
import ConnectButton from 'components/ConnectButton';
import ThemeToggle from 'containers/ThemeProvider/toggle';

const Wrapper = styled.div``;

export default function Header() {
  return (
    <Wrapper>
      <ThemeToggle />
      <ConnectButton />
    </Wrapper>
  );
}
