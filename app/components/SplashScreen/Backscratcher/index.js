import React from 'react';
import 'twin.macro';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Text from 'components/Text';

import LogoImg from '../../../images/Splash/logo.svg';

const Logo = styled.div`
  img {
    width: 60vw;
    max-width: 210px;
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
  background-color: ${(props) => props.theme.primary};
  color: ${(props) => props.theme.onPrimary};
  border-radius: 33px;
  text-decoration: none;
  :focus {
    outline: 0;
  }
`;

const backgroundStyle = `
  height: calc(100vh - 64px);
  @media (max-width: 570px) {
    height: calc(100vh);
    font-size: 35px;
  }
  background-color: #1D265F;
`;

const imageStyle = `
  animation: cowmove 4s infinite;
  @keyframes cowmove{
      0% {
        transform: rotate(0deg);
      }
      49% {
        transform: rotate(-20deg);
      }
  }
  opacity: .9;
`;

export const Backscratcher = () => (
  <div
    tw="w-screen relative flex flex-col justify-center items-center overflow-hidden"
    css={backgroundStyle}
  >
    <div tw="flex flex-col justify-center items-center z-10 absolute">
      <Logo>
        <img css={imageStyle} src={LogoImg} alt="logo" />
      </Logo>

      <Text bold fontSize={61} center lineHeight="1" mt={30}>
        Maximize your CRV Rewards
      </Text>
      <Text large center my={30}>
        Earn 38% more in weekly fees staking with yearn
      </Text>

      <StyledLink to="/vaults" type="button">
        <Text bold px={6} py={4} center>
          Go to vaults
        </Text>
      </StyledLink>
    </div>
  </div>
);
