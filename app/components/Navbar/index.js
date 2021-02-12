import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import tw from 'twin.macro';
import { useSelector } from 'react-redux';
import { selectLocation } from 'containers/App/selectors';
import ConnectButton from 'components/ConnectButton';
import Text from 'components/Text';
import Box from 'components/Box';
import Icon from 'components/Icon';
import { Link } from 'react-router-dom';
import YearnLogo from 'images/yearn-logo.svg';
import { FlyingMobileMenu } from './FlyingMobileMenu';
import { menuLinks } from './menuLinks';

const StyledP = styled.p`
  font-weight: ${(props) => (props.isActive ? '700' : '400')};
  color: ${(props) => (props.colored ? '#4B9FFF' : null)};
  text-decoration: ${({ isSelected }) =>
    isSelected ? 'underline solid #E5E5E5 5px' : null};
  text-underline-offset: ${({ isSelected }) => (isSelected ? '10px' : null)};
  :hover {
    color: ${(props) => (props.hover ? '#4B9FFF' : null)};
    font-weight: ${(props) => (props.hover ? '700' : '400')};
  }
`;

const StyledDiv = styled.div`
  background-color: ${(props) => props.theme.background};
  box-shadow: ${(props) =>
    props.colored ? '0px 4px 5px 2px rgba(0, 0, 0, 0.17)' : null};
  transition: box-shadow 0.3s ease-in-out;
`;

const ItemContainer = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  color: ${(props) => props.theme.surface};
  background-color: #fff;
  border-radius: 3px;
  :hover {
    background-color: rgba(196, 196, 196, 0.2);
  }
  width: 100%;
`;

const BoxedItems = styled(Box)`
  :after {
    content: '';
    position: absolute;
    width: 50px;
    height: 50px;
    background-color: white;
    border-radius: 4px;
    transform: rotate(45deg);

    left: 50px;
    top: 2px;
    z-index: -1;
  }
`;

const FlyingMenu = ({ isActive, clickAwayRef, links }) => (
  <div
    ref={clickAwayRef}
    css={[
      isActive
        ? tw`opacity-100 animate-flyingMenuEntering`
        : tw`hidden opacity-0`,
    ]}
    tw="absolute z-10 -ml-6 transform px-2 sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2 animate-flyingMenuEntering"
  >
    <BoxedItems
      position="relative"
      bg="white"
      borderRadius={4}
      p={4}
      width={150}
      mt={3}
    >
      {links.map((link) =>
        link.href.includes('http') ? (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            tw="flex items-start no-underline"
          >
            <ItemContainer py={3} px={5}>
              <Text small>{link.title}</Text>
              <Icon type="arrowRight" />
            </ItemContainer>
            {/* <svg
                css={[link.href[0] !== '/' && tw`inline-block`]}
                tw="hidden text-white h-4 self-start"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              {link.description && (
                <p tw="mt-1 text-sm text-white font-sans">{link.description}</p>
              )} */}
          </a>
        ) : (
          <Link
            key={link.href}
            to={link.href}
            tw="flex items-start no-underline"
          >
            <ItemContainer py={3} px={5}>
              <Text small>{link.title}</Text>
            </ItemContainer>
            {/* <svg
                css={[link.href[0] !== '/' && tw`inline-block`]}
                tw="hidden text-white h-4 self-start"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              {link.description && (
                <p tw="mt-1 text-sm text-white font-sans">{link.description}</p>
              )} */}
          </Link>
        ),
      )}
    </BoxedItems>
  </div>
);

const MenuItem = ({ text, isActive, setIsActive, links, selected }) => {
  const ref = useRef(null);
  if (Array.isArray(links)) {
    let isSelected = false;
    if (
      links
        .map(({ href }) => href.toLowerCase())
        .includes(selected.toLowerCase())
    ) {
      isSelected = true;
    }

    return (
      <div tw="relative" onMouseLeave={() => setIsActive(false)}>
        <button
          type="button"
          tw="focus:outline-none"
          onClick={() => {
            if (Array.isArray(links)) setIsActive(text);
          }}
          onMouseEnter={() => {
            if (Array.isArray(links)) setIsActive(text);
          }}
          onKeyPress={() => {
            if (Array.isArray(links)) setIsActive(text);
          }}
          tabIndex="0"
        >
          <StyledP
            isSelected={isSelected}
            colored={text === isActive}
            tw="font-sans capitalize rounded-md inline-flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            hover
            isActive={text === isActive}
          >
            {text}
          </StyledP>
        </button>
        <FlyingMenu
          clickAwayRef={ref}
          isActive={text === isActive}
          links={links}
        />
      </div>
    );
  }

  return links.href.includes('http') ? (
    <div tw="relative">
      <a
        href={`${links.href}`}
        role="button"
        tabIndex="0"
        target="_blank"
        tw="no-underline"
      >
        <StyledP
          tw="font-sans capitalize rounded-md inline-flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          hover
        >
          {text}
        </StyledP>
      </a>
    </div>
  ) : (
    <div tw="relative">
      <Link to={`${links.href}`} role="button" tabIndex="0" tw="no-underline">
        <StyledP
          isSelected={links.href.toLowerCase() === selected.toLowerCase()}
          tw="font-sans capitalize rounded-md inline-flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          hover
        >
          {text}
        </StyledP>
      </Link>
    </div>
  );
};

const Navbar = () => {
  const [isActive, setIsActive] = React.useState(undefined);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [mobileIsActive, setMobileIsActive] = React.useState(false);
  const location = useSelector(selectLocation());
  const { pathname } = location;

  const [isScrollTop, setIsScrollTop] = useState(true);

  const listener = () => {
    const app = document.getElementById('app');
    setIsScrollTop(app.scrollTop === 0);
  };

  useEffect(() => {
    const app = document.getElementById('app');
    app.addEventListener('scroll', listener);
    return () => {
      app.removeEventListener('scroll', listener);
    };
  }, []);

  return (
    <StyledDiv colored={!isScrollTop} tw="sticky top-0 z-20">
      <div tw="px-4 sm:px-6">
        <div tw="flex py-4 items-center">
          <div tw="flex self-center">
            <Link to="/" tw="no-underline mx-auto md:mx-0">
              <img src={YearnLogo} alt="Yearn" height="48" width="150" />
            </Link>
          </div>

          {isMobileOpen && (
            <FlyingMobileMenu
              setMobileIsActive={setMobileIsActive}
              mobileIsActive={mobileIsActive}
              setIsMobileOpen={setIsMobileOpen}
            />
          )}

          <nav tw="flex flex-1 justify-end space-x-10 hidden md:flex items-center px-4 mr-6">
            {Object.keys(menuLinks).map((menuLink) => {
              const links = menuLinks[menuLink];
              return (
                <MenuItem
                  key={menuLink}
                  setIsActive={setIsActive}
                  isActive={isActive}
                  text={menuLink}
                  links={links}
                  selected={pathname}
                />
              );
            })}
          </nav>

          <nav tw="flex invisible md:visible">
            <ConnectButton />
          </nav>

          <div tw="flex flex-1 justify-end -mr-3 md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              tw="rounded-md p-2 inline-flex items-center justify-center text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span tw="sr-only">Open menu</span>
              <svg
                tw="h-8 w-8"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </StyledDiv>
  );
};

export { Navbar };
