import React from 'react';
import 'twin.macro';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Text from 'components/Text';

import LogoImg from '../../../images/Splash/logo.svg';

const Logo = styled.div`
  img {
    width: 40vw;
    max-width: 210px;
    min-width: 164px;
    opacity: 0.8;
    margin: 0 auto;
  }
`;

// const HeaderText = styled.div`
//   font-size: 19px;
//   text-align: center;
//   letter-spacing: 2.2px;
//   @media (max-width: 570px) {
//     max-width: 280px;
//   }
//   line-height: 28px;
//   margin-bottom: 10px;
// `;

const StyledLink = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.primary};
  color: ${(props) => props.theme.onPrimary};
  border-radius: 33px;
  text-decoration: none;
  :focus {
    outline: 0;
  }
`;

const backgroundStyle = `
  padding-top: 80px;
`;

export const Backscratcher = () => (
  <div
    tw="w-screen relative flex flex-1 flex-col justify-center items-center overflow-hidden"
    css={backgroundStyle}
  >
    <Logo>
      <img src={LogoImg} alt="logo" />
    </Logo>

    <Text bold fontSize={[44, 61]} center lineHeight="1" mt={30} mx={[5, 0]}>
      Maximize your CRV Rewards
    </Text>
    <Text large center my={30} mx={[80, 0]}>
      Earn 38% more in weekly fees staking with yearn
    </Text>

    <StyledLink to="/vaults">
      <Text bold fontSize={[1, 2]} px={6} py={4} center>
        Go to vaults
      </Text>
    </StyledLink>
  </div>
);
