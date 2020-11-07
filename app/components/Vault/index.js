import React from 'react';
import styled from 'styled-components';
import AnimatedNumber from 'components/AnimatedNumber';
import { Accordion } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';

const Wrapper = styled.div`
  min-height: 70px;
  display: flex;
  align-items: center;
  max-width: 870px;
  margin: 0 auto;
  div {
    overflow: hidden;
    margin-right: 50px;
    text-overflow: ellipsis;
  }
`;

const IconAndName = styled.div`
  display: flex;
  align-items: center;
  width: 200px;
`;

const Icon = styled.img`
  width: 50px;
  margin-right: 20px;
`;

const Apy = styled.div`
  width: 100px;
`;

const Strategy = styled.div`
  width: 250px;
`;

const UserBalance = styled.div`
  width: 200px;
`;

const truncateApy = apy => {
  if (!apy) {
    return 'N/A';
  }
  const truncatedApy = apy && apy.toFixed(2);
  const apyStr = `${truncatedApy}%`;
  return apyStr;
};

export default function Vault(props) {
  const { vault } = props;
  const { vaultAlias, vaultIcon, tokenIcon, strategyName, balanceOf } = vault;
  const apyOneMonthSample = _.get(vault, 'apy.apyOneMonthSample');
  const apy = truncateApy(apyOneMonthSample);
  const vaultBalanceOf = (balanceOf / 10 ** 18).toFixed(0);
  return (
    <React.Fragment>
      <Card>
        <Accordion.Toggle
          as={Card.Header}
          variant="link"
          eventKey={vault.address}
        >
          <Wrapper>
            <IconAndName>
              <Icon src={vaultIcon || tokenIcon} />
              {vaultAlias}
            </IconAndName>
            <Strategy>{strategyName}</Strategy>
            <Apy>{apy}</Apy>
            <UserBalance>
              <AnimatedNumber value={vaultBalanceOf} />
            </UserBalance>
          </Wrapper>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={vault.address}>
          <Card.Body>Hello! Test</Card.Body>
        </Accordion.Collapse>
      </Card>
    </React.Fragment>
  );
}
