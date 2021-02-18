import React from 'react';
import styled from 'styled-components';
import { keyBy } from 'lodash';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import CloseIcon from '@material-ui/icons/Close';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Box from 'components/Box';
import ConnectButton from 'components/ConnectButton';
import YearnLogo from 'images/yearn-logo.svg';
import { menuLinks } from './menuLinks';

const StyledNav = styled(Box)`
  background-color: ${(props) => props.theme.background};
`;

const StyledList = styled(List)`
  color: #000;
  background-color: #fff;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  top: 0;
  left: 0;
  width: 100%;
  min-height: calc(100vh);
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
`;

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    height: 65,
    paddingLeft: 24,
    paddingRight: 24,
  },
}));

const StyledItem = styled(ListItem)`
  span,
  svg {
    font-family: ${(props) => props.theme.fontFamily} !important;
    color: ${(props) =>
      props.active ? props.theme.primary : '#000'} !important;
    font-weight: ${(props) => (props.active ? '700' : '400')} !important;
  }

  &&& {
    .MuiListItem-root {
      padding: 0 50px;
    }
  }

  text-transform: capitalize;
  border-bottom: 1px solid ${(props) => (props.nested ? '#f3f3f3' : '#c4c4c4')};
  background-color: ${(props) =>
    props.nested ? 'rgba(196, 196, 196, 0.08)' : '#fff'};
`;

const LastItem = styled(ListItem)`
  height: 100px;
`;

const MobileMenu = ({ close }) => {
  const classes = useStyles();
  const [openItems, setOpenItems] = React.useState(
    keyBy(
      Object.keys(menuLinks).map((key) => ({ key, open: false })),
      'key',
    ),
  );

  const handleClick = (key, isGrouped, isExternal, isInternal, href) => {
    if (isGrouped) {
      setOpenItems({
        ...openItems,
        [key]: { key, open: !openItems[key].open },
      });
    }
    if (isExternal) {
      window.open(href, '_blank');
      close();
    }
    if (isInternal) {
      close();
    }
  };

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      bottom={0}
      display="flex"
      flexDirection="column"
      flex={1}
      bg="white"
      width={1}
    >
      <StyledNav
        position="sticky"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={6}
        height="66px"
      >
        <Link to="/" tw="no-underline mx-auto md:mx-0" onClick={close}>
          <img src={YearnLogo} alt="Yearn" width="110" />
        </Link>
        <CloseIcon onClick={close} />
      </StyledNav>
      <StyledList component="nav">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height={100}
          borderBottom="1px solid #c4c4c4"
          px={24}
          bg="rgba(196, 196, 196, 0.08)"
        >
          <ConnectButton inverted />
        </Box>
        {Object.keys(menuLinks).map((key) => {
          const item = menuLinks[key];
          const isGrouped = Array.isArray(item);
          const isExternal = !isGrouped && item.href.includes('http');
          const isInternal = !isGrouped && !isExternal;

          const renderChevron = () => {
            if (isGrouped) {
              return openItems[key].open ? <ExpandLess /> : <ExpandMore />;
            }
            if (isExternal) {
              return <ChevronRightIcon />;
            }
            return null;
          };

          return (
            <React.Fragment key={key}>
              <StyledItem
                className={classes.root}
                active={openItems[key].open ? 1 : 0}
                // eslint-disable-next-line no-nested-ternary
                component={isGrouped ? 'div' : isExternal ? 'a' : Link}
                to={item.href}
                onClick={() =>
                  handleClick(
                    key,
                    isGrouped,
                    isExternal,
                    isInternal,
                    isGrouped ? '' : item.href,
                  )
                }
              >
                <ListItemText primary={key} />
                {renderChevron()}
              </StyledItem>
              {isGrouped && (
                <Collapse in={openItems[key].open} timeout="auto" unmountOnExit>
                  {item.map((nestedItem) => (
                    <List key={nestedItem.title} component="div" disablePadding>
                      <StyledItem
                        className={classes.root}
                        nested={1}
                        component={
                          nestedItem.href.includes('http') ? 'a' : Link
                        }
                        to={nestedItem.href}
                        onClick={() =>
                          handleClick(
                            nestedItem.title,
                            false,
                            nestedItem.href.includes('http'),
                            !nestedItem.href.includes('http'),
                            nestedItem.href,
                          )
                        }
                      >
                        <ListItemText primary={nestedItem.title} />
                        {nestedItem.href.includes('http') && (
                          <ChevronRightIcon />
                        )}
                      </StyledItem>
                    </List>
                  ))}
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
        {/* added quick fix to display all items on scroll */}
        <LastItem>
          <ListItemText primary=" " />
        </LastItem>
      </StyledList>
    </Box>
  );
};

export default MobileMenu;
