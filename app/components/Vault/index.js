import React, { memo } from 'react';
import { compose } from 'redux';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import AnimatedNumber from 'components/AnimatedNumber';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import ColumnList from 'components/Vault/columns';
import Arrow from 'images/arrow.svg';
import ColumnListDev from 'components/Vault/columnsDev';
import BigNumber from 'bignumber.js';
import { abbreviateNumber } from 'utils/string';
import { selectDevMode } from 'containers/DevMode/selectors';
import { selectContractData } from 'containers/App/selectors';
import { getContractType } from 'utils/contracts';
import VaultButtons from 'components/VaultButtons';
import ButtonFilledRed from 'components/ButtonFilledRed';
import { useDrizzle } from 'containers/DrizzleProvider/hooks';

const IconAndName = styled.div`
  display: flex;
  align-items: center;
`;

const Icon = styled.img`
  width: 40px;
  margin-right: 20px;
`;

const IconName = styled.div`
  overflow: hidden;
  padding-right: 10px;
  text-overflow: ellipsis;
  margin-top: 8px;
`;

const StyledArrow = styled.img`
  margin-right: 30px;
  transform: ${props => (props.expanded ? 'rotate(0)' : 'rotate(-180deg)')};
  transition: transform 0.1s linear;
`;

const A = styled.a`
  display: inline-grid;
`;

const Td = styled.td`
  &:not(:first-of-type) {
    padding-left: 20px;
  }
`;

const Table = styled.table`
  font-size: 20px;
  padding-left: 40px;
  padding-top: 40px;
  padding-bottom: 20px;
  font-family: monospace;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const RemoveWrapper = styled.div`
  width: 100%;
  display: flex;
  margin-top: 30px;
  display: ${props => (props.showDevVaults ? 'inherit' : 'none')};
  justify-content: center;
`;

const truncateApy = apy => {
  if (!apy) {
    return 'N/A';
  }
  const truncatedApy = apy && apy.toFixed(2);
  const apyStr = `${truncatedApy}%`;
  return apyStr;
};

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
  const { vault, showDevVaults, active } = props;
  const vaultContractData = useSelector(selectContractData(vault.address));
  _.merge(vault, vaultContractData);
  const {
    symbolAlias,
    vaultIcon,
    tokenIcon,
    tokenAddress,
    tokenSymbolAlias,
    decimals,
    token,
    name,
    totalAssets,
    balance,
    balanceOf,
    address,
  } = vault;

  const devMode = useSelector(selectDevMode());
  const tokenContractData = useSelector(
    selectContractData(tokenAddress || token),
  );

  const tokenBalance = _.get(tokenContractData, 'balanceOf');
  const tokenSymbol = tokenSymbolAlias || _.get(tokenContractData, 'symbol');
  const vaultName = symbolAlias || tokenSymbol || name;

  const drizzle = useDrizzle();
  // const active = false;

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
  const contractType = getContractType(vault);

  const removeVault = () => {
    drizzle.deleteContract(address);
  };

  let vaultBottom;
  let vaultTop;
  if (showDevVaults) {
    const renderField = (val, key) => {
      let newVal = _.toString(val);
      const valIsAddress = /0[xX][0-9a-fA-F]{40}/.test(newVal);
      const valIsNumber = /^[0-9]*$/.test(newVal);
      if (valIsAddress) {
        newVal = (
          <A href={`https://etherscan.io/address/${newVal}`} target="_blank">
            {newVal}
          </A>
        );
      } else if (valIsNumber) {
        newVal = (
          <AnimatedNumber
            value={newVal}
            formatter={v => new BigNumber(v).toFixed(0)}
          />
        );
      }
      return (
        <tr key={key}>
          <Td>{key}</Td>
          <Td>{newVal}</Td>
        </tr>
      );
    };

    const strippedVault = _.omit(vault, ['group']);
    const fields = _.map(strippedVault, renderField);
    vaultBottom = (
      <Table>
        <tbody>{fields}</tbody>
      </Table>
    );
    vaultTop = (
      <ColumnListDev>
        <div>
          <IconAndName>
            <LinkWrap devMode={devMode} address={address}>
              <Icon src={vaultIcon || tokenIcon} />
            </LinkWrap>
            <LinkWrap devMode={devMode} address={address}>
              <IconName devMode={devMode}>{vaultName}</IconName>
            </LinkWrap>
          </IconAndName>
        </div>
        <div>{contractType}</div>
        <div>
          <AnimatedNumber value={vaultBalanceOf} />
        </div>
        <div>{vaultAssets}</div>
        <div>
          <AnimatedNumber value={tokenBalanceOf} />{' '}
          <LinkWrap devMode={devMode} address={tokenAddress}>
            {tokenSymbol}
          </LinkWrap>
        </div>
      </ColumnListDev>
    );
  } else {
    vaultBottom = null;
    vaultTop = (
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
    );
  }
  return (
    <React.Fragment>
      <Card className={active && 'active'}>
        <Accordion.Toggle as={Card.Header} variant="link" eventKey={address}>
          {vaultTop}
          <StyledArrow src={Arrow} alt="arrow" expanded={active} />
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={address}>
          <Card.Body>
            {vaultBottom}
            <Card.Footer className={active && 'active'}>
              <Footer>
                <VaultButtons vault={vault} token={tokenContractData} />
                <RemoveWrapper showDevVaults={showDevVaults}>
                  <ButtonFilledRed
                    variant="contained"
                    color="secondary"
                    onClick={removeVault}
                  >
                    Remove Contract
                  </ButtonFilledRed>
                </RemoveWrapper>
              </Footer>
            </Card.Footer>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </React.Fragment>
  );
};
Vault.whyDidYouRender = true;
export default compose(memo)(Vault);
