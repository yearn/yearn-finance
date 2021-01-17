import React from 'react';
// import styled from 'styled-components';
// import ThemeToggle from 'containers/ThemeProvider/toggle';
// import DevModeToggle from 'containers/DevMode';
import { Navbar } from 'components/Navbar';

// const Toggles = styled.div`
//   display: flex;
//   align-items: center;
//   margin-left: 20px;
//   > div {
//     margin-right: 20px;
//   }
// `;

// const StyledConnectButton = styled(ConnectButton)`
//   margin-right: 15px;
//   margin-top: 15px;
// `;

export default function Header() {
  return (
    <>
      <Navbar />
    </>
  );
}
