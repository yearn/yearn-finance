import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';
import { useSelector } from 'react-redux';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import CloseIcon from '@material-ui/icons/Close';
import MenuIcon from '@material-ui/icons/Menu';
import { selectLocation } from 'containers/App/selectors';
import ConnectButton from 'components/ConnectButton';
import Text from 'components/Text';
import Box from 'components/Box';
import Icon from 'components/Icon';
import { Link } from 'react-router-dom';
import YearnLogo from 'images/yearn-logo.svg';
import MobileMenu from './MobileMenu';
import { menuLinks, menuLinksMeta } from './menuLinks';

const StyledItem = styled.li`
  display: inline-block;
`;

const ItemStyle = css`
  cursor: pointer;
  display: inline-block;
  text-align: center;
  font-size: 14px;
  text-transform: capitalize;

  font-weight: ${(props) => (props.isActive ? '700' : '400')};
  color: ${(props) => (props.colored ? '#4B9FFF' : '#fff')};
  text-decoration: ${({ selected }) =>
    selected ? 'underline solid #E5E5E5 5px' : 'none'};
  text-underline-offset: ${({ selected }) => (selected ? '10px' : null)};
  :hover {
    color: ${(props) => (props.hoverable ? '#4B9FFF' : '#fff')};
    font-weight: ${(props) => (props.hoverable ? '700' : '400')};
  }
  :focus {
    outline: none;
  }

  ::before {
    display: block;
    content: attr(data-text);
    font-weight: bold;
    height: 0;
    overflow: hidden;
    visibility: hidden;
  }

  [title]:hover::after {
    position: absolute;
    top: -100%;
    left: 0;
  }
`;

const StyledLink = styled.a`
  ${ItemStyle}
`;

const LinkWrapper = styled(Link)`
  ${ItemStyle}
`;

const StyledNav = styled(Box)`
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
    background-color: #fff;
    border-radius: 4px;
    transform: rotate(45deg);

    left: ${(props) => props.pointer};
    top: 2px;
    z-index: -1;
  }
`;

const FlyingMenu = ({ isActive, links, meta }) => (
  <Box
    position="absolute"
    pt={0.8}
    zIndex={10}
    left={`-${meta.centerPosition}px`}
    css={[
      isActive
        ? tw`opacity-100 animate-flyingMenuEntering`
        : tw`hidden opacity-0`,
    ]}
  >
    <BoxedItems
      position="relative"
      bg="white"
      borderRadius={4}
      p={4}
      width={meta.menuWidth || 184}
      pointer={`${meta.pointer}px` || '67.5px'}
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
  </Box>
);

const MenuItem = ({ text, isActive, setIsActive, links, selected }) => {
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
      <StyledItem tw="relative" onMouseLeave={() => setIsActive(false)}>
        <StyledLink
          data-text={text}
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
          selected={isSelected}
          colored={text === isActive}
          hoverable={1}
          isActive={text === isActive}
        >
          {text}
        </StyledLink>
        <FlyingMenu
          isActive={text === isActive}
          links={links}
          meta={menuLinksMeta[text]}
        />
      </StyledItem>
    );
  }

  return links.href.includes('http') ? (
    <StyledItem tw="relative">
      <StyledLink
        data-text={text}
        href={`${links.href}`}
        role="button"
        tabIndex="0"
        target="_blank"
        tw="no-underline"
        hoverable={1}
      >
        {text}
      </StyledLink>
    </StyledItem>
  ) : (
    <StyledItem tw="relative">
      <LinkWrapper
        data-text={text}
        to={`${links.href}`}
        selected={links.href.toLowerCase() === selected.toLowerCase()}
        hoverable={1}
      >
        {text}
      </LinkWrapper>
    </StyledItem>
  );
};

const Navbar = () => {
  const isScreenMd = useMediaQuery('(min-width:768px)');
  const [isActive, setIsActive] = React.useState(undefined);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
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
    <StyledNav
      position="sticky"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      p={6}
      top={0}
      zIndex={20}
      colored={!isScrollTop}
      height={isScreenMd ? 80 : 66}
    >
      <div tw="flex self-center">
        <Link to="/" tw="no-underline" onClick={() => setIsMobileOpen(false)}>
          <img src={YearnLogo} alt="Yearn" width={isScreenMd ? '150' : '110'} />
        </Link>
      </div>

      {isMobileOpen && <MobileMenu close={() => setIsMobileOpen(false)} />}

      <nav tw="flex flex-1 justify-end space-x-5 hidden md:flex items-center px-4 mr-5">
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

      {isMobileOpen && (
        <div tw="flex flex-1 justify-end -mr-1">
          <CloseIcon fontSize="large" onClick={() => setIsMobileOpen(false)} />
        </div>
      )}

      {!isMobileOpen && !isScreenMd && (
        <MenuIcon onClick={() => setIsMobileOpen(true)} />
      )}
    </StyledNav>
  );
};

export { Navbar };
