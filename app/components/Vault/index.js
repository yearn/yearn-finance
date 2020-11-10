import React, { useContext, memo } from 'react';
import { compose } from 'redux';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import AnimatedNumber from 'components/AnimatedNumber';
import Accordion from 'react-bootstrap/Accordion';
import AccordionContext from 'react-bootstrap/AccordionContext';
import Card from 'react-bootstrap/Card';
import ColumnList from 'components/Vault/columns';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import { purple } from '@material-ui/core/colors';
import Arrow from 'images/arrow.svg';
import BigNumber from 'bignumber.js';
import { abbreviateNumber } from 'utils/string';
import { selectDevMode } from 'containers/DevMode/selectors';

const IconAndName = styled.div`
  display: flex;
  align-items: center;
  width: 250px;
`;

const Icon = styled.img`
  width: 40px;
  margin-right: 20px;
`;

const IconName = styled.div`
  margin-top: 8px;
`;

const StyledArrow = styled.img`
  margin-right: 30px;
  transform: ${props => (props.expanded ? 'rotate(0)' : 'rotate(-180deg)')};
  transition: transform 0.1s linear;
`;

const A = styled.a`
  display: ilflex;
`;

const truncateApy = apy => {
  if (!apy) {
    return 'N/A';
  }
  const truncatedApy = apy && apy.toFixed(2);
  const apyStr = `${truncatedApy}%`;
  return apyStr;
};

const ColorButton = withStyles(theme => ({
  root: {
    color: theme.palette.getContrastText(purple[500]),
    fontFamily: 'Calibre Medium',
    fontSize: '20px',
    padding: '8px 40px 5px 40px',
    margin: '20px',
    marginLeft: '0px',
    textTransform: 'inherit',
    backgroundColor: '#0657F9',
    '&:hover': {
      backgroundColor: '#0657F9',
    },
  },
}))(Button);

const LinkWrap = props => {
  const { devMode, children, address } = props;
  if (!devMode) {
    return children;
  }
  return (
    <A
      href={`https://etherscan.io/address/${address}`}
      target="_blank"
      onClick={evt => evt.stopPropagation()}
    >
      {children}
    </A>
  );
};

const Vault = props => {
  const { vault } = props;
  const {
    symbolAlias,
    vaultIcon,
    tokenIcon,
    tokenAddress,
    tokenSymbolAlias,
    decimals,
    // token,
    totalAssets,
    balance,
    balanceOf,
    address,
  } = vault;

  const devMode = useSelector(selectDevMode());
  // const { balance, balanceOf } = contractData;

  // const tokenContract = tokens[tokenAddress || token]; // TODO: Make sure both are in checksum format
  const tokenBalance = '2';
  // const tokenSymbol = tokenSymbolAlias || _.get(tokenContract, 'symbol');
  const tokenSymbol = tokenSymbolAlias;
  const vaultName = symbolAlias || tokenSymbol;
  const accordionEventKey = address;
  const currentEventKey = useContext(AccordionContext);
  const active = currentEventKey === accordionEventKey;
  const apyOneMonthSample = _.get(vault, 'apy.apyOneMonthSample');
  const apy = truncateApy(apyOneMonthSample);
  const tokenBalanceOf = new BigNumber(tokenBalance)
    .dividedBy(10 ** decimals)
    .toFixed();
  const vaultBalanceOf = new BigNumber(balanceOf)
    .dividedBy(10 ** decimals)
    .toFixed();
  let vaultAssets = balance || totalAssets;
  vaultAssets = new BigNumber(vaultAssets).dividedBy(10 ** decimals).toFixed(0);
  vaultAssets = vaultAssets === 'NaN' ? '-' : abbreviateNumber(vaultAssets);
  return (
    <React.Fragment>
      <Card className={active && 'active'}>
        <Accordion.Toggle
          as={Card.Header}
          variant="link"
          eventKey={accordionEventKey}
        >
          <ColumnList>
            <IconAndName>
              <LinkWrap devMode={devMode} address={address}>
                <Icon src={vaultIcon || tokenIcon} />
              </LinkWrap>
              <LinkWrap devMode={devMode} address={address}>
                <IconName devMode={devMode}>{vaultName}</IconName>
              </LinkWrap>
            </IconAndName>

            <div>
              <AnimatedNumber value={vaultBalanceOf} />
            </div>
            <div>{vaultAssets}</div>
            <div>{apy}</div>
            <div>
              <AnimatedNumber value={tokenBalanceOf} />{' '}
              <LinkWrap devMode={devMode} address={tokenAddress}>
                {tokenSymbol}
              </LinkWrap>
            </div>
          </ColumnList>
          <StyledArrow src={Arrow} alt="arrow" expanded={active} />
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={accordionEventKey}>
          <Card.Body>
            Hello! Test
            <Card.Footer className={active && 'active'}>
              <ColorButton variant="contained" color="primary">
                Deposit
              </ColorButton>
              <ColorButton variant="contained" color="primary">
                Withdraw
              </ColorButton>
            </Card.Footer>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </React.Fragment>
  );
};
Vault.whyDidYouRender = true;
export default compose(memo)(Vault);
